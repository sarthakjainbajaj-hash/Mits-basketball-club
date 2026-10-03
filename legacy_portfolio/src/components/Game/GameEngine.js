import { MAP_CONFIG, ZONES, INTERACTABLES, COLLECTIBLES, MONSTERS } from "./gameData";
import { sound } from "./soundEngine";

export class GameEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.houseTheme = options.houseTheme || "stark";
    this.onInteract = options.onInteract || (() => {});
    this.onCollect = options.onCollect || (() => {});
    this.onPlayerMove = options.onPlayerMove || (() => {});
    this.onMonsterKill = options.onMonsterKill || (() => {});
    this.onSkillsUnlocked = options.onSkillsUnlocked || (() => {});

    // State
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    // Player Soldier
    this.player = {
      x: MAP_CONFIG.spawnPoint.x,
      y: MAP_CONFIG.spawnPoint.y,
      radius: 20,
      speed: 4.3,
      facing: "down",
      isMoving: false,
      stepCycle: 0,
      targetPos: null,
      hp: 100,
      maxHp: 100,
      isAttacking: false,
      attackTimer: 0,
      attackCooldown: 0,
      hitFlash: 0,
    };

    // Camera
    this.camera = {
      x: this.player.x - this.width / 2,
      y: this.player.y - this.height / 2,
    };

    // Monsters Guarding Skills
    this.monsters = MONSTERS.map((m) => ({
      ...m,
      currentHp: m.maxHp,
      isDead: false,
      hitFlash: 0,
      vx: 0,
      vy: 0,
      attackCooldown: 0,
      patrolTimer: Math.random() * 100,
    }));

    this.skillsUnlocked = false;

    // Controls
    this.keys = {};
    this.activeInteractable = null;
    this.collectedRunes = new Set(options.collectedRunes || []);

    // Visuals & Combat
    this.particles = [];
    this.ripples = [];
    this.combatTexts = [];
    this.time = 0;
    this.isRunning = false;
    this.animId = null;

    // Obstacles
    this.obstacles = [
      { x: 50, y: 50, w: MAP_CONFIG.width - 100, h: 20 },
      { x: 50, y: MAP_CONFIG.height - 70, w: MAP_CONFIG.width - 100, h: 20 },
      { x: 50, y: 50, w: 20, h: MAP_CONFIG.height - 100 },
      { x: MAP_CONFIG.width - 70, y: 50, w: 20, h: MAP_CONFIG.height - 100 },
      { x: 700, y: 550, w: 40, h: 40 },
      { x: 1100, y: 550, w: 40, h: 40 },
      { x: 700, y: 880, w: 40, h: 40 },
      { x: 1100, y: 880, w: 40, h: 40 },
    ];

    // Bindings
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("pointerdown", this.handleClick);

    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * MAP_CONFIG.width,
        y: Math.random() * MAP_CONFIG.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.6,
        color: Math.random() > 0.5 ? "#f59e0b" : "#38bdf8",
      });
    }

    this.isRunning = true;
    this.animId = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("pointerdown", this.handleClick);
  }

  handleResize() {
    const parent = this.canvas.parentElement;
    this.width = parent && parent.clientWidth > 0 ? parent.clientWidth : window.innerWidth;
    this.height = parent && parent.clientHeight > 0 ? parent.clientHeight : window.innerHeight;
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    this.keys[key] = true;

    // Attack keys: Spacebar, J, F
    if (e.key === " " || key === "j" || key === "f") {
      this.attack();
    }

    // Interaction key: E or Enter
    if (key === "e" || e.key === "Enter") {
      this.interact();
    }
  }

  handleKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = screenX + this.camera.x;
    const worldY = screenY + this.camera.y;

    // If clicked on an active monster within attack reach, attack it!
    const clickedMonster = this.monsters.find(
      (m) => !m.isDead && Math.hypot(m.x - worldX, m.y - worldY) < 40
    );
    if (clickedMonster) {
      const distToPlayer = Math.hypot(clickedMonster.x - this.player.x, clickedMonster.y - this.player.y);
      if (distToPlayer < 90) {
        this.attack();
        return;
      }
    }

    // Check if clicked on an interactable
    const clickedItem = INTERACTABLES.find((item) => {
      const dist = Math.hypot(item.x - worldX, item.y - worldY);
      return dist < 45;
    });

    if (clickedItem) {
      this.interact(clickedItem);
      return;
    }

    // Click to move
    this.player.targetPos = { x: worldX, y: worldY };
    this.ripples.push({
      x: worldX,
      y: worldY,
      radius: 4,
      maxRadius: 28,
      alpha: 1,
    });
  }

  setJoystickInput(dx, dy) {
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      this.player.targetPos = null;
      this.movePlayer(dx * this.player.speed, dy * this.player.speed);
    }
  }

  attack() {
    if (this.player.attackCooldown > 0) return;
    this.player.isAttacking = true;
    this.player.attackTimer = 10; // 10 frames slash animation
    this.player.attackCooldown = 15; // cooldown between swings
    sound.playSlash();

    // Determine attack hitbox center in facing direction
    let hitX = this.player.x;
    let hitY = this.player.y;
    const reach = 48;

    if (this.player.facing === "down") hitY += reach;
    else if (this.player.facing === "up") hitY -= reach;
    else if (this.player.facing === "left") hitX -= reach;
    else if (this.player.facing === "right") hitX += reach;

    // Check hit against monsters
    for (const m of this.monsters) {
      if (m.isDead) continue;
      const dist = Math.hypot(m.x - hitX, m.y - hitY);
      if (dist < 55) {
        // Hit landed!
        const isCrit = Math.random() > 0.6;
        const damage = isCrit ? 30 : 20;
        m.currentHp = Math.max(0, m.currentHp - damage);
        m.hitFlash = 8;
        sound.playMonsterHit();

        // Knockback monster away from player
        const angle = Math.atan2(m.y - this.player.y, m.x - this.player.x);
        m.vx = Math.cos(angle) * 8;
        m.vy = Math.sin(angle) * 8;

        // Floating Damage text
        this.combatTexts.push({
          text: `-${damage}${isCrit ? " CRIT!" : ""}`,
          x: m.x,
          y: m.y - 15,
          color: isCrit ? "#facc15" : "#f87171",
          life: 30,
        });

        // Slash impact sparks
        for (let i = 0; i < 8; i++) {
          this.particles.push({
            x: m.x,
            y: m.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: 2 + Math.random() * 2,
            alpha: 1,
            color: "#f59e0b",
          });
        }

        // Check monster death
        if (m.currentHp <= 0) {
          m.isDead = true;
          sound.playMonsterDeath();
          this.onMonsterKill(m);

          // Death burst
          for (let p = 0; p < 25; p++) {
            this.particles.push({
              x: m.x,
              y: m.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              size: 3 + Math.random() * 4,
              alpha: 1,
              color: m.color,
            });
          }

          // Check if all monsters slain -> UNLOCK SKILLS!
          const allDead = this.monsters.every((mon) => mon.isDead);
          if (allDead && !this.skillsUnlocked) {
            this.skillsUnlocked = true;
            sound.playFanfare();
            this.onSkillsUnlocked();

            // Notify with golden floating message
            this.combatTexts.push({
              text: "🏆 VICTORY! SKILLS UNLOCKED!",
              x: 1400,
              y: 410,
              color: "#34d399",
              life: 90,
            });
          }
        }
      }
    }
  }

  interact(targetItem = null) {
    const item = targetItem || this.activeInteractable;
    if (!item) return;

    // If it's the skill altar and monsters are still alive, block with a warning!
    if (item.id === "skill_altar" && !this.skillsUnlocked) {
      sound.playClose();
      this.combatTexts.push({
        text: "⚔️ DEFEAT BOTH MONSTERS FIRST!",
        x: item.x,
        y: item.y - 30,
        color: "#ef4444",
        life: 50,
      });
      return;
    }

    sound.playInteract();
    this.onInteract(item);
  }

  checkCollision(newX, newY) {
    const r = this.player.radius;
    if (newX < 70 + r || newX > MAP_CONFIG.width - 70 - r) return true;
    if (newY < 70 + r || newY > MAP_CONFIG.height - 70 - r) return true;

    for (const obs of this.obstacles) {
      if (
        newX + r > obs.x &&
        newX - r < obs.x + obs.w &&
        newY + r > obs.y &&
        newY - r < obs.y + obs.h
      ) {
        return true;
      }
    }
    return false;
  }

  movePlayer(vx, vy) {
    let nextX = this.player.x + vx;
    let nextY = this.player.y + vy;

    if (!this.checkCollision(nextX, this.player.y)) {
      this.player.x = nextX;
    }
    if (!this.checkCollision(this.player.x, nextY)) {
      this.player.y = nextY;
    }

    if (Math.abs(vx) > Math.abs(vy)) {
      this.player.facing = vx > 0 ? "right" : "left";
    } else if (Math.abs(vy) > 0.1) {
      this.player.facing = vy > 0 ? "down" : "up";
    }

    this.player.isMoving = true;
    this.player.stepCycle += 0.2;
    this.onPlayerMove(this.player.x, this.player.y);
  }

  update() {
    this.time += 0.03;
    let vx = 0;
    let vy = 0;

    // Attack timers
    if (this.player.attackTimer > 0) this.player.attackTimer--;
    else this.player.isAttacking = false;
    if (this.player.attackCooldown > 0) this.player.attackCooldown--;
    if (this.player.hitFlash > 0) this.player.hitFlash--;

    // Soldier HP regeneration
    if (this.time % 2 < 0.03 && this.player.hp < this.player.maxHp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
    }

    // Keyboard movement
    if (this.keys["w"] || this.keys["arrowup"]) vy -= 1;
    if (this.keys["s"] || this.keys["arrowdown"]) vy += 1;
    if (this.keys["a"] || this.keys["arrowleft"]) vx -= 1;
    if (this.keys["d"] || this.keys["arrowright"]) vx += 1;

    if (vx !== 0 || vy !== 0) {
      this.player.targetPos = null;
      const len = Math.hypot(vx, vy);
      vx = (vx / len) * this.player.speed;
      vy = (vy / len) * this.player.speed;
      this.movePlayer(vx, vy);
    } else if (this.player.targetPos) {
      const dx = this.player.targetPos.x - this.player.x;
      const dy = this.player.targetPos.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 6) {
        this.player.targetPos = null;
        this.player.isMoving = false;
      } else {
        vx = (dx / dist) * this.player.speed;
        vy = (dy / dist) * this.player.speed;
        this.movePlayer(vx, vy);
      }
    } else {
      this.player.isMoving = false;
    }

    // Update Monsters AI
    for (const m of this.monsters) {
      if (m.isDead) continue;
      if (m.hitFlash > 0) m.hitFlash--;

      // Apply knockback velocity friction
      m.x += m.vx;
      m.y += m.vy;
      m.vx *= 0.85;
      m.vy *= 0.85;

      const distToPlayer = Math.hypot(this.player.x - m.x, this.player.y - m.y);

      // Monster Aggro (if player within 230px, chase!)
      if (distToPlayer < 230) {
        const angle = Math.atan2(this.player.y - m.y, this.player.x - m.x);
        m.x += Math.cos(angle) * m.speed;
        m.y += Math.sin(angle) * m.speed;

        // Attack soldier if in melee range
        if (distToPlayer < 32 && m.attackCooldown <= 0) {
          m.attackCooldown = 45; // 45 frames
          this.player.hp = Math.max(10, this.player.hp - m.attackPower);
          this.player.hitFlash = 6;
          sound.playMonsterHit();

          this.combatTexts.push({
            text: `-${m.attackPower}`,
            x: this.player.x,
            y: this.player.y - 20,
            color: "#ef4444",
            life: 25,
          });
        }
      } else {
        // Idle patrol
        m.patrolTimer += 0.05;
        m.x += Math.sin(m.patrolTimer) * 0.4;
      }

      if (m.attackCooldown > 0) m.attackCooldown--;
    }

    // Update Floating Combat Texts
    for (let i = this.combatTexts.length - 1; i >= 0; i--) {
      const ct = this.combatTexts[i];
      ct.y -= 0.8;
      ct.life--;
      if (ct.life <= 0) this.combatTexts.splice(i, 1);
    }

    // Update Camera
    const targetCamX = this.player.x - this.width / 2;
    const targetCamY = this.player.y - this.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.08;
    this.camera.y += (targetCamY - this.camera.y) * 0.08;
    this.camera.x = Math.max(0, Math.min(this.camera.x, MAP_CONFIG.width - this.width));
    this.camera.y = Math.max(0, Math.min(this.camera.y, MAP_CONFIG.height - this.height));

    // Interactable proximity
    let closestItem = null;
    let closestDist = Infinity;
    for (const item of INTERACTABLES) {
      const dist = Math.hypot(item.x - this.player.x, item.y - this.player.y);
      if (dist < 75 && dist < closestDist) {
        closestItem = item;
        closestDist = dist;
      }
    }
    this.activeInteractable = closestItem;

    // Collectibles (Runes)
    for (const rune of COLLECTIBLES) {
      if (!this.collectedRunes.has(rune.id)) {
        const dist = Math.hypot(rune.x - this.player.x, rune.y - this.player.y);
        if (dist < 35) {
          this.collectedRunes.add(rune.id);
          sound.playPickup();
          this.onCollect(rune);
        }
      }
    }

    // Ripples & particles
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += 1.2;
      rip.alpha -= 0.035;
      if (rip.alpha <= 0) this.ripples.splice(i, 1);
    }

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.006;
      if (p.alpha <= 0) {
        p.x = Math.random() * MAP_CONFIG.width;
        p.y = MAP_CONFIG.height - 100;
        p.alpha = 0.6 + Math.random() * 0.4;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.pixelRatio, this.pixelRatio);

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    this.renderGround(ctx);
    this.renderPathways(ctx);
    this.renderZoneAuras(ctx);

    // Click Ripples
    for (const rip of this.ripples) {
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${rip.alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    this.renderCollectibles(ctx);
    this.renderInteractables(ctx);

    // Render Monsters
    this.renderMonsters(ctx);

    // Render Soldier
    this.renderSoldier(ctx);

    // Floating Combat Texts
    for (const ct of this.combatTexts) {
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.fillStyle = ct.color;
      ctx.textAlign = "center";
      ctx.fillText(ct.text, ct.x, ct.y);
    }

    // Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Interaction Prompt
    if (this.activeInteractable) {
      this.renderInteractionPrompt(ctx, this.activeInteractable);
    }

    ctx.restore(); // end camera translation

    // Render HUD Mini-Map Radar on screen
    this.renderMiniMap(ctx);

    ctx.restore(); // end scale
  }

  renderGround(ctx) {
    const tileSize = 60;
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
    ctx.lineWidth = 1;

    for (let x = 60; x < MAP_CONFIG.width - 60; x += tileSize) {
      for (let y = 60; y < MAP_CONFIG.height - 60; y += tileSize) {
        ctx.fillStyle = (x / tileSize + y / tileSize) % 2 === 0 ? "#0c1322" : "#0f172a";
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, MAP_CONFIG.width, 60);
    ctx.fillRect(0, MAP_CONFIG.height - 60, MAP_CONFIG.width, 60);
    ctx.fillRect(0, 0, 60, MAP_CONFIG.height);
    ctx.fillRect(MAP_CONFIG.width - 60, 0, 60, MAP_CONFIG.height);

    ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, MAP_CONFIG.width - 120, MAP_CONFIG.height - 120);

    for (const obs of this.obstacles.slice(4)) {
      ctx.fillStyle = "#334155";
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    }
  }

  renderPathways(ctx) {
    const center = MAP_CONFIG.spawnPoint;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    ctx.lineWidth = 36;
    ctx.lineCap = "round";

    for (const z of ZONES) {
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(z.x, z.y);
      ctx.stroke();
    }
  }

  renderZoneAuras(ctx) {
    for (const z of ZONES) {
      const pulse = Math.sin(this.time * 2 + z.x) * 6;
      const grad = ctx.createRadialGradient(z.x, z.y, 10, z.x, z.y, z.radius + pulse);
      grad.addColorStop(0, `${z.color}33`);
      grad.addColorStop(0.7, `${z.color}11`);
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.radius + pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `${z.color}66`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillStyle = z.color;
      ctx.textAlign = "center";
      ctx.fillText(z.name.toUpperCase(), z.x, z.y - z.radius - 10);
    }
  }

  renderCollectibles(ctx) {
    for (const rune of COLLECTIBLES) {
      if (this.collectedRunes.has(rune.id)) continue;
      const floatY = rune.y + Math.sin(this.time * 3 + rune.x) * 5;

      ctx.save();
      ctx.translate(rune.x, floatY);
      ctx.rotate(this.time * 1.5);
      ctx.fillStyle = rune.color;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(-8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  renderInteractables(ctx) {
    for (const item of INTERACTABLES) {
      const floatAnim = Math.sin(this.time * 2.5 + item.x) * 3;

      // Special golden pillar of light if skills are unlocked
      if (item.id === "skill_altar" && this.skillsUnlocked) {
        ctx.fillStyle = "rgba(52, 211, 153, 0.25)";
        ctx.beginPath();
        ctx.moveTo(item.x - 25, item.y + 10);
        ctx.lineTo(item.x + 25, item.y + 10);
        ctx.lineTo(item.x + 40, item.y - 120);
        ctx.lineTo(item.x - 40, item.y - 120);
        ctx.closePath();
        ctx.fill();
      }

      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.icon, item.x, item.y + floatAnim);

      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(item.name, item.x, item.y + 28);
    }
  }

  // RENDER MONSTERS (Bug Fiend & Glitch Drake)
  renderMonsters(ctx) {
    for (const m of this.monsters) {
      if (m.isDead) continue;

      const bounce = Math.sin(this.time * 5 + m.x) * 3;

      // Monster Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(m.x, m.y + 16, m.size + 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Monster Body / Sprite
      ctx.save();
      ctx.translate(m.x, m.y + bounce);

      // Hit flash white/red
      if (m.hitFlash > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, m.size + 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Base Body
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(0, 0, m.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing Eyes
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(-6, -4, 4, 0, Math.PI * 2);
      ctx.arc(6, -4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Horns
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.lineTo(-18, -26);
      ctx.lineTo(-4, -16);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, -12);
      ctx.lineTo(18, -26);
      ctx.lineTo(4, -16);
      ctx.fill();

      // Icon overlay
      ctx.font = "18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(m.icon, 0, 4);

      ctx.restore();

      // Floating HP Bar
      const barW = 44;
      const barH = 5;
      const barX = m.x - barW / 2;
      const barY = m.y - m.size - 16 + bounce;

      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      ctx.fillStyle = "#ef4444";
      ctx.fillRect(barX, barY, barW, barH);

      ctx.fillStyle = "#22c55e";
      const hpRatio = m.currentHp / m.maxHp;
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      // Monster Name & Level
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.fillStyle = "#f87171";
      ctx.textAlign = "center";
      ctx.fillText(`${m.name} [LVL 18]`, m.x, barY - 4);
    }
  }

  // RENDER SOLDIER WARRIOR (With Sword & Shield)
  renderSoldier(ctx) {
    const p = this.player;
    const bounce = p.isMoving ? Math.sin(p.stepCycle) * 3 : Math.sin(this.time * 2) * 1.5;

    ctx.save();
    ctx.translate(p.x, p.y + bounce);

    // Hit flash
    if (p.hitFlash > 0) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.ellipse(0, 14, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blue Cape
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(12, -4);
    ctx.lineTo(14, 16);
    ctx.lineTo(-14, 16);
    ctx.closePath();
    ctx.fill();

    // Steel Armor Body
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(0, 2, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Shield on Left Arm
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(-13, 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Knight Helmet
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(0, -10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glowing Visor
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(-6, -11, 12, 3);

    // Golden Helmet Plume
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(0, -16, 5, Math.PI, Math.PI * 2);
    ctx.fill();

    // Steel Broadsword in Right Hand
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(11, -12, 3, 18);
    // Crossguard & Hilt
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(8, -4, 9, 3);

    // Sword Slash Arc Effect (if attacking)
    if (p.isAttacking) {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      let startAngle = 0;
      let endAngle = Math.PI;

      if (p.facing === "down") {
        startAngle = 0.2 * Math.PI;
        endAngle = 0.8 * Math.PI;
      } else if (p.facing === "up") {
        startAngle = 1.2 * Math.PI;
        endAngle = 1.8 * Math.PI;
      } else if (p.facing === "left") {
        startAngle = 0.7 * Math.PI;
        endAngle = 1.3 * Math.PI;
      } else {
        startAngle = -0.3 * Math.PI;
        endAngle = 0.3 * Math.PI;
      }

      ctx.beginPath();
      ctx.arc(0, 0, 36, startAngle, endAngle);
      ctx.stroke();

      // Outer golden glow trail
      ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 42, startAngle, endAngle);
      ctx.stroke();
    }

    // Soldier Name & HP Bar
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("Soldier Sarthak", 0, -26);

    // Soldier mini HP
    const sBarW = 32;
    const sBarH = 4;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-sBarW / 2, -22, sBarW, sBarH);
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(-sBarW / 2, -22, sBarW * (p.hp / p.maxHp), sBarH);

    ctx.restore();
  }

  // RENDER MINI-MAP RADAR
  renderMiniMap(ctx) {
    const mapW = 140;
    const mapH = 105;
    const pad = 16;
    const mapX = this.width - mapW - pad;
    const mapY = 70; // below top HUD

    // Mini-map background frame
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.beginPath();
    ctx.roundRect(mapX, mapY, mapW, mapH, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Map Header Label
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.fillStyle = "#f59e0b";
    ctx.textAlign = "center";
    ctx.fillText("CITADEL RADAR", mapX + mapW / 2, mapY + 12);

    const scaleX = (mapW - 16) / MAP_CONFIG.width;
    const scaleY = (mapH - 22) / MAP_CONFIG.height;

    // Landmark Icons
    const landmarks = [
      { x: 900, y: 720, label: "🏰", color: "#38bdf8" }, // Courtyard
      { x: 400, y: 500, label: "⚔️", color: "#f59e0b" }, // War Council
      { x: 900, y: 300, label: "🔥", color: "#ef4444" }, // Arcane Forge
      { x: 1400, y: 500, label: "💎", color: "#10b981" }, // Skills Lair
      { x: 450, y: 1000, label: "📚", color: "#8b5cf6" }, // Archive
      { x: 1350, y: 1000, label: "🦅", color: "#ec4899" }, // Raven
    ];

    for (const lm of landmarks) {
      const rx = mapX + 8 + lm.x * scaleX;
      const ry = mapY + 18 + lm.y * scaleY;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(lm.label, rx, ry);
    }

    // Monsters on radar (pulsing red dots)
    for (const m of this.monsters) {
      if (m.isDead) continue;
      const mx = mapX + 8 + m.x * scaleX;
      const my = mapY + 18 + m.y * scaleY;

      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player position on radar (bright cyan dot)
    const px = mapX + 8 + this.player.x * scaleX;
    const py = mapY + 18 + this.player.y * scaleY;

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  renderInteractionPrompt(ctx, item) {
    const bounce = Math.sin(this.time * 5) * 4;
    const promptY = item.y - 42 + bounce;

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = item.id === "skill_altar" && !this.skillsUnlocked ? "#ef4444" : "#f59e0b";
    ctx.lineWidth = 1.5;

    let label = " [E] Inspect ";
    if (item.id === "skill_altar") {
      label = this.skillsUnlocked ? " [E] Claim Skills 💎 " : " ⚔️ Defeat 2 Monsters First! ";
    }

    ctx.font = "bold 11px Inter, sans-serif";
    const textWidth = ctx.measureText(label).width;

    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(item.x - textWidth / 2 - 8, promptY - 12, textWidth + 16, 22, 11);
    } else {
      ctx.rect(item.x - textWidth / 2 - 8, promptY - 12, textWidth + 16, 22);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = item.id === "skill_altar" && !this.skillsUnlocked ? "#f87171" : "#fbbf24";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, item.x, promptY);
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.render();
    this.animId = requestAnimationFrame(this.loop);
  }
}
