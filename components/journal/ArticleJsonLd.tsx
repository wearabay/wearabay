type Props = {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  url: string;
  storeName: string;
};

export default function ArticleJsonLd({
  title,
  description,
  image,
  publishedAt,
  url,
  storeName,
}: Props) {

  const jsonLd = {
    "@context": "https://schema.org",

    "@type": "Article",

    headline: title,

    description,

    image: [
      image,
    ],

    author: {
      "@type": "Organization",
      name: storeName,
    },

    publisher: {
      "@type": "Organization",
      name: storeName,
    },

    datePublished: publishedAt,

    mainEntityOfPage: url,
  };


  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}