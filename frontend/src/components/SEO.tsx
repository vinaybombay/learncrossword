import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://learncrosswords.in';
const SITE_NAME = 'Learn Crosswords';
const DEFAULT_TITLE = 'Learn Crosswords — Master Cryptic Puzzles';
const DEFAULT_DESC =
  'Master cryptic crosswords with guided hints, gamified progress, and daily puzzles. Learn all 8 clue types interactively.';

interface SEOProps {
  /** Page-specific title (without site name). Omit for homepage to use default. */
  title?: string;
  /** Page-specific description. Falls back to DEFAULT_DESC. */
  description?: string;
  /** Canonical path, e.g. "/crosswords". Defaults to "". */
  path?: string;
}

/**
 * Drop-in SEO component using react-helmet-async.
 * Injects <title>, meta description, canonical, and Open Graph / Twitter tags.
 */
export const SEO: React.FC<SEOProps> = ({ title, description, path = '' }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESC;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
};
