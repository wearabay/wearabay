"use client";

import { useMemo, useState } from "react";

import JournalHero from "@/components/journal/JournalHero";
import FeaturedArticle from "@/components/journal/FeaturedArticle";
import CategoryTabs from "@/components/journal/CategoryTabs";
import ArticleGrid from "@/components/journal/ArticleGrid";
import NewsletterBanner from "@/components/journal/NewsletterBanner";

import {
  featuredArticle,
  journalArticles,
} from "@/data/journal";

import type {
  JournalCategory,
} from "@/types/journal";


type Props = {
  storeName: string;
};


export default function JournalPageClient({
  storeName,
}: Props) {

  const [category, setCategory] =
    useState<JournalCategory | "All">("All");


  const filteredArticles =
    useMemo(() => {

      return journalArticles.filter((article) => {

        if (article.featured) {
          return false;
        }

        if (category === "All") {
          return true;
        }

        return article.category === category;

      });

    }, [category]);


  return (

    <main className="bg-white">

      <JournalHero
        storeName={storeName}
      />


      <FeaturedArticle
        article={featuredArticle}
      />


      <CategoryTabs
        value={category}
        onChange={setCategory}
      />


      <ArticleGrid
        articles={filteredArticles}
      />


      <NewsletterBanner />

    </main>

  );

}