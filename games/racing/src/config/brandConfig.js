// brandConfig.js — Everything a brand sponsor needs to customize.
// Swap this object to reskin the entire game. No gameplay code changes required.
//
// Sales intake: collect all non-null fields from the sponsor before generating a build.
// schemaVersion must be checked at runtime — reject configs < current version.

export const BRAND_SCHEMA_VERSION = 1;

export const DEFAULT_BRAND = {
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
    logo: null,              // path to logo image (shown on menu + result screen)
    kartSkin: null,          // path to kart sprite (falls back to shape)
    trackBanner: null,       // repeating side banner
    boostIcon: null,         // pickup icon override
    finishFlair: null,       // result screen background
  },

  // Copy
  copy: {
    menuCTA: 'Start Race',
    practiceCTA: 'Practice',
    resultHeading: 'Race Complete!',
    resultShareCTA: 'Share Score',
    sponsorMessage: '',      // e.g. "Presented by Acme Corp"
    prizeText: '',           // e.g. "Top score wins $500"
  },

  // Contest mode (hook for Lucra backend)
  // Score submission uses event-log format — see ScoreSystem.getEventLog()
  contest: {
    mode: 'free_play',       // 'free_play' | 'tournament' | 'skill_play' | 'practice'
    entryFee: 0,
    prizePool: 0,
    maxEntries: null,
    submissionEndpoint: null, // POST receives: { sessionId, playerId, eventLog, finalScore, duration }
    sessionSecret: null,      // set server-side; used to sign event log submissions
  },

  // Analytics — brand tracking IDs (all optional)
  analytics: {
    ga4MeasurementId: null,   // Google Analytics 4
    gtmContainerId: null,     // Google Tag Manager
    mixpanelToken: null,
    customEndpoint: null,     // POST { event, properties } for brand's own analytics
    sessionIdPrefix: 'lucra', // prefixed to all session IDs for brand attribution
  },

  // Legal & deployment (required before external pitch)
  legal: {
    termsUrl: null,           // link shown on menu (required for real-money modes)
    privacyUrl: null,
    ageGate: false,           // show 21+ confirmation before play
    jurisdictionBlock: [],    // ISO 3166-1 alpha-2 codes to block (e.g. ['US-WA'])
    disclaimerText: '',       // footer text (e.g. "No purchase necessary. Void where prohibited.")
  },

  deployment: {
    embedMode: 'standalone',  // 'standalone' | 'iframe' | 'webview'
    allowedOrigins: [],       // CORS origins for iframe embed
    customDomain: null,       // e.g. 'games.acmecorp.com'
    buildId: null,            // set at build time; used for cache busting
  },
};

// Validate a brand config at runtime
export function validateBrandConfig(config) {
  if (!config.schemaVersion || config.schemaVersion < BRAND_SCHEMA_VERSION) {
    throw new Error(`brandConfig schemaVersion ${config.schemaVersion} is outdated. Expected ${BRAND_SCHEMA_VERSION}.`);
  }
  return true;
}

// Example: how to create a brand override
// import { DEFAULT_BRAND } from './brandConfig.js';
// export const ACME_BRAND = {
//   ...DEFAULT_BRAND,
//   name: 'Acme Turbo Cup',
//   sponsor: 'Acme Corp',
//   colors: { ...DEFAULT_BRAND.colors, primary: '#FF0000' },
//   copy: { ...DEFAULT_BRAND.copy, prizeText: 'Win an Acme prize pack!' },
//   analytics: { ...DEFAULT_BRAND.analytics, ga4MeasurementId: 'G-XXXXXXX' },
//   legal: { ...DEFAULT_BRAND.legal, termsUrl: 'https://acme.com/terms', ageGate: true },
// };
