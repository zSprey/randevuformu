import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { INITIAL_BLOG_POSTS } from "@/lib/blogData";
import BlogDetailClient from "./BlogDetailClient";

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

  const relatedPosts = INITIAL_BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <BlogDetailClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
