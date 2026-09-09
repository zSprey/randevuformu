import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { BlogPost, INITIAL_BLOG_POSTS } from "./blogData";

const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "";
const VERCEL_TOKEN = process.env.VERCEL_BEARER_TOKEN || "";
const EDGE_CONFIG_READ_URL = process.env.EDGE_CONFIG || "";
const STORAGE_KEY = "blog_posts";

// Memory cache for instant global response
let blogPostsMemoryCache: BlogPost[] | null = null;

/**
 * 1. GET ALL BLOG POSTS (Triple Layer: Memory -> Edge Config -> Supabase -> Local Seed)
 */
export async function getAllBlogPosts(skipCache: boolean = false): Promise<BlogPost[]> {
  // A. Try Memory Cache
  if (!skipCache && blogPostsMemoryCache && blogPostsMemoryCache.length > 0) {
    return blogPostsMemoryCache;
  }

  let edgePosts: BlogPost[] = [];

  // B. Try Edge Config (Instant Global Read)
  if (EDGE_CONFIG_READ_URL) {
    try {
      const res = await fetch(EDGE_CONFIG_READ_URL, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        const list = data?.items?.[STORAGE_KEY] || data?.[STORAGE_KEY];
        if (Array.isArray(list) && list.length > 0) {
          edgePosts = list;
        }
      }
    } catch (e) {
      console.warn("[blogStore] EdgeConfig Read error:", e);
    }
  }

  // C. Try Supabase
  let dbPosts: BlogPost[] = [];
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      dbPosts = data.map((p: any) => ({
        id: p.id || `db-${p.slug}`,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category || "Genel",
        author: p.author || "randevuformu.com AI Editörü",
        readTime: p.read_time || "5 dk okuma",
        publishDate: p.created_at
          ? new Date(p.created_at).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Bugün",
        featuredImage: p.featured_image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
        tags: Array.isArray(p.tags) ? p.tags : ["Randevu Yazılımı", "SaaS"],
        faqs: Array.isArray(p.faq_items) ? p.faq_items : [],
      }));
    }
  } catch (err) {
    console.warn("[blogStore] Supabase blog query error:", err);
  }

  // D. Merge all sources, prioritizing newest, deduplicating by slug
  const slugMap = new Map<string, BlogPost>();

  // 1. Edge posts (highest priority for new cron posts)
  for (const post of edgePosts) {
    if (post && post.slug) slugMap.set(post.slug, post);
  }

  // 2. Supabase posts
  for (const post of dbPosts) {
    if (post && post.slug && !slugMap.has(post.slug)) slugMap.set(post.slug, post);
  }

  // 3. Initial baseline posts
  for (const post of INITIAL_BLOG_POSTS) {
    if (post && post.slug && !slugMap.has(post.slug)) slugMap.set(post.slug, post);
  }

  const merged = Array.from(slugMap.values());
  blogPostsMemoryCache = merged;
  return merged;
}

/**
 * 2. SAVE OR UPDATE A BLOG POST (Persistent Edge Config + Supabase + Revalidation)
 */
export async function saveBlogPost(post: BlogPost): Promise<boolean> {
  const currentPosts = await getAllBlogPosts(true);
  const updatedPosts = [
    post,
    ...currentPosts.filter((p) => p.slug !== post.slug),
  ];

  blogPostsMemoryCache = updatedPosts;

  // A. Save to Edge Config
  if (EDGE_CONFIG_ID && VERCEL_TOKEN) {
    try {
      const patchRes = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              operation: "upsert",
              key: STORAGE_KEY,
              value: updatedPosts,
            },
          ],
        }),
      });

      if (!patchRes.ok) {
        console.warn("[blogStore] EdgeConfig write returned non-200:", patchRes.status);
      }
    } catch (err) {
      console.warn("[blogStore] EdgeConfig write exception:", err);
    }
  }

  // B. Save to Supabase (Best effort)
  try {
    await supabase.from("blog_posts").upsert({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: post.author,
      read_time: post.readTime,
      featured_image: post.featuredImage,
      tags: post.tags,
      faq_items: post.faqs,
    });
  } catch (dbErr) {
    console.warn("[blogStore] Supabase save warning:", dbErr);
  }

  // C. Invalidate Next.js cache
  try {
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/sitemap.xml");
  } catch (revalErr) {
    console.warn("[blogStore] Revalidate warning:", revalErr);
  }

  return true;
}

/**
 * 3. GET BLOG POST BY SLUG
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = await getAllBlogPosts();
  return allPosts.find((p) => p.slug === slug) || null;
}

