"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building2,
  Phone,
  Clock,
} from "lucide-react";

interface MarketplaceBusiness {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  district: string;
  rating: number;
  reviewCount: number;
  featuredService: string;
  priceText: string;
  image: string;
  isVerified: boolean;
  nextAvailableSlot: string;
}

const MARKETPLACE_BUSINESSES: MarketplaceBusiness[] = [
  {
    id: "mb-1",
    name: "Dr. Ahmet Yılmaz Diş Kliniği",
    slug: "dr-ahmet",
    category: "Diş Hekimliği",
    city: "İstanbul",
    district: "Kadıköy / Moda",
    rating: 4.9,
    reviewCount: 142,
    featuredService: "Zirkonyum Kaplama & Estetik",
    priceText: "₺1.500'den başlayan",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80",
    isVerified: true,
    nextAvailableSlot: "Bugün 14:30",
  },
  {
    id: "mb-2",
    name: "Studio Nova Kuaför & Estetik",
    slug: "studio-nova",
    category: "Güzellik & Kuaför",
    city: "İstanbul",
    district: "Nişantaşı",
    rating: 4.8,
    reviewCount: 98,
    featuredService: "Ombre & Keratin Bakımı",
    priceText: "₺850'den başlayan",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80",
    isVerified: true,
    nextAvailableSlot: "Yarın 11:00",
  },
  {
    id: "mb-3",
    name: "Dyt. Ayşe Kaya Beslenme Danışmanlığı",
    slug: "dyt-ayse",
    category: "Beslenme & Diyet",
    city: "Ankara",
    district: "Çankaya",
    rating: 5.0,
    reviewCount: 76,
    featuredService: "Online Kilo Verme Programı",
    priceText: "₺1.200'den başlayan",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80",
    isVerified: true,
    nextAvailableSlot: "Bugün 16:00 (Online Meet)",
  },
  {
    id: "mb-4",
    name: "Psk. Mehmet Demir Klinik Psikoloji",
    slug: "psk-mehmet",
    category: "Psikoloji & Terapi",
    city: "İzmir",
    district: "Alsancak",
    rating: 4.9,
    reviewCount: 84,
    featuredService: "Bireysel Psikoterapi",
    priceText: "₺1.800'den başlayan",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    isVerified: true,
    nextAvailableSlot: "Yarın 15:30",
  },
  {
    id: "mb-5",
    name: "Fzt. Burak Özçelik Manuel Terapi",
    slug: "fzt-burak",
    category: "Fizyoterapi & Spor",
    city: "Bursa",
    district: "Nilüfer",
    rating: 4.8,
    reviewCount: 52,
    featuredService: "Omurga & Bel Tedavisi",
    priceText: "₺1.400'den başlayan",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
    isVerified: true,
    nextAvailableSlot: "Cuma 10:00",
  },
  {
    id: "mb-6",
    name: "Pati Park Veteriner Kliniği",
    slug: "pati-park",
    category: "Veteriner Hekimlik",
    city: "Antalya",
    district: "Muratpaşa",
    rating: 4.9,
    reviewCount: 110,
    featuredService: "Genel Muayene & Aşı Takvimi",
    priceText: "₺600'den başlayan",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80",
    isVerified: true,
    nextAvailableSlot: "Bugün 17:00",
  },
];

export default function MarketplaceDiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const cities = ["ALL", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];
  const categories = ["ALL", "Diş Hekimliği", "Güzellik & Kuaför", "Beslenme & Diyet", "Psikoloji & Terapi", "Fizyoterapi & Spor", "Veteriner Hekimlik"];

  const filteredBusinesses = MARKETPLACE_BUSINESSES.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.featuredService.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = selectedCity === "ALL" || b.city === selectedCity;
    const matchesCategory = selectedCategory === "ALL" || b.category === selectedCategory;

    return matchesSearch && matchesCity && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col justify-between selection:bg-slate-700 selection:text-white font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080C14]/90 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-base text-white">
            <div className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-sm">
              <Compass className="w-4 h-4 text-slate-950" />
            </div>
            <span>randevuformu<span className="text-slate-400 font-normal">.com</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Blog & Rehberler
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 shadow-sm transition-colors"
            >
              İşletmenizi Ekleyin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full space-y-10">
        {/* Hero Search */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Doğrulanmış Sağlık & Hizmet Dizini
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Şehrinizdeki seçkin uzmanlardan doğrudan online randevu alın.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Telefon trafiğine takılmadan hekiminizi ve müsait saatinizi seçin, 30 saniye içinde randevunuzu kesinleştirin.
          </p>

          {/* Search Box */}
          <div className="pt-3 max-w-xl mx-auto relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Uzman adı, klinik, semt veya tedavi ara (Örn: Diş hekimi, Kadıköy)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-slate-600 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* City & Category Filters */}
        <div className="space-y-2.5">
          {/* City Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" /> Şehir:
            </span>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedCity === city
                    ? "bg-white text-slate-950 shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {city === "ALL" ? "Tüm Şehirler" : city}
              </button>
            ))}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {cat === "ALL" ? "Tüm Branşlar" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((b) => (
            <div
              key={b.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between overflow-hidden group shadow-xl hover:-translate-y-1"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                <img
                  src={b.image}
                  alt={b.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  {b.city}, {b.district}
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-[10px] font-black text-slate-950 flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-slate-950" />
                  {b.rating} ({b.reviewCount})
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-600/80 text-white font-bold text-[11px] backdrop-blur-md">
                    {b.category}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {b.nextAvailableSlot}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {b.name}
                    </h2>
                    {b.isVerified && (
                      <span title="Doğrulanmış İşletme">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{b.featuredService}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Fiyat Seviyesi
                    </span>
                    <div className="text-xs font-bold text-white">{b.priceText}</div>
                  </div>

                  <Link
                    href={`/${b.slug}`}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    Randevu Al <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Marketplace Bottom CTA */}
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-r from-indigo-950/80 via-purple-950/40 to-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Siz de Kliniğinizi veya Salonunuzu Ekleyin
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              randevuformu.com dizininde listelenerek her ay binlerce yeni hastaya ve müşteriye doğrudan ulaşın.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 items-center gap-2 transition-all hover:scale-105"
          >
            Hemen Ücretsiz Katılın <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} randevuformu.com — Türkiye'nin Lider Randevu Ağı</span>
          <a href="mailto:randevuformuu@gmail.com" className="text-indigo-400 hover:underline">
            randevuformuu@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
