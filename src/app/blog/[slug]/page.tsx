import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  CalendarDays,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Share2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { INITIAL_BLOG_POSTS } from "@/lib/blogData";
import SchemaMarkup from "@/components/SchemaMarkup";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return INITIAL_BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = INITIAL_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Makale Bulunamadı | randevuformu.com" };
  }

  return {
    title: `${post.title} | randevuformu.com`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: `https://randevuformu.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://randevuformu.com/blog/${post.slug}`,
      images: [{ url: post.featuredImage }],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = INITIAL_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Article JSON-LD Schema
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: "2026-08-28T00:00:00+03:00",
    dateModified: "2026-08-28T00:00:00+03:00",
    author: {
      "@type": "Organization",
      name: "randevuformu.com Ekibi",
      url: "https://randevuformu.com",
    },
    publisher: {
      "@type": "Organization",
      name: "randevuformu.com",
      logo: {
        "@type": "ImageObject",
        url: "https://randevuformu.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://randevuformu.com/blog/${post.slug}`,
    },
  };

  // FAQPage Schema
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm Makaleler</span>
          </Link>
          <Link href="/" className="font-black text-lg text-white">
            randevuformu<span className="text-indigo-400">.com</span>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Ücretsiz Başla
          </Link>
        </div>
      </header>

      {/* Content Body */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Article Column */}
          <article className="lg:col-span-8 space-y-8">
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
                  {post.category}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readTime}
                </span>
                <span className="text-slate-500">{post.publishDate}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {post.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                {post.excerpt}
              </p>
            </div>

            {/* Article Content formatted */}
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-6 pt-4 border-t border-slate-800">
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/\n\n/g, "<p class='mb-4 text-slate-300 leading-relaxed'>")
                    .replace(/### (.*?)\n/g, "<h3 class='text-lg font-bold text-white mt-6 mb-2'>$1</h3>")
                    .replace(/## (.*?)\n/g, "<h2 class='text-xl font-black text-indigo-300 mt-8 mb-3'>$1</h2>")
                    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-bold'>$1</strong>"),
                }}
              />
            </div>

            {/* FAQ Accordion */}
            {post.faqs.length > 0 && (
              <div className="pt-8 border-t border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" /> Sıkça Sorulan Sorular
                </h2>
                <div className="space-y-3">
                  {post.faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
                    >
                      <h3 className="font-bold text-xs sm:text-sm text-white">
                        {faq.question}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>

          {/* Sticky Sidebar CTA */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 p-6 rounded-3xl bg-gradient-to-b from-indigo-950/80 to-slate-900 border border-indigo-500/30 space-y-4 shadow-2xl">
              <div className="inline-flex p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Siz de 1 Dakikada Kendi Randevu Formunuzu Açın
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kredi kartı gerekmez. Diş hekimi, diyetisyen, avukat veya kuaförünüz için hemen ücretsiz başlayın.
              </p>
              <Link
                href="/login"
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                Hemen Ücretsiz Başla <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-slate-500 mt-16">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} randevuformu.com</span>
          <a href="mailto:randevuformuu@gmail.com" className="text-indigo-400 hover:underline">
            randevuformuu@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
