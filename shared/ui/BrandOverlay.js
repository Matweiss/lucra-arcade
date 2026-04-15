/**
 * BrandOverlay — shared UI helper for brand-injected elements
 *
 * Renders brand logo, sponsor tag, and legal footer into a Phaser scene
 * using brandConfig values. All games import this to keep brand rendering DRY.
 *
 * Usage (inside a Phaser Scene):
 *   import { BrandOverlay } from '../../../shared/ui/BrandOverlay.js';
 *   const overlay = new BrandOverlay(this, brandConfig);
 *   overlay.render();
 */

export class BrandOverlay {
  constructor(scene, brandConfig) {
    this._scene = scene;
    this._cfg = brandConfig ?? {};
  }

  render() {
    const { width, height } = this._scene.scale;
    const colors = this._cfg.colors ?? {};
    const brand = this._cfg.brand ?? {};
    const legal = this._cfg.legal ?? {};

    // Sponsor tag (top-right)
    if (brand.sponsorTag) {
      this._scene.add.text(width - 12, 10, brand.sponsorTag, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: colors.textSecondary ?? '#aaaaaa',
        alpha: 0.7,
      }).setOrigin(1, 0);
    }

    // Legal disclaimer (bottom of screen, very small)
    if (legal.disclaimerText) {
      this._scene.add.text(width / 2, height - 6, legal.disclaimerText, {
        fontSize: '9px',
        fontFamily: 'Arial, sans-serif',
        color: colors.textSecondary ?? '#888888',
        alpha: 0.5,
      }).setOrigin(0.5, 1);
    }
  }

  /**
   * Returns the primary hex color as a Phaser-compatible integer.
   */
  primaryInt() {
    const hex = (this._cfg.colors?.primary ?? '#ff6600').replace('#', '');
    return parseInt(hex, 16);
  }

  /**
   * Returns the accent hex color as a Phaser-compatible integer.
   */
  accentInt() {
    const hex = (this._cfg.colors?.accent ?? '#ffcc00').replace('#', '');
    return parseInt(hex, 16);
  }
}
