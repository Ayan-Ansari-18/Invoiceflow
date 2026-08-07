import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type }) => {
  const defaultTitle = "InvoiceFlow | The Ultimate Invoicing Platform for Freelancers";
  const defaultDescription = "Create professional invoices in seconds, track payments, and get paid faster with InvoiceFlow. Designed exclusively for modern freelancers.";
  const defaultName = "InvoiceFlow";

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title ? `${title} | InvoiceFlow` : defaultTitle}</title>
      <meta name='description' content={description || defaultDescription} />
      
      {/* OpenGraph tags */}
      <meta property="og:type" content={type || "website"} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || defaultName} />
      <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
    </Helmet>
  );
};

export default SEO;
