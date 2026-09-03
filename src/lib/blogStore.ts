import { supabase } from "@/lib/supabase";
import { BlogPost, INITIAL_BLOG_POSTS } from "./blogData";

/**
 * Tüm blog yazılarını Supabase ve yerel kaynaklardan dinamik olarak çeker
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data: dbPosts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && dbPosts && dbPosts.length > 0) {
      const formattedDbPosts: BlogPost[] = dbPosts.map((p: any) => ({
        id: p.id || `db-${p.slug}`,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category || "Genel",
        author: p.author || "randevuformu.com AI Araştırma Ekibi",
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

      // Birleştir ve aynı slug'ları tekilleştir
      const slugSet = new Set<string>();
      const combined: BlogPost[] = [];

      for (const p of [...formattedDbPosts, ...INITIAL_BLOG_POSTS]) {
        if (!slugSet.has(p.slug)) {
          slugSet.add(p.slug);
          combined.push(p);
        }
      }

      return combined;
    }
  } catch (err) {
    console.warn("[blogStore] Supabase blog query error:", err);
  }

  return INITIAL_BLOG_POSTS;
}

/**
 * Slug'a göre tekil blog yazısını getirir
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = await getAllBlogPosts();
  return allPosts.find((p) => p.slug === slug) || null;
}
