export class TrackSystem {
  constructor(scene, config, brand, width, height) {
    this._scene = scene;
    this._config = config;
    this._brand = brand;
    this._width = width;
    this._height = height;

    this._obstacles = [];
    this._gates = [];
    this._boostPads = [];
    this._laneLines = [];

    this._obstacleTimer = 0;
    this._gateTimer = 0;
    this._boostTimer = 0;
    this._gateStreak = 0;
    this._lastGateId = -1;

    this._scrollY = 0;
    this._laneWidth = width / config.track.lanes;

    this._drawTrack();
    this._drawLaneLines();
  }

  _drawTrack() {
    const bgColor = Phaser.Display.Color.HexStringToColor(this._brand.colors.background).color;
    this._bg = this._scene.add.rectangle(
      this._width / 2, this._height / 2,
      this._width, this._height,
      bgColor
    ).setDepth(0);
  }

  _drawLaneLines() {
    const lineColor = Phaser.Display.Color.HexStringToColor(this._brand.colors.trackLine).color;
    for (let i = 1; i < this._config.track.lanes; i++) {
      const x = this._laneWidth * i;
      // Dashed lane line via multiple rects
      for (let y = 0; y < this._height; y += 40) {
        const seg = this._scene.add.rectangle(x, y, 2, 20, lineColor, 0.5).setDepth(1);
        this._laneLines.push({ rect: seg, baseY: y });
      }
    }

    // Side barriers
    const barrierColor = 0x333355;
    this._scene.add.rectangle(10, this._height / 2, 20, this._height, barrierColor).setDepth(1);
    this._scene.add.rectangle(this._width - 10, this._height / 2, 20, this._height, barrierColor).setDepth(1);
  }

  update(dt, playerSpeed) {
    const C = this._config.track;
    const scroll = playerSpeed * dt;
    this._scrollY = (this._scrollY + scroll) % 40;

    // Scroll lane dashes
    this._laneLines.forEach(({ rect, baseY }, i) => {
      const newY = (baseY + this._scrollY) % this._height;
      rect.setY(newY);
    });

    // Spawn timers
    this._obstacleTimer -= dt;
    this._gateTimer -= dt;
    this._boostTimer -= dt;

    if (this._obstacleTimer <= 0) {
      this._spawnObstacle();
      this._obstacleTimer = (1 / C.obstacleSpawnRate) * Phaser.Math.FloatBetween(0.7, 1.4);
    }
    if (this._gateTimer <= 0) {
      this._spawnGate();
      this._gateTimer = (1 / C.gateSpawnRate) * Phaser.Math.FloatBetween(0.8, 1.3);
    }
    if (this._boostTimer <= 0 && Math.random() < C.boostPadRate) {
      this._spawnBoostPad();
      this._boostTimer = Phaser.Math.FloatBetween(3, 7);
    }

    // Scroll all objects down
    const moveSpeed = playerSpeed;
    this._scrollGroup(this._obstacles, moveSpeed, dt);
    this._scrollGroup(this._gates, moveSpeed, dt);
    this._scrollGroup(this._boostPads, moveSpeed, dt);
  }

  _scrollGroup(group, speed, dt) {
    for (let i = group.length - 1; i >= 0; i--) {
      const obj = group[i];
      obj.gfx.y += speed * dt;
      if (obj.gfx.y > this._height + 60) {
        obj.gfx.destroy();
        group.splice(i, 1);
      }
    }
  }

  _spawnObstacle() {
    const lane = Phaser.Math.Between(0, this._config.track.lanes - 1);
    const x = this._laneWidth * lane + this._laneWidth / 2;
    const y = -40;

    const gfx = this._scene.add.graphics().setDepth(3);
    // Cone shape
    gfx.fillStyle(0xff6600, 1);
    gfx.fillTriangle(x, y - 18, x - 12, y + 12, x + 12, y + 12);
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillRect(x - 10, y + 4, 20, 5);

    this._obstacles.push({ gfx, x, lane, hit: false });
  }

