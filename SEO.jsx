import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, keywords, ogImage, schema }) => {
  const defaultTitle = "RigCraft - Custom PC Builder & eCommerce";
  const defaultDescription =
    "Build your dream PC with RigCraft. An intelligent PC builder, prebuilt gaming rigs, and a huge catalog of components. Your one-stop shop for PC hardware.";
  const siteName = "RigCraft";

  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook metadata tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta
        property="og:description"
        content={description || defaultDescription}
      />
      <meta property="og:site_name" content={siteName} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card metadata tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta
        name="twitter:description"
        content={description || defaultDescription}
      />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

/**
 * Generates JSON-LD schema for a product.
 * @param {object} product - The product data.
 * @returns {object} The JSON-LD schema object.
 */
export const generateProductSchema = (product) => {
  if (!product) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images?.[0]?.url,
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand?.name,
    },
    offers: {
      "@type": "Offer",
      url: `${window.location.origin}/product/${product.slug || product._id}`,
      priceCurrency: "INR", // Assuming INR from your settings
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.rating?.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.average,
        reviewCount: product.rating.count,
      },
    }),
  };
};

export default SEO;
