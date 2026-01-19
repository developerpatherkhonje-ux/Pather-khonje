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

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
    </Helmet>
  );
};

export default SEO;
