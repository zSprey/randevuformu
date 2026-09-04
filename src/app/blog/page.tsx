"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  BookOpen,
  Search,
  ArrowRight,
  Clock,
  X,
  Menu,
  CheckCircle2,
  Mail,
  Send,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { INITIAL_BLOG_POSTS, BlogPost } from "@/lib/blogData";

export default function BlogCatalogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Buluttan otonom üretilen yeni makaleleri dinamik getir
  useEffect(() => {
    async function fetchDynamicPosts() {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts);
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic blog posts:", err);
      }
    }
    fetchDynamicPosts();
  }, []);

  const categories = [
    "ALL",
    "Diş Hekimliği",
    "Beslenme & Diyet",
    "Güzellik & Kuaför",
    "Veteriner Hekimlik",
    "Fizyoterapi & Pilates",
    "Psikoloji & Terapi",
    "Hukuk & Danışmanlık",
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "ALL" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredPost = posts[0] || INITIAL_BLOG_POSTS[0];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-[#0062FF]/10 selection:text-[#0062FF] flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Randevu Formu Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0F2A4A]">
              randevuformu<span className="text-[#0062FF]">.com</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-[#0F2A4A] transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/ornek" className="hover:text-[#0F2A4A] transition-colors">
              Örnek Şablonlar
            </Link>
            <Link href="/calendar" className="hover:text-[#0F2A4A] transition-colors">
              Takvim Paneli
            </Link>
            <Link href="/contact" className="hover:text-[#0F2A4A] transition-colors">
              İletişim
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#0062FF] hover:bg-[#0051d4] text-white shadow-xs transition-all"
            >
              Giriş Yap
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0062FF] text-white shadow-xs"
            >
              Giriş
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-lg"
            >
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/ornek"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Örnek Şablonlar
              </Link>
              <Link
                href="/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Takvim Paneli
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                İletişim & B2B
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full space-y-12">
        {/* Hero & Search */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#0062FF] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            SaaS Büyüme & Randevu Yönetimi Strateji Rehberi
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0F2A4A] tracking-tight leading-[1.15]">
            İşletmenizi Büyütecek Randevu & Otomasyon Rehberleri
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Kliniklerden güzellik merkezlerine, diyetisyenlerden danışmanlara kadar randevu trafiğinizi otomatikleştiren uzman makaleleri.
          </p>

          {/* Search Input */}
          <div className="pt-2 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Konu, sektör veya anahtar kelime ara..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-[#0062FF] focus:ring-1 focus:ring-[#0062FF] shadow-2xs transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-semibold">
            {filteredPosts.length} makale listeleniyor
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#0F2A4A] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                {cat === "ALL" ? "✨ Tüm Makaleler" : cat}
              </button>
            );
          })}
        </div>

        {/* Featured Spotlight Card (If viewing ALL and no search) */}
        {selectedCategory === "ALL" && !searchTerm && featuredPost && (
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-[#0062FF]/40 transition-all">
            <div className="max-w-2xl space-y-3.5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Öne Çıkan Başucu Rehberi
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A4A] tracking-tight leading-tight group-hover:text-[#0062FF] transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {featuredPost.excerpt}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white text-xs font-semibold shadow-xs transition-all"
                >
                  Yazıyı Oku <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-xs text-slate-400">{featuredPost.publishDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Blog Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#0F2A4A]">Sonuç Bulunamadı</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                &ldquo;{searchTerm}&rdquo; aramasına uygun makale bulunamadı. Farklı anahtar kelimeler deneyebilir veya tüm makaleleri listeleyebilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-[#0062FF]/40 transition-all flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0062FF] border border-blue-200/60 font-semibold text-[11px]">
                      {post.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-medium text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[#0F2A4A] group-hover:text-[#0062FF] transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {post.publishDate}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0062FF] hover:text-[#0051d4] transition-colors"
                  >
                    <span>Oku</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Newsletter Subscription Box */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-50/70 via-white to-slate-50 border border-blue-200/60 shadow-xs text-center space-y-4">
          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-[#0062FF] text-[11px] font-semibold">
              <Mail className="w-3.5 h-3.5" />
              Haftalık Büyüme Bülteni
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0F2A4A]">
              Sektörünüz İçin En Yeni Randevu Taktiklerini Kaçırmayın
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Her hafta hekimler, danışmanlar ve salon sahipleri için hazırladığımız randevu kaçırmayı önleme ve gelir artırma ipuçları e-posta kutunuza gelsin.
            </p>
          </div>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Teşekkürler! Bültene başarıyla abone oldunuz.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="E-posta adresiniz..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0062FF] focus:ring-1 focus:ring-[#0062FF] shadow-2xs"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0051d4] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Abone Ol</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} randevuformu.com — Tüm Hakları Saklıdır.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-800 transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/ornek" className="hover:text-slate-800 transition-colors">
              Örnek Şablonlar
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
