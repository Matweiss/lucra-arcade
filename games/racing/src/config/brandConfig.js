// brandConfig.js — Everything a brand sponsor needs to customize.
// Swap this object to reskin the entire game. No gameplay code changes required.
//
// Sales intake: collect all non-null fields from the sponsor before generating a build.
// schemaVersion must be checked at runtime — reject configs < current version.

export const BRAND_SCHEMA_VERSION = 1;

const LUCRA_BRAND = {
  schemaVersion: BRAND_SCHEMA_VERSION,

  // Identity
  name: 'Lucra Turbo Sprint',
  sponsor: 'Lucra',
  tagline: 'Race. Score. Win.',

  // Colors (hex)
  colors: {
    primary: '#00E5FF',      // kart/UI accent
    secondary: '#FF6B00',    // boost / highlight
    background: '#0A0A1A',   // track background
    trackLine: '#1A1A3A',    // lane dividers
    text: '#FFFFFF',
    textDim: '#888888',
    hudBg: 'rgba(0,0,0,0.6)',
  },

  // Assets — swap with brand logo PNGs
  assets: {
    logo: null,
    kartSkin: null,
    trackBanner: null,
    boostIcon: null,
    finishFlair: null,
  },

  // Copy
  copy: {
    menuCTA: 'Start Race',
    practiceCTA: 'Practice',
    resultHeading: 'Race Complete!',
    resultShareCTA: 'Share Score',
    sponsorMessage: '',
    prizeText: '',
  },

  // Contest mode (hook for Lucra backend)
  contest: {
    mode: 'free_play',
    entryFee: 0,
    prizePool: 0,
    maxEntries: null,
    submissionEndpoint: null,
    sessionSecret: null,
  },

  // Analytics
  analytics: {
    ga4MeasurementId: null,
    gtmContainerId: null,
    mixpanelToken: null,
    customEndpoint: null,
    sessionIdPrefix: 'lucra',
  },

  // Legal & deployment
  legal: {
    termsUrl: null,
    privacyUrl: null,
    ageGate: false,
    jurisdictionBlock: [],
    disclaimerText: '',
  },

  deployment: {
    embedMode: 'standalone',
    allowedOrigins: [],
    customDomain: null,
    buildId: null,
  },
};

// ============================================================
// DEMO BRAND SKIN: DraftKings
// ============================================================
// Pitch demo — shows how a real sports/gaming brand would look.

const DRAFTKINGS_BRAND = {
  ...LUCRA_BRAND,
  name: 'DK Turbo Sprint',
  sponsor: 'DraftKings',
  tagline: 'Race for the Crown.',

  colors: {
    primary: '#59C84B',      // DraftKings green
    secondary: '#FFD700',    // gold accent
    background: '#0B1120',   // deep navy/black
    trackLine: '#1B2540',    // subtle navy lane dividers
    text: '#FFFFFF',
    textDim: '#7A8AAE',      // muted blue-gray
    hudBg: 'rgba(11,17,32,0.7)',
  },

  assets: {
    logo: null,              // would be DraftKings crown logo PNG
    kartSkin: null,
    trackBanner: null,
    boostIcon: null,
    finishFlair: null,
  },

  copy: {
    menuCTA: 'Enter Race',
    practiceCTA: 'Free Play',
    resultHeading: 'Race Results',
    resultShareCTA: 'Challenge a Friend',
    sponsorMessage: 'Presented by DraftKings',
    prizeText: 'Top score wins $1,000',
  },

  contest: {
    mode: 'tournament',
    entryFee: 5,
    prizePool: 1000,
    maxEntries: 500,
    submissionEndpoint: null,
    sessionSecret: null,
  },

  analytics: {
    ...LUCRA_BRAND.analytics,
    sessionIdPrefix: 'dk',
  },

  legal: {
    termsUrl: 'https://draftkings.com/terms',
    privacyUrl: 'https://draftkings.com/privacy',
    ageGate: true,
    jurisdictionBlock: [],
    disclaimerText: 'No purchase necessary. Void where prohibited. Must be 21+.',
  },

  deployment: {
    embedMode: 'webview',
    allowedOrigins: ['https://draftkings.com', 'https://www.draftkings.com'],
    customDomain: null,
    buildId: null,
  },
};

// ============================================================
// BRAND SELECTOR — change this line to swap skins
// ============================================================
// Options: LUCRA_BRAND, DRAFTKINGS_BRAND
const ACTIVE_BRAND = LUCRA_BRAND;

export const DEFAULT_BRAND = ACTIVE_BRAND;
export { LUCRA_BRAND, DRAFTKINGS_BRAND };

// Validate a brand config at runtime
export function validateBrandConfig(config) {
  if (!config.schemaVersion || config.schemaVersion < BRAND_SCHEMA_VERSION) {
    throw new Error(`brandConfig schemaVersion ${config.schemaVersion} is outdated. Expected ${BRAND_SCHEMA_VERSION}.`);
  }
  return true;
}