  _spawnGate() {
    // Gate spans 3 consecutive lanes with a gap in 1 lane
    const gapLane = Phaser.Math.Between(0, this._config.track.lanes - 1);
    const y = -30;
    const id = Date.now();

    const gfx = this._scene.add.graphics().setDepth(3);
    const primaryColor = Phaser.Display.Color.HexStringToColor(this._brand.colors.primary).color;

    for (let i = 0; i < this._config.track.lanes; i++) {
      if (i === gapLane) continue;
      const x = this._laneWidth * i + this._laneWidth / 2;
      gfx.fillStyle(primaryColor, 0.25);
      gfx.fillRect(x - this._laneWidth / 2 + 2, y - 10, this._laneWidth - 4, 20);
      gfx.lineStyle(2, primaryColor, 0.8);
      gfx.strokeRect(x - this._laneWidth / 2 + 2, y - 10, this._laneWidth - 4, 20);
    }

    // Gap indicator — bright center line
    const gapX = this._laneWidth * gapLane + this._laneWidth / 2;
    gfx.lineStyle(3, primaryColor, 1);
    gfx.lineBetween(gapX - this._laneWidth / 2 + 4, y, gapX + this._laneWidth / 2 - 4, y);

    this._gates.push({ gfx, gapLane, y, id, passed: false });
  }

  _spawnBoostPad() {
    const lane = Phaser.Math.Between(0, this._config.track.lanes - 1);
    const x = this._laneWidth * lane + this._laneWidth / 2;
    const y = -30;

    const secondaryColor = Phaser.Display.Color.HexStringToColor(this._brand.colors.secondary).color;
    const gfx = this._scene.add.graphics().setDepth(3);
    gfx.fillStyle(secondaryColor, 0.3);
    gfx.fillRect(x - 20, y - 10, 40, 20);
    gfx.lineStyle(2, secondaryColor, 1);
    gfx.strokeRect(x - 20, y - 10, 40, 20);
    // Arrow
    gfx.fillStyle(secondaryColor, 1);
    gfx.fillTriangle(x, y - 8, x - 8, y + 6, x + 8, y + 6);

    this._boostPads.push({ gfx, x, lane, collected: false });
  }

  checkCollisions(playerBounds, nearMissWindow) {
    let hit = false;
    let nearMiss = false;

    for (const obs of this._obstacles) {
      if (obs.hit) continue;
      const obsRect = new Phaser.Geom.Rectangle(obs.gfx.x + obs.x - 12, obs.gfx.y - 18, 24, 30);
      // Use gfx.y for current position since gfx moves
      const obsY = obs.gfx.y;
      const obsX = obs.x;
      const obsBounds = new Phaser.Geom.Rectangle(obsX - 12, obsY - 18, 24, 30);

      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, obsBounds)) {
        obs.hit = true;
        hit = true;
      } else {
        // Near miss: passed recently and within horizontal window
        const vertPassed = playerBounds.top < obsY && playerBounds.bottom > obsY - 40;
        const horizClose = Math.abs(playerBounds.centerX - obsX) < nearMissWindow + 20;
        if (vertPassed && horizClose && Math.abs(playerBounds.centerX - obsX) > 20) {
          nearMiss = true;
        }
      }
    }
    return { hit, nearMiss };
  }

  checkGates(playerBounds) {
    let hit = false;
    let streak = this._gateStreak;

    for (const gate of this._gates) {
      if (gate.passed) continue;
      const gateY = gate.gfx.y;

      // Gate is at player level
      if (playerBounds.bottom > gateY - 10 && playerBounds.top < gateY + 10) {
        gate.passed = true;
        const playerLane = Math.floor(playerBounds.centerX / this._laneWidth);
        if (playerLane === gate.gapLane) {
          // Passed through the gap — score!
          this._gateStreak++;
          hit = true;
          streak = this._gateStreak;
        } else {
          // Hit a barrier
          this._gateStreak = 0;
        }
      }
    }
    return { hit, streak };
  }

  checkBoostPad(playerBounds) {
    for (const pad of this._boostPads) {
      if (pad.collected) continue;
      const padY = pad.gfx.y;
      const padBounds = new Phaser.Geom.Rectangle(pad.x - 20, padY - 10, 40, 20);
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, padBounds)) {
        pad.collected = true;
        pad.gfx.destroy();
        return true;
      }
    }
    return false;
  }
}
