"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Metadata } from "next";
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
} from "lucide-react";
import { INITIAL_BLOG_POSTS } from "@/lib/blogData";

export default function BlogCatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = ["ALL", "Diş Hekimliği", "Beslenme & Diyet", "Güzellik & Kuaför", "Psikoloji & Terapi", "Hukuk & Danışmanlık"];

  const filteredPosts = INITIAL_BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "ALL" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-lg text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <CalendarDays className="w-4 h-4" />
            </div>
            <span>randevuformu<span className="text-indigo-400">.com</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/ornek"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Örnek Şablonlar
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 sm:py-16 w-full space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            SaaS Büyüme & Randevu Yönetimi Rehberi
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            İşletmenizi Büyütecek Randevu & Otomasyon Stratejileri
          </h1>
          <p className="text-xs sm:text-base text-slate-400">
            Kliniklerden güzellik salonlarına, diyetisyenlerden avukatlara kadar randevu süreçlerinizi optimize eden uzman rehberler.
          </p>

          {/* Search Input */}
          <div className="pt-4 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Konu, sektör veya anahtar kelime ara..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat === "ALL" ? "Tüm Makaleler" : cat}
            </button>
          ))}
        </div>

        {/* Blog Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1 shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
                    {post.category}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                >
                  Yazıyı Oku <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-slate-500 mt-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} randevuformu.com — Tüm Hakları Saklıdır.</span>
          <a href="mailto:randevuformuu@gmail.com" className="text-indigo-400 hover:underline">
            randevuformuu@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
