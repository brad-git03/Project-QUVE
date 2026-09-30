// Project Quve - Canvas Renderer (3D-Isometric Box Monster Visualization)

export class BattleRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.floatingTexts = [];
    this.particles = [];

    // Screen layout coordinates for 3v3
    this.positions = {
      // Player Positions (Left side facing right)
      p1: { x: 340, y: 220, label: 'Pos 1 (Front)' },
      p2: { x: 220, y: 150, label: 'Pos 2 (Mid)' },
      p3: { x: 130, y: 280, label: 'Pos 3 (Back)' },

      // Enemy Positions (Right side facing left)
      e1: { x: 580, y: 220, label: 'Pos 1 (Front)' },
      e2: { x: 700, y: 150, label: 'Pos 2 (Mid)' },
      e3: { x: 790, y: 280, label: 'Pos 3 (Back)' }
    };
  }

  addFloatingText(x, y, text, color = '#ffffff', isCrit = false) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      isCrit,
      opacity: 1.0,
      vy: -1.2,
      life: 60
    });
  }

  addDamageParticles(x, y, color = '#ff4d4f', intensity = 1) {
    for (let i = 0; i < 12 * intensity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: (3 + Math.random() * 3) * Math.min(intensity, 1.5),
        life: 25 + (intensity - 1) * 10,
        maxLife: 25 + (intensity - 1) * 10
      });
    }
  }

  // Draw an isometric 3D Box Monster with its 5 parts
  drawIsometricQuve(ctx, x, y, quve, isTargeted = false, isActing = false) {
    const size = 36; // half dimension
    const height = 48; // cube height

    ctx.save();
    ctx.translate(x + quve.animOffset.x, y + quve.animOffset.y);

    if (quve.isDefeated) {
      ctx.globalAlpha = 0.35;
    }

    // Shadow underneath
    ctx.beginPath();
    ctx.ellipse(0, height / 2 + 10, size * 1.2, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Target Selection Ring
    if (isTargeted && quve.isAlive()) {
      ctx.beginPath();
      ctx.ellipse(0, height / 2 + 10, size * 1.5, size * 0.75, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#f56565';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Acting Glow
    if (isActing) {
      ctx.shadowColor = '#ecc94b';
      ctx.shadowBlur = 18;
    }

    const baseColor = quve.color || '#4a5568';
    const accentColor = quve.accent || '#a0aec0';

    // 1. TAIL PART (Drawn behind the main box)
    ctx.fillStyle = accentColor;
    if (quve.isPlayer) {
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(-size - 18, -12);
      ctx.lineTo(-size - 10, 8);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(size + 18, -12);
      ctx.lineTo(size + 10, 8);
      ctx.closePath();
      ctx.fill();
    }

    // 2. BACK PART (Dorsal fin / shell carapace on top-back)
    ctx.beginPath();
    ctx.moveTo(0, -height - 18);
    ctx.lineTo(-14, -height);
    ctx.lineTo(14, -height);
    ctx.closePath();
    ctx.fillStyle = accentColor;
    ctx.fill();

    // 3. MAIN CUBE BODY (Isometric 3 faces)
    // Left/Front Face
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size * 0.4);
    ctx.lineTo(-size, -size * 0.4 - height);
    ctx.lineTo(0, -height);
    ctx.closePath();
    ctx.fillStyle = baseColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.stroke();

    // Right/Front Face
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, -size * 0.4);
    ctx.lineTo(size, -size * 0.4 - height);
    ctx.lineTo(0, -height);
    ctx.closePath();
    ctx.fillStyle = adjustBrightness(baseColor, -25);
    ctx.fill();
    ctx.stroke();

    // Top Face
    ctx.beginPath();
    ctx.moveTo(0, -height);
    ctx.lineTo(-size, -size * 0.4 - height);
    ctx.lineTo(0, -size * 0.8 - height);
    ctx.lineTo(size, -size * 0.4 - height);
    ctx.closePath();
    ctx.fillStyle = adjustBrightness(baseColor, 30);
    ctx.fill();
    ctx.stroke();

    // 4. TOP PART (Horn / Sprout / Crest)
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.8 - height - 20);
    ctx.lineTo(-8, -size * 0.8 - height);
    ctx.lineTo(8, -size * 0.8 - height);
    ctx.closePath();
    ctx.fillStyle = accentColor;
    ctx.fill();

    // 5. SIDES / ARMS (Left & Right appendages)
    ctx.fillStyle = accentColor;
    ctx.fillRect(-size - 10, -height * 0.6, 8, 18);
    ctx.fillRect(size + 2, -height * 0.6, 8, 18);

    // 6. FACE PART (Eyes / Expression)
    ctx.fillStyle = '#ffffff';
    const eyeFaceX = quve.isPlayer ? 8 : -8;
    // Eye whites
    ctx.beginPath();
    ctx.arc(eyeFaceX - 6, -height * 0.55, 4, 0, Math.PI * 2);
    ctx.arc(eyeFaceX + 6, -height * 0.55, 4, 0, Math.PI * 2);
    ctx.fill();
    // Pupils
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(eyeFaceX - 5 + (quve.isPlayer ? 1 : -1), -height * 0.55, 2, 0, Math.PI * 2);
    ctx.arc(eyeFaceX + 7 + (quve.isPlayer ? 1 : -1), -height * 0.55, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 7. HEALTH & SHIELD BARS (Screen Space above Quve)
    this.drawHealthBar(ctx, x, y - height - 32, quve);
  }

  drawHealthBar(ctx, x, y, quve) {
    const barWidth = 84;
    const barHeight = 10;
    const startX = x - barWidth / 2;

    ctx.save();

    // Quve Name and Element Badge
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(`${quve.name} [${quve.baseType}]`, x, y - 8);

    // Speed & Position Badge
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#cbd5e0';
    ctx.fillText(`SPD ${quve.speed} | P${quve.position}`, x, y + barHeight + 14);

    // Bar Background
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(startX, y, barWidth, barHeight);

    // HP Bar
    const hpRatio = Math.max(0, quve.currentHp / quve.maxHp);
    const hpWidth = Math.floor(barWidth * hpRatio);
    ctx.fillStyle = hpRatio > 0.5 ? '#48bb78' : hpRatio > 0.25 ? '#ecc94b' : '#f56565';
    ctx.fillRect(startX, y, hpWidth, barHeight);

    // Shield Bar Overlay (if active)
    if (quve.shield > 0) {
      const shieldRatio = Math.min(1.0, quve.shield / quve.maxHp);
      const shieldWidth = Math.floor(barWidth * shieldRatio);
      ctx.fillStyle = 'rgba(66, 153, 225, 0.85)';
      ctx.fillRect(startX, y - 4, shieldWidth, 4);
    }

    // Border
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, y, barWidth, barHeight);

    // HP / Shield Text
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const hpText = quve.shield > 0 ? `${quve.currentHp} (+${quve.shield})` : `${quve.currentHp}/${quve.maxHp}`;
    ctx.fillText(hpText, x, y + 8);

    ctx.restore();
  }

  render(playerTeam, enemyTeam, selectedTargetId = null, activeCasterId = null) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Battleground Floor Grid
    this.drawBattlefieldGrid(ctx);

    // Render Player Quves
    playerTeam.forEach(quve => {
      const pos = this.positions[quve.id];
      if (pos) {
        this.drawIsometricQuve(ctx, pos.x, pos.y, quve, false, quve.id === activeCasterId);
      }
    });

    // Render Enemy Quves
    enemyTeam.forEach(quve => {
      const pos = this.positions[quve.id];
      if (pos) {
        const isTargeted = quve.id === selectedTargetId;
        this.drawIsometricQuve(ctx, pos.x, pos.y, quve, isTargeted, quve.id === activeCasterId);
      }
    });

    // Update and draw floating particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update and draw floating numbers
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      ft.opacity = ft.life / 60;

      ctx.save();
      ctx.font = ft.isCrit ? '900 24px "Arial Narrow", system-ui, sans-serif' : 'bold 15px system-ui, sans-serif';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.isCrit ? '#ff3d00' : '#000000';
      ctx.shadowBlur = ft.isCrit ? 14 : 6;
      if (ft.isCrit) { ctx.strokeStyle = '#521200'; ctx.lineWidth = 4; ctx.strokeText(ft.text, ft.x, ft.y); }
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();

      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  drawBattlefieldGrid(ctx) {
    ctx.save();
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const floorY = 246;

    const chamber = ctx.createLinearGradient(0, 0, 0, h);
    chamber.addColorStop(0, '#07101e');
    chamber.addColorStop(0.34, '#0a1423');
    chamber.addColorStop(1, '#050914');
    ctx.fillStyle = chamber;
    ctx.fillRect(0, 0, w, h);

    const blueWash = ctx.createRadialGradient(116, 134, 10, 116, 134, 390);
    blueWash.addColorStop(0, 'rgba(0,151,255,.23)');
    blueWash.addColorStop(1, 'rgba(0,70,150,0)');
    ctx.fillStyle = blueWash;
    ctx.fillRect(0, 0, cx + 90, h);
    const redWash = ctx.createRadialGradient(w - 105, 136, 10, w - 105, 136, 390);
    redWash.addColorStop(0, 'rgba(255,21,88,.22)');
    redWash.addColorStop(1, 'rgba(145,0,58,0)');
    ctx.fillStyle = redWash;
    ctx.fillRect(cx - 90, 0, cx + 90, h);

    this.drawArenaStands(ctx, w, cx);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, floorY, 475, 205, 0, 0, Math.PI * 2);
    ctx.clip();
    const floor = ctx.createRadialGradient(cx, 220, 20, cx, 230, 470);
    floor.addColorStop(0, '#142a3d');
    floor.addColorStop(.42, '#102235');
    floor.addColorStop(1, '#07111f');
    ctx.fillStyle = floor;
    ctx.fillRect(0, 62, w, h - 62);
    this.drawHexFloor(ctx, w, cx);
    ctx.restore();

    [
      [472, 204, 'rgba(80,113,148,.36)', 2],
      [445, 184, 'rgba(33,83,119,.55)', 2],
      [365, 142, 'rgba(56,112,149,.62)', 1.2],
      [265, 101, 'rgba(75,145,183,.54)', 1]
    ].forEach(([rx, ry, color, width]) => {
      ctx.beginPath();
      ctx.ellipse(cx, floorY, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    });

    this.drawRimLights(ctx, cx, floorY);
    this.drawCenterSeam(ctx, cx, h);

    const vignette = ctx.createRadialGradient(cx, 210, 170, cx, 205, 570);
    vignette.addColorStop(.45, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,2,9,.72)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  drawArenaStands(ctx, w, cx) {
    ctx.fillStyle = '#070d18';
    ctx.fillRect(0, 0, w, 72);
    ctx.strokeStyle = 'rgba(99,132,164,.18)';
    ctx.lineWidth = 1;
    for (let x = -12; x < w + 80; x += 92) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 8, 67);
      ctx.lineTo(x + 75, 67);
      ctx.lineTo(x + 86, 0);
      ctx.stroke();
    }

    const benchY = 70;
    for (let x = 18; x < w - 18; x += 132) {
      const light = x < cx ? '#1ec8ff' : '#ff276a';
      ctx.fillStyle = 'rgba(5,10,19,.9)';
      ctx.beginPath();
      ctx.moveTo(x, benchY);
      ctx.lineTo(x + 112, benchY);
      ctx.lineTo(x + 104, 93);
      ctx.lineTo(x + 9, 93);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(75,104,135,.2)';
      ctx.stroke();
      ctx.save();
      ctx.shadowColor = light;
      ctx.shadowBlur = 11;
      ctx.fillStyle = light;
      ctx.fillRect(x + 34, benchY + 12, 45, 3);
      ctx.restore();
    }

    const lip = ctx.createLinearGradient(0, 82, 0, 119);
    lip.addColorStop(0, '#111d2b');
    lip.addColorStop(1, '#050b13');
    ctx.fillStyle = lip;
    ctx.beginPath();
    ctx.moveTo(0, 82);
    ctx.quadraticCurveTo(cx, 124, w, 82);
    ctx.lineTo(w, 112);
    ctx.quadraticCurveTo(cx, 153, 0, 112);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(75,119,152,.35)';
    ctx.stroke();
  }

  drawHexFloor(ctx, w, cx) {
    const radius = 26;
    const hexH = Math.sqrt(3) * radius;
    ctx.lineWidth = .7;
    for (let row = 0; row < 11; row++) {
      for (let col = -1; col < 26; col++) {
        const x = col * radius * 1.5 + (row % 2 ? radius * .75 : 0);
        const y = 128 + row * hexH * .5;
        const color = x < cx ? '38,151,219' : '211,43,104';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = Math.PI / 3 * i;
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius * .72;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${color},.16)`;
        ctx.stroke();
      }
    }
  }

  drawRimLights(ctx, cx, cy) {
    for (let side = -1; side <= 1; side += 2) {
      const light = side < 0 ? '#16c8ff' : '#ff286c';
      for (let i = 0; i < 12; i++) {
        const start = side < 0 ? Math.PI * .58 + i * Math.PI * .075 : Math.PI * 1.58 + i * Math.PI * .075;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, 458, 195, 0, start, start + .09);
        ctx.strokeStyle = light;
        ctx.lineWidth = i % 3 === 0 ? 5 : 3;
        ctx.shadowColor = light;
        ctx.shadowBlur = 13;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawCenterSeam(ctx, cx, h) {
    const glow = ctx.createLinearGradient(cx, 55, cx, h);
    glow.addColorStop(0, 'rgba(80,207,255,0)');
    glow.addColorStop(.35, 'rgba(80,207,255,.85)');
    glow.addColorStop(1, 'rgba(80,207,255,.16)');
    ctx.save();
    ctx.strokeStyle = glow;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#36caff';
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.moveTo(cx, 62);
    ctx.lineTo(cx, h);
    ctx.stroke();
    for (let y = 74; y < h; y += 30) {
      ctx.fillStyle = '#71ddff';
      ctx.fillRect(cx - 5, y, 10, 2);
    }
    ctx.restore();
  }
}

function adjustBrightness(hex, percent) {
  let num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00FF) + percent;
  let b = (num & 0x0000FF) + percent;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
