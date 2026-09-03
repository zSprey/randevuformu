"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Sparkles,
  BookOpen,
  Search,
  ArrowRight,
  Clock,
  User,
  Tag,
  ShieldCheck,
  Building2,
  Share2,
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
  React.useEffect(() => {
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
    <div className="min-h-screen bg-[#070B12] text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-indigo-600/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-purple-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070B12]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              randevuformu<span className="text-indigo-400">.com</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/ornek" className="hover:text-white transition-colors">
              Örnek Şablonlar
            </Link>
            <Link href="/calendar" className="hover:text-white transition-colors">
              Takvim Paneli
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              İletişim
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30"
            >
              Ücretsiz Başla
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow"
            >
              Giriş
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
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
              className="md:hidden bg-[#0B0F17]/95 border-b border-white/10 backdrop-blur-xl px-4 py-4 space-y-3"
            >
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/ornek"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Örnek Şablonlar
              </Link>
              <Link
                href="/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Takvim Paneli
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                İletişim & B2B
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full space-y-16">
        {/* Hero & Search */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            SaaS Büyüme & Randevu Yönetimi Strateji Rehberi
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
            İşletmenizi Büyütecek Randevu & Otomasyon Stratejileri
          </h1>
          <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Kliniklerden güzellik merkezlerine, diyetisyenlerden avukatlara kadar randevu trafiğinizi %80 otomatikleştiren uzman rehberler.
          </p>

          {/* Search Input */}
          <div className="pt-4 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Konu, sektör veya anahtar kelime ara..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xl transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-semibold">
            {filteredPosts.length} makale listeleniyor
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105 border border-indigo-400/40"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                {cat === "ALL" ? "✨ Tüm Makaleler" : cat}
              </button>
            );
          })}
        </div>

        {/* Featured Spotlight Card (If viewing ALL and no search) */}
        {selectedCategory === "ALL" && !searchTerm && featuredPost && (
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/50 border border-indigo-500/30 shadow-2xl relative overflow-hidden group hover:border-indigo-400/50 transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-64 h-64 text-indigo-400" />
            </div>

            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Öne Çıkan Başucu Rehberi
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {featuredPost.excerpt}
              </p>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  Yazıyı Oku <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-xs text-slate-400">{featuredPost.publishDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Blog Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Sonuç Bulunamadı</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                &ldquo;{searchTerm}&rdquo; aramasına uygun makale bulunamadı. Farklı anahtar kelimeler deneyebilir veya tüm makaleleri listeleyebilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("ALL");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1.5 shadow-xl hover:shadow-indigo-950/40"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
                      {post.category}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {post.publishDate}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                  >
                    <span>Yazıyı Oku</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Newsletter Subscription Box */}
        <section className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-2xl text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Mail className="w-3.5 h-3.5" />
              Haftalık Büyüme Bülteni
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Sektörünüz İçin En Yeni Randevu Taktiklerini Kaçırmayın
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Her hafta hekimler, danışmanlar ve salon sahipleri için hazırladığımız no-show önleme ve gelir artırma ipuçları e-posta kutunuza gelsin.
            </p>
          </div>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Teşekkürler! Bültene başarıyla abone oldunuz.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="E-posta adresiniz..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Abone Ol</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-slate-500 mt-16 bg-[#05080E]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} randevuformu.com — Tüm Hakları Saklıdır.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Ana Sayfa
            </Link>
            <Link href="/ornek" className="hover:text-white transition-colors">
              Örnek Şablonlar
            </Link>
            <a href="mailto:destek@randevuformu.com" className="text-indigo-400 hover:underline">
              destek@randevuformu.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
