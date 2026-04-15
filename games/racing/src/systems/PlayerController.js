export class PlayerController {
  constructor(scene, config, brand, width, height) {
    this._scene = scene;
    this._config = config.player;
    this._brand = brand;
    this._width = width;
    this._height = height;

    this.currentSpeed = config.player.speed;
    this.crashed = false;
    this._frozen = false;
    this._boosting = false;
    this._crashTimer = 0;
    this._boostTimer = 0;
    this._driftAccum = 0;

    // Half-way down, centered
    this._x = width / 2;
    this._y = height * 0.75;

    this._draw();
  }

  _draw() {
    if (this._gfx) this._gfx.destroy();
    const color = Phaser.Display.Color.HexStringToColor(this._brand.colors.primary).color;

    if (this._scene.textures.exists('kart')) {
      this._gfx = this._scene.add.image(this._x, this._y, 'kart').setDisplaySize(36, 54).setDepth(5);
    } else {
      // Gray-box kart: rectangle body + two circles for wheels
      this._gfx = this._scene.add.graphics().setDepth(5);
      this._redrawShape(color);
    }
  }

  _redrawShape(color) {
    this._gfx.clear();
    this._gfx.fillStyle(color, 1);
    this._gfx.fillRoundedRect(this._x - 14, this._y - 22, 28, 44, 6);
    // Wheels
    this._gfx.fillStyle(0x222222, 1);
    this._gfx.fillRect(this._x - 18, this._y - 18, 6, 14);
    this._gfx.fillRect(this._x + 12, this._y - 18, 6, 14);
    this._gfx.fillRect(this._x - 18, this._y + 6, 6, 14);
    this._gfx.fillRect(this._x + 12, this._y + 6, 6, 14);
    // Boost glow
    if (this._boosting) {
      this._gfx.fillStyle(0xffdd00, 0.8);
      this._gfx.fillTriangle(
        this._x - 8, this._y + 22,
        this._x + 8, this._y + 22,
        this._x, this._y + 40
      );
    }
  }

  update(dt, left, right, boost) {
    if (this._frozen) return;
    const C = this._config;

    // Crash cooldown
    if (this.crashed) {
      this._crashTimer -= dt;
      if (this._crashTimer <= 0) {
        this.crashed = false;
        this.currentSpeed = C.speed;
      }
      this._updateGraphics();
      return;
    }

    // Boost
    if (this._boosting) {
      this._boostTimer -= dt;
      if (this._boostTimer <= 0) this._boosting = false;
    }

    // Acceleration
    const targetSpeed = this._boosting ? C.maxSpeed * C.boostMultiplier : C.maxSpeed;
    this.currentSpeed = Math.min(this.currentSpeed + C.acceleration * dt * 60, targetSpeed);

    // Lateral movement
    if (left) this._x -= C.steerSpeed * dt;
    if (right) this._x += C.steerSpeed * dt;

    // Track bounds (with margin)
    const margin = 20;
    this._x = Phaser.Math.Clamp(this._x, margin, this._width - margin);

    // Drift accumulator
    if (left || right) {
      this._driftAccum += dt;
    } else {
      this._driftAccum = 0;
    }

    this._updateGraphics();
  }

  _updateGraphics() {
    if (this._scene.textures.exists('kart')) {
      this._gfx.setPosition(this._x, this._y);
      // Tilt on steer
      const tilt = (this._scene.cursors?.left.isDown || this._scene.wasd?.left.isDown) ? -0.15 :
                   (this._scene.cursors?.right.isDown || this._scene.wasd?.right.isDown) ? 0.15 : 0;
      this._gfx.setRotation(tilt);
    } else {
      const color = this.crashed
        ? 0xff4444
        : this._boosting
          ? Phaser.Display.Color.HexStringToColor(this._brand.colors.secondary).color
          : Phaser.Display.Color.HexStringToColor(this._brand.colors.primary).color;
      this._redrawShape(color);
    }
  }

  triggerCrash() {
    this.crashed = true;
    this._crashTimer = this._config.crashSlowDuration;
    this.currentSpeed *= this._config.crashSpeedFactor;
    this._scene.cameras.main.shake(150, 0.008);
  }

  triggerBoost() {
    this._boosting = true;
    this._boostTimer = this._config.boostDuration;
  }

  isDrifting(left, right) {
    return (left || right) && this._driftAccum > 0.3;
  }

  freeze() { this._frozen = true; }

  getPosition() {
    return { x: this._x, y: this._y };
  }

  getBounds() {
    return new Phaser.Geom.Rectangle(this._x - 14, this._y - 22, 28, 44);
  }
}
