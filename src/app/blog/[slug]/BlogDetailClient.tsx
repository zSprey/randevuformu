"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  ChevronDown,
  Copy,
  MessageCircle,
  BookOpen,
  Send,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BlogPost, INITIAL_BLOG_POSTS } from "@/lib/blogData";

interface BlogDetailClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogDetailClient({ post, relatedPosts }: BlogDetailClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const shareOnWhatsApp = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          post.title + " " + window.location.href
        )}`,
        "_blank"
      );
    }
  };

  const shareOnTwitter = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          post.title
        )}&url=${encodeURIComponent(window.location.href)}`,
        "_blank"
      );
    }
  };

  const shareOnLinkedIn = () => {
    if (typeof window !== "undefined") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          window.location.href
        )}`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Scroll Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070B12]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm Makaleler</span>
          </Link>
          <Link href="/" className="font-extrabold text-lg text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs">
              <CalendarDays className="w-4 h-4" />
            </div>
            <span>randevuformu<span className="text-indigo-400">.com</span></span>
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
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Main Article Column */}
          <article className="lg:col-span-8 space-y-8">
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                  {post.category}
                </span>
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> {post.readTime}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{post.publishDate}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.18]">
                {post.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal bg-white/5 p-4 rounded-2xl border border-white/10">
                {post.excerpt}
              </p>

              {/* Author & Share Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                    RF
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{post.author}</div>
                    <div className="text-[11px] text-slate-400">randevuformu.com Strateji Masası</div>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 mr-1">Paylaş:</span>
                  <button
                    type="button"
                    onClick={shareOnWhatsApp}
                    className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                    title="WhatsApp'ta Paylaş"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={shareOnTwitter}
                    className="p-2 rounded-xl bg-sky-600/20 text-sky-400 hover:bg-sky-600 hover:text-white transition-colors"
                    title="X'te Paylaş"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={shareOnLinkedIn}
                    className="p-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                    title="LinkedIn'de Paylaş"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors relative"
                    title="Bağlantıyı Kopyala"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedLink && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold whitespace-nowrap shadow-lg">
                        Kopyalandı!
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Article Content formatted */}
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-6 pt-2">
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/\n\n/g, "<p class='mb-4 text-slate-300 leading-relaxed text-sm'>")
                    .replace(/### (.*?)\n/g, "<h3 class='text-lg font-bold text-white mt-8 mb-3 flex items-center gap-2'>$1</h3>")
                    .replace(/## (.*?)\n/g, "<h2 class='text-xl sm:text-2xl font-black text-indigo-300 mt-10 mb-4 pb-2 border-b border-white/10'>$1</h2>")
                    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-bold'>$1</strong>"),
                }}
              />
            </div>

            {/* FAQ Accordion */}
            {post.faqs.length > 0 && (
              <div className="pt-8 border-t border-slate-800 space-y-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" /> Sıkça Sorulan Sorular
                </h2>
                <div className="space-y-3">
                  {post.faqs.map((faq, i) => {
                    const isOpen = activeFaqIndex === i;
                    return (
                      <div
                        key={i}
                        className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveFaqIndex(isOpen ? null : i)}
                          className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-indigo-300 transition-colors"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-indigo-400 shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3"
                            >
                              {faq.answer}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold hover:border-indigo-500/40 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author Bio Box */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-start gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
                RF
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">{post.author}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  randevuformu.com Türkiye&apos;deki klinik, salon ve profesyonellerin randevu ve tahsilat süreçlerini otomatize eden yeni nesil rezervasyon platformudur.
                </p>
              </div>
            </div>
          </article>

          {/* Sticky Sidebar CTA */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-950/90 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-5 shadow-2xl">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white leading-snug">
                Siz de 1 Dakikada Kendi Randevu Formunuzu Açın
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kredi kartı gerekmez. Diş hekimi, diyetisyen, avukat veya kuaförünüz için hemen ücretsiz başlayın.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google Takvim 2 Yönlü Eşitleme</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Otomatik WhatsApp & SMS Teyidi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>İyzico Yerli POS & Kapora</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                Hemen Ücretsiz Başla <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/10 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> İlgili Diğer Rehberler
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.id}
                  href={`/blog/${rPost.slug}`}
                  className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                      {rPost.category}
                    </span>
                    <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors leading-snug">
                      {rPost.title}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                    İncele <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-slate-500 mt-16 bg-[#05080E]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} randevuformu.com — Tüm Hakları Saklıdır.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog Dizini
            </Link>
            <a href="mailto:randevuformuu@gmail.com" className="text-indigo-400 hover:underline">
              randevuformuu@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
