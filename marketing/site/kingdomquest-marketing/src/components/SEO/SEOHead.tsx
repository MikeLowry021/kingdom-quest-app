import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEOHead = ({ 
  title = "KingdomQuest - Christian Educational App for Children | Biblical Stories & Learning",
  description = "Transform your child's spiritual journey with KingdomQuest - the premier Christian educational app featuring interactive Bible stories, quizzes, and family devotions. Safe, engaging, and church-approved learning for children of all ages.",
  image = "/og-image.svg",
  url = "https://kingdomquest.app"
}: SEOHeadProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KingdomQuest",
    "description": description,
    "url": url,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "iOS, Android, Web",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "ZAR",
      "lowPrice": "0",
      "highPrice": "199.99"
    },
    "author": {
      "@type": "Organization",
      "name": "KingdomQuest"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Children, Families, Churches"
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="Christian app for kids, Bible stories for children, Christian education, Sunday school app, Biblical learning, family devotions, church app, Christian games, Bible quiz, spiritual growth kids" />
      <meta name="author" content="KingdomQuest" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="KingdomQuest" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3B82F6" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
