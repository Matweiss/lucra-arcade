// brandConfig.js — Everything a brand sponsor needs to customize.
// Swap this object to reskin the entire game. No gameplay code changes required.

export const DEFAULT_BRAND = {
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
  contest: {
    mode: 'free_play',       // 'free_play' | 'tournament' | 'skill_play' | 'practice'
    entryFee: 0,
    prizePool: 0,
    maxEntries: null,
    submissionEndpoint: null,
  },
};

// Example: how to create a brand override
// import { DEFAULT_BRAND } from './brandConfig.js';
// export const ACME_BRAND = {
//   ...DEFAULT_BRAND,
//   name: 'Acme Turbo Cup',
//   sponsor: 'Acme Corp',
//   colors: { ...DEFAULT_BRAND.colors, primary: '#FF0000' },
//   copy: { ...DEFAULT_BRAND.copy, prizeText: 'Win an Acme prize pack!' },
// };
