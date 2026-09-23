/* eslint-disable react/prop-types */
import React from "react";
import { Helmet } from "react-helmet-async";
import { config } from "../config/config";

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  jsonLd,
}) => {
  const siteTitle = config.APP_NAME || "Pather Khonje";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteDescription =
    description ||
    "Travel experiences, thoughtfully curated. Comfortable camps, exquisite resorts, and cozy homestays selected for your delight.";
  const siteKeywords = keywords
    ? `${keywords}, travel, tourism, sikkim, darjeeling`
    : "travel, tourism, sikkim, darjeeling, hotels, packages, homestays, resorts";

  // Construct absolute URL for image if it's a relative path
  const getAbsoluteUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const origin = window.location.origin;
    return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const siteUrl = url || window.location.href;
  const siteImage = getAbsoluteUrl(image || "/logo.png"); // Assuming logo.png is in public folder, or use a specific SEO image
  const canonicalUrl = siteUrl.split("#")[0];
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteTitle,
    url: window.location.origin,
    logo: getAbsoluteUrl("/logo/Pather Khonje Logo.png"),
    image: siteImage,
    telephone: config.COMPANY?.phone,
    email: config.COMPANY?.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "64/2/12, Biren Roy Road (East), Behala Chowrasta",
      addressLocality: "Kolkata",
      postalCode: "700008",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61577923149985",
      "https://www.instagram.com/patherkhonje",
    ],
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteTitle,
    url: window.location.origin,
    potentialAction: {
      "@type": "SearchAction",
      target: `${window.location.origin}/packages?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const schemas = [organizationSchema, websiteSchema, ...(jsonLd ? [jsonLd] : [])];

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="author" content="Pather Khonje" />
      <meta name="publisher" content="Pather Khonje" />
      <meta name="theme-color" content="#0A2E4D" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@patherkhonje" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
      <script type="application/ld+json">{JSON.stringify(schemas)}</script>
    </Helmet>
  );
};

export default SEO;
