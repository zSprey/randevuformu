"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Copy,
  MessageCircle,
  BookOpen,
  Send,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BlogPost } from "@/lib/blogData";

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
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-[#0062FF]/10 selection:text-[#0062FF] flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Scroll Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-[#0062FF] z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0F2A4A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm Makaleler</span>
          </Link>
          <Link href="/" className="font-extrabold text-base text-[#0F2A4A] flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <span>randevuformu<span className="text-[#0062FF]">.com</span></span>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0062FF] hover:bg-[#0051d4] text-white shadow-xs transition-all"
          >
            Giriş Yap
          </Link>
        </div>
      </header>

      {/* Content Body */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Column */}
          <article className="lg:col-span-8 space-y-6">
            {/* Header info */}
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0062FF] font-semibold text-[11px]">
                  {post.category}
                </span>
                <span className="text-slate-400 flex items-center gap-1 font-medium text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {post.readTime}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 text-[11px]">{post.publishDate}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F2A4A] tracking-tight leading-[1.2]">
                {post.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {post.excerpt}
              </p>

              {/* Author & Share Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2A4A] flex items-center justify-center font-bold text-white text-xs">
                    RF
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#0F2A4A]">{post.author}</div>
                    <div className="text-[10px] text-slate-400">randevuformu.com Strateji Ekibi</div>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 mr-1">Paylaş:</span>
                  <button
                    type="button"
                    onClick={shareOnWhatsApp}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    title="WhatsApp'ta Paylaş"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={shareOnTwitter}
                    className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                    title="X'te Paylaş"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={shareOnLinkedIn}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    title="LinkedIn'de Paylaş"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors relative"
                    title="Bağlantıyı Kopyala"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedLink && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#0F2A4A] text-white text-[10px] font-semibold whitespace-nowrap shadow-md">
                        Kopyalandı!
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Article Content formatted */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 pt-2">
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/\n\n/g, "<p class='mb-4 text-slate-700 leading-relaxed text-sm'>")
                    .replace(/### (.*?)\n/g, "<h3 class='text-base font-bold text-[#0F2A4A] mt-6 mb-2 flex items-center gap-2'>$1</h3>")
                    .replace(/## (.*?)\n/g, "<h2 class='text-xl sm:text-2xl font-bold text-[#0F2A4A] mt-8 mb-3 pb-2 border-b border-slate-100'>$1</h2>")
                    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-slate-900 font-bold'>$1</strong>"),
                }}
              />
            </div>

            {/* FAQ Accordion */}
            {post.faqs.length > 0 && (
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <h2 className="text-lg font-bold text-[#0F2A4A] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#0062FF]" /> Sıkça Sorulan Sorular
                </h2>
                <div className="space-y-2.5">
                  {post.faqs.map((faq, i) => {
                    const isOpen = activeFaqIndex === i;
                    return (
                      <div
                        key={i}
                        className="rounded-xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveFaqIndex(isOpen ? null : i)}
                          className="w-full p-3.5 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-[#0F2A4A] hover:text-[#0062FF] transition-colors"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                              isOpen ? "rotate-180 text-[#0062FF]" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5"
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
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold hover:bg-slate-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author Bio Box */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 flex items-start gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#0F2A4A] flex items-center justify-center font-bold text-white text-sm shrink-0">
                RF
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0F2A4A]">{post.author}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  randevuformu.com Türkiye&apos;deki klinik, salon ve profesyonellerin randevu ve tahsilat süreçlerini otomatize eden yeni nesil rezervasyon platformudur.
                </p>
              </div>
            </div>
          </article>

          {/* Sticky Sidebar CTA */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="sticky top-20 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="inline-flex p-2.5 rounded-xl bg-blue-50 text-[#0062FF]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F2A4A] leading-snug">
                Siz de 1 Dakikada Kendi Randevu Formunuzu Açın
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kredi kartı gerekmez. Diş hekimi, diyetisyen, kuaför veya danışmanlığınız için ücretsiz başlayın.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Google Takvim 2 Yönlü Eşitleme</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Otomatik WhatsApp & SMS Teyidi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>İyzico Yerli POS & Kapora</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                Hemen Ücretsiz Başla <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-14 pt-8 border-t border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-[#0F2A4A] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0062FF]" /> İlgili Diğer Rehberler
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.id}
                  href={`/blog/${rPost.slug}`}
                  className="p-5 rounded-xl bg-white border border-slate-200/90 hover:border-[#0062FF]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0062FF]">
                      {rPost.category}
                    </span>
                    <h4 className="font-bold text-xs text-[#0F2A4A] group-hover:text-[#0062FF] transition-colors leading-snug">
                      {rPost.title}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-[#0062FF] flex items-center gap-1">
                    İncele <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} randevuformu.com — Tüm Hakları Saklıdır.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-800 transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/blog" className="hover:text-slate-800 transition-colors">
              Blog Dizini
            </Link>
            <a href="mailto:destek@randevuformu.com" className="text-[#0062FF] hover:underline">
              destek@randevuformu.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
