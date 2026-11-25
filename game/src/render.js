// DAPUR KILAT — render: draws the whole kitchen on one canvas.
(function () {
  var DK = window.DK || (window.DK = {});
  var L = DK.LAYOUT;
  var C = DK.COLORS;
  var T = DK.TUNING;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(ctx, s, x, y, font, color, align) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }

  function heart(ctx, x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-11, -4, -6, -12, 0, -6);
    ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // One ingredient's icon, drawn from shapes (no emoji, no images).
  function drawIngredientIcon(ctx, kind, state, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    if (kind === 'nasi') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, 2, r, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#fff3d6';
      for (var i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.arc(i * r * 0.32, -r * 0.25, r * 0.28, Math.PI, 0); ctx.fill();
      }
      ctx.fillStyle = '#8a6d3b';
      ctx.beginPath(); ctx.arc(0, 2, r, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#fff3d6';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.8, Math.PI, 0); ctx.fill();
    } else if (kind === 'mie') {
      ctx.strokeStyle = '#f2c14e';
      ctx.lineWidth = r * 0.22;
      ctx.lineCap = 'round';
      for (var w = -1; w <= 1; w++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, w * r * 0.4);
        ctx.bezierCurveTo(-r * 0.3, w * r * 0.4 - r * 0.5, r * 0.3, w * r * 0.4 + r * 0.5, r * 0.8, w * r * 0.4);
        ctx.stroke();
      }
    } else if (kind === 'ayam') {
      ctx.fillStyle = '#b45a24';
      ctx.beginPath(); ctx.arc(-r * 0.15, -r * 0.1, r * 0.62, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e07840';
      ctx.beginPath(); ctx.arc(-r * 0.15, -r * 0.1, r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f5e6c8';
      ctx.lineWidth = r * 0.22;
      ctx.beginPath(); ctx.moveTo(r * 0.3, r * 0.3); ctx.lineTo(r * 0.8, r * 0.75); ctx.stroke();
      ctx.fillStyle = '#f5e6c8';
      ctx.beginPath(); ctx.arc(r * 0.82, r * 0.8, r * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.62, r * 0.92, r * 0.2, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'telur') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffb703';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'sayur') {
      ctx.fillStyle = '#2f9e44';
      for (var l = 0; l < 3; l++) {
        var a = -0.6 + l * 0.6;
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.32, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#58b368';
      ctx.beginPath(); ctx.ellipse(0, -r * 0.2, r * 0.3, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'sambal') {
      ctx.fillStyle = '#8f1d1d';
      ctx.beginPath(); ctx.arc(0, 2, r, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#d92b2b';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.85, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#ff5a3c';
      ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.2, r * 0.18, 0, Math.PI * 2); ctx.fill();
    }
    if (state === 'burnt') {
      ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    }
    if (state === 'raw') {
      ctx.strokeStyle = 'rgba(43, 33, 24, 0.65)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function drawPlateWithItems(ctx, items, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#e9eef2';
    ctx.beginPath(); ctx.ellipse(0, 0, 46, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b9c2cc';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 46, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, 32, 20, 0, 0, Math.PI * 2); ctx.stroke();
    var spots = [[-18, -4], [16, -8], [0, 8], [-2, -12]];
    for (var i = 0; i < items.length && i < 4; i++) {
      drawIngredientIcon(ctx, items[i].kind, items[i].state, spots[i][0], spots[i][1], 13);
    }
    ctx.restore();
  }

  function stationGlow(ctx, rect, active, color) {
    if (!active) return;
    ctx.save();
    ctx.strokeStyle = color || '#ffd166';
    ctx.lineWidth = 4;
    ctx.shadowColor = color || '#ffd166';
    ctx.shadowBlur = 14;
    rr(ctx, rect.x - 3, rect.y - 3, rect.w + 6, rect.h + 6, 12);
    ctx.stroke();
    ctx.restore();
  }

  function drawBackground(ctx, S) {
    ctx.fillStyle = C.floorA;
    ctx.fillRect(0, L.floorTop, DK.W, DK.H - L.floorTop);
    ctx.fillStyle = C.floorB;
    var tile = 64;
    for (var ty = L.floorTop; ty < DK.H; ty += tile) {
      for (var tx = 0; tx < DK.W; tx += tile) {
        if (((tx / tile) + (ty / tile)) % 2 === 0) ctx.fillRect(tx, ty, tile, tile);
      }
    }
    ctx.fillStyle = C.wall;
    ctx.fillRect(0, L.boardY, DK.W, L.floorTop - L.boardY);
    ctx.fillStyle = C.wallTrim;
    ctx.fillRect(0, L.floorTop - 8, DK.W, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (var bx = 0; bx < DK.W; bx += 96) ctx.fillRect(bx, L.boardY + 6, 2, L.floorTop - L.boardY - 14);
  }

  function drawHUD(ctx, S) {
    ctx.fillStyle = '#3a2417';
    ctx.fillRect(0, 0, DK.W, L.hudH);
    text(ctx, 'DAPUR KILAT', 24, 30, '900 26px system-ui, sans-serif', '#ffb703');
    text(ctx, 'SKOR  ' + S.score, 300, 30, '700 20px system-ui, sans-serif', '#fff8e7');
    text(ctx, 'KOMBO  x' + S.combo, 470, 30, '700 20px system-ui, sans-serif', S.combo >= 3 ? '#ffd166' : '#fff8e7');
    text(ctx, 'LEVEL ' + S.level, 640, 30, '700 20px system-ui, sans-serif', '#fff8e7');
    var mm = Math.floor(S.elapsed / 60);
    var ss = Math.floor(S.elapsed % 60);
    text(ctx, (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss, 800, 30, '700 20px system-ui, sans-serif', '#fff8e7');
    for (var i = 0; i < 3; i++) {
      heart(ctx, 1150 + i * 34, 28, 1.5, i < S.hearts ? '#ff4d6d' : '#5a3a32');
    }
    text(ctx, 'P: jeda   M: suara', 980, 30, '13px system-ui, sans-serif', '#cbb693');
  }

  function drawOrders(ctx, S) {
    text(ctx, 'PAPAN PESANAN', 30, L.boardY + 16, '700 13px system-ui, sans-serif', '#ffd166');
    var slotW = 380;
    var slotGap = 20;
    for (var i = 0; i < 3; i++) {
      var x = 30 + i * (slotW + slotGap);
      var y = L.boardY + 24;
      if (i >= S.orders.length) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#fff8e7';
        rr(ctx, x, y, slotW, 58, 10);
        ctx.fill();
        ctx.restore();
        text(ctx, '— menunggu pesanan —', x + slotW / 2, y + 30, '15px system-ui, sans-serif', '#fff8e7', 'center');
        continue;
      }
      var o = S.orders[i];
      var urgent = o.timeLeft <= 10;
      ctx.save();
      if (urgent && Math.floor(S.elapsed * 4) % 2 === 0) {
        ctx.strokeStyle = '#ff4d6d';
        ctx.lineWidth = 3;
        rr(ctx, x - 2, y - 2, slotW + 4, 62, 12);
        ctx.stroke();
      }
      ctx.fillStyle = '#fff8e7';
      rr(ctx, x, y, slotW, 58, 10);
      ctx.fill();
      ctx.restore();
      text(ctx, o.dish.name, x + 14, y + 20, '700 18px system-ui, sans-serif', C.ink);
      text(ctx, o.dish.price + ' koin', x + slotW - 14, y + 20, '700 15px system-ui, sans-serif', '#b45a24', 'right');
      var plate = DK.world.plateItems();
      var chips = o.dish.needs;
      for (var k = 0; k < chips.length; k++) {
        var cx = x + 26 + k * 46;
        var cy = y + 44;
        var key = chips[k][0] + ':' + chips[k][1];
        var have = false;
        for (var m = 0; m < plate.length; m++) {
          if (plate[m].kind + ':' + plate[m].state === key) { have = true; break; }
        }
        ctx.save();
        ctx.fillStyle = have ? '#d8f5dd' : '#eee3cd';
        ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = have ? '#2f9e44' : '#b9a67e';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        drawIngredientIcon(ctx, chips[k][0], chips[k][1], cx, cy, 9);
        if (have) {
          ctx.strokeStyle = '#2f9e44';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx - 5, cy);
          ctx.lineTo(cx - 1, cy + 5);
          ctx.lineTo(cx + 6, cy - 5);
          ctx.stroke();
        }
      }
      var frac = Math.max(0, o.timeLeft / o.total);
      var barW = slotW - 28;
      var barX = x + 14;
      var barY = y + 58 - 8;
      ctx.fillStyle = '#e5d9bd';
      rr(ctx, barX, barY, barW, 8, 4);
      ctx.fill();
      ctx.fillStyle = frac > 0.5 ? '#2f9e44' : frac > 0.25 ? '#f08c00' : '#d92b2b';
      if (frac > 0) {
        rr(ctx, barX, barY, barW * frac, 8, 4);
        ctx.fill();
      }
      text(ctx, Math.ceil(o.timeLeft) + ' dtk', x + slotW - 14, y + 44, '700 14px system-ui, sans-serif', urgent ? '#d92b2b' : '#6b5a44', 'right');
    }
  }

  function drawBins(ctx, S, near) {
    for (var i = 0; i < DK.INGREDIENT_ORDER.length; i++) {
      var kind = DK.INGREDIENT_ORDER[i];
      var def = DK.INGREDIENTS[kind];
      var r = DK.world.binRect(i);
      var isNear = near && near.type === 'bin' && near.kind === kind;
      ctx.save();
      ctx.fillStyle = C.wood;
      rr(ctx, r.x, r.y, r.w, r.h, 10);
      ctx.fill();
      ctx.fillStyle = '#f3e2bd';
      rr(ctx, r.x + 5, r.y + 5, r.w - 10, r.h - 10, 8);
      ctx.fill();
      ctx.restore();
      drawIngredientIcon(ctx, kind, def.prep === 'ready' ? 'ready' : 'raw', r.x + r.w / 2, r.y + 24, 15);
      text(ctx, def.name, r.x + r.w / 2, r.y + 50, '700 14px system-ui, sans-serif', C.ink, 'center');
      stationGlow(ctx, r, isNear);
    }
  }

  function drawBoard(ctx, S, near) {
    var r = L.board;
    var isNear = near && near.type === 'board';
    ctx.fillStyle = C.woodDark;
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.fillStyle = '#d9a066';
    rr(ctx, r.x + 10, r.y + 12, r.w - 20, r.h - 34, 8);
    ctx.fill();
    if (S.board.item) {
      drawIngredientIcon(ctx, 'sayur', S.board.item.state, r.x + r.w / 2, r.y + 52, 22);
      var done = S.board.chops;
      for (var i = 0; i < 3; i++) {
        ctx.fillStyle = i < done ? '#2f9e44' : '#cbb693';
        ctx.beginPath(); ctx.arc(r.x + r.w / 2 - 24 + i * 24, r.y + r.h - 26, 7, 0, Math.PI * 2); ctx.fill();
      }
      if (S.board.knifeT > 0) {
        ctx.save();
        ctx.translate(r.x + r.w / 2 + 30, r.y + 40);
        ctx.rotate(-0.5 + (0.28 - S.board.knifeT) * 2);
        ctx.fillStyle = '#c9ced6';
        ctx.fillRect(-4, -26, 8, 34);
        ctx.fillStyle = '#5a3a32';
        ctx.fillRect(-5, 8, 10, 16);
        ctx.restore();
      }
    }
    text(ctx, 'TALENAN', r.x + r.w / 2, r.y + r.h - 8, '700 12px system-ui, sans-serif', '#fff8e7', 'center');
    stationGlow(ctx, r, isNear);
  }

  function drawStove(ctx, S, near) {
    var r = L.stove;
    var isNear = near && near.type === 'stove';
    ctx.fillStyle = '#3c4148';
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.fillStyle = '#565d66';
    rr(ctx, r.x + 8, r.y + 8, r.w - 16, r.h - 16, 8);
    ctx.fill();
    for (var b = 0; b < 2; b++) {
      var bp = L.stove.burners[b];
      var burner = S.burners[b];
      ctx.fillStyle = '#22262b';
      ctx.beginPath(); ctx.arc(bp.x, bp.y, 34, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7d838d';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(bp.x, bp.y, 34, 0, Math.PI * 2); ctx.stroke();
      if (burner.item) {
        var cooking = burner.item.state === 'raw';
        if (cooking) {
          var flick = 0.75 + Math.random() * 0.25;
          ctx.fillStyle = 'rgba(255, 140, 0, ' + (0.55 * flick) + ')';
          ctx.beginPath();
          ctx.moveTo(bp.x - 22, bp.y + 26);
          ctx.quadraticCurveTo(bp.x - 26, bp.y - 6, bp.x, bp.y - 16);
          ctx.quadraticCurveTo(bp.x + 26, bp.y - 6, bp.x + 22, bp.y + 26);
          ctx.closePath();
          ctx.fill();
          var frac = Math.min(1, burner.t / T.stoveCookSeconds);
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, 42, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
          ctx.stroke();
        }
        if (burner.item.state === 'cooked') {
          ctx.strokeStyle = '#7ee787';
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(bp.x, bp.y, 42, 0, Math.PI * 2); ctx.stroke();
        }
        if (burner.item.state === 'burnt') {
          ctx.fillStyle = 'rgba(120, 120, 120, 0.7)';
          ctx.beginPath(); ctx.arc(bp.x - 8, bp.y - 30, 8, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(bp.x + 6, bp.y - 42, 10, 0, Math.PI * 2); ctx.fill();
        }
        drawIngredientIcon(ctx, burner.item.kind, burner.item.state, bp.x, bp.y, 20);
      } else {
        ctx.strokeStyle = '#4a5058';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(bp.x, bp.y, 20, 0, Math.PI * 2); ctx.stroke();
      }
    }
    text(ctx, 'KOMPOR', r.x + r.w / 2, r.y + r.h - 8, '700 12px system-ui, sans-serif', '#fff8e7', 'center');
    stationGlow(ctx, r, isNear);
  }

  function drawPlateStation(ctx, S, near) {
    var r = L.plate;
    var isNear = near && near.type === 'plate';
    ctx.fillStyle = C.steel;
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.fillStyle = '#f4f7f9';
    rr(ctx, r.x + 8, r.y + 8, r.w - 16, r.h - 16, 8);
    ctx.fill();
    var items = S.plate.items;
    var ready = DK.world.matchingOrder() && DK.world.carryingPlateIndex() < 0;
    if (items.length > 0) {
      drawPlateWithItems(ctx, items, r.x + r.w / 2, r.y + 52, 1.15);
      if (ready || S.flashServe > 0) {
        ctx.save();
        ctx.strokeStyle = '#ffb703';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ffb703';
        ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + 52, 62, 40, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        text(ctx, 'SIAP DISAJIKAN!', r.x + r.w / 2, r.y + r.h - 26, '800 15px system-ui, sans-serif', '#b45a24', 'center');
      }
    } else {
      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#9aa1ad';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + 52, 46, 30, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      text(ctx, 'piring kosong', r.x + r.w / 2, r.y + 52, '13px system-ui, sans-serif', '#9aa1ad', 'center');
    }
    text(ctx, 'MEJA RACIK', r.x + r.w / 2, r.y + r.h - 8, '700 12px system-ui, sans-serif', '#5a6b7a', 'center');
    stationGlow(ctx, r, isNear);
  }

  function drawServe(ctx, S, near) {
    var r = L.serve;
    var isNear = near && near.type === 'serve';
    var carryingReady = DK.world.carryingPlateIndex() >= 0 && DK.world.matchingOrder();
    ctx.fillStyle = '#7d4f24';
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    for (var i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#d92b2b' : '#fff8e7';
      ctx.fillRect(r.x + 6 + i * ((r.w - 12) / 4), r.y + 6, (r.w - 12) / 4, 26);
    }
    ctx.fillStyle = '#f3e2bd';
    rr(ctx, r.x + 10, r.y + 40, r.w - 20, r.h - 52, 8);
    ctx.fill();
    ctx.fillStyle = '#c9a227';
    ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + 66, 14, Math.PI, 0); ctx.fill();
    ctx.fillRect(r.x + r.w / 2 - 18, r.y + 66, 36, 5);
    text(ctx, 'SERAHKAN', r.x + r.w / 2, r.y + r.h - 8, '800 13px system-ui, sans-serif', '#fff8e7', 'center');
    if (carryingReady) {
      ctx.save();
      ctx.strokeStyle = '#7ee787';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#7ee787';
      ctx.shadowBlur = 16;
      rr(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 12);
      ctx.stroke();
      ctx.restore();
    }
    stationGlow(ctx, r, isNear, '#ffd166');
  }

  function drawTrash(ctx, S, near) {
    var r = L.trash;
    var isNear = near && near.type === 'trash';
    ctx.fillStyle = '#6b7280';
    rr(ctx, r.x, r.y + 14, r.w, r.h - 14, 10);
    ctx.fill();
    ctx.fillStyle = '#4b5563';
    rr(ctx, r.x - 4, r.y, r.w + 8, 18, 8);
    ctx.fill();
    text(ctx, 'SAMPAH', r.x + r.w / 2, r.y + r.h - 10, '700 12px system-ui, sans-serif', '#e5e7eb', 'center');
    stationGlow(ctx, r, isNear);
  }

  function drawCook(ctx, S) {
    var c = S.cook;
    var bob = Math.sin(c.walkPhase) * 2;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(c.x, c.y + 24, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(c.x, c.y + bob);
    ctx.fillStyle = '#2b2118';
    ctx.fillRect(-14, 14, 10, 12);
    ctx.fillRect(4, 14, 10, 12);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 2, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3b82c4';
    ctx.fillRect(-16, 8, 32, 12);
    ctx.fillStyle = '#f2c89b';
    ctx.beginPath(); ctx.arc(0, -22, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-6, -36, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -36, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -32, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-12, -34, 24, 6);
    ctx.fillStyle = '#2b2118';
    ctx.beginPath(); ctx.arc(-5 + c.dir * 2, -22, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5 + c.dir * 2, -22, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c.dir * 2, -16, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.restore();
    for (var i = 0; i < c.carrying.length; i++) {
      var it = c.carrying[i];
      var ix = c.x - 22 + i * 44;
      var iy = c.y - 80 + bob;
      ctx.fillStyle = 'rgba(255, 248, 231, 0.95)';
      ctx.beginPath(); ctx.arc(ix, iy, 17, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#b9a67e';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ix, iy, 17, 0, Math.PI * 2); ctx.stroke();
      if (it.kind === 'plate') {
        drawPlateWithItems(ctx, it.items, ix, iy, 0.32);
      } else {
        drawIngredientIcon(ctx, it.kind, it.state, ix, iy, 11);
      }
    }
  }

  function promptFor(S, near) {
    if (!near) return '';
    var c = S.cook;
    if (near.type === 'bin') return 'E — Ambil ' + DK.INGREDIENTS[near.kind].name;
    if (near.type === 'board') {
      if (!S.board.item) return 'E — Taruh Sayur';
      if (S.board.item.state === 'raw') return 'E — Potong! (' + S.board.chops + '/3)';
      return 'E — Ambil Sayur';
    }
    if (near.type === 'stove') {
      for (var b = 0; b < 2; b++) {
        if (S.burners[b].item && (S.burners[b].item.state === 'cooked' || S.burners[b].item.state === 'burnt')) return 'E — Angkat dari kompor';
      }
      for (var k = 0; k < c.carrying.length; k++) {
        if (c.carrying[k].state === 'raw' && DK.INGREDIENTS[c.carrying[k].kind].prep === 'cook') return 'E — Masak di kompor';
      }
      return 'E — Kompor';
    }
    if (near.type === 'plate') {
      if (DK.world.carryingPlateIndex() >= 0) return 'E — Taruh piring';
      for (var i = 0; i < c.carrying.length; i++) {
        var it = c.carrying[i];
        if (it.state === 'ready' || it.state === 'cooked' || it.state === 'chopped') return 'E — Racik ke piring';
      }
      if (S.plate.items.length > 0) return 'E — Angkat piring';
      return 'E — Meja racik';
    }
    if (near.type === 'serve') return 'E — Serahkan pesanan';
    if (near.type === 'trash') return 'E — Buang';
    return '';
  }

  function drawPrompt(ctx, S, near) {
    if (!near || S.state !== 'playing') return;
    var label = promptFor(S, near);
    if (!label) return;
    ctx.font = '700 15px system-ui, sans-serif';
    var w = ctx.measureText(label).width + 24;
    var x = Math.max(8, Math.min(DK.W - w - 8, S.cook.x - w / 2));
    var y = S.cook.y + 44;
    ctx.fillStyle = 'rgba(43, 33, 24, 0.92)';
    rr(ctx, x, y, w, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + 16);
  }

  function drawPopups(ctx, S) {
    for (var i = 0; i < S.popups.length; i++) {
      var p = S.popups[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      text(ctx, p.text, p.x, p.y, '800 19px system-ui, sans-serif', p.color, 'center');
      ctx.restore();
    }
  }

  function drawTitle(ctx, S) {
    ctx.fillStyle = 'rgba(30, 18, 10, 0.82)';
    ctx.fillRect(0, 0, DK.W, DK.H);
    text(ctx, 'DAPUR KILAT', 640, 200, '900 84px system-ui, sans-serif', '#ffb703', 'center');
    text(ctx, 'Masak cepat, sajikan tepat waktu!', 640, 268, '700 26px system-ui, sans-serif', '#fff8e7', 'center');
    var lines = [
      'Ambil bahan dari rak, olah di talenan dan kompor,',
      'racik di meja, lalu serahkan sebelum waktu habis.',
      '',
      'WASD / Panah — gerak      E / Spasi — pakai stasiun      Klik — jalan / pakai',
      '3 pesanan hangus = shift berakhir. Kombo menaikkan koin!',
    ];
    for (var i = 0; i < lines.length; i++) {
      text(ctx, lines[i], 640, 330 + i * 32, '18px system-ui, sans-serif', '#e8d9b8', 'center');
    }
    text(ctx, 'Resep: Nasi Goreng  •  Ayam Geprek  •  Mie Goreng  •  Soto Ayam  •  Gado-Gado', 640, 540, '700 18px system-ui, sans-serif', '#ffd166', 'center');
    if (Math.floor(S.elapsed * 2) % 2 === 0) {
      text(ctx, 'Tekan ENTER atau klik untuk mulai', 640, 620, '800 24px system-ui, sans-serif', '#ffffff', 'center');
    }
  }

  function drawGameOver(ctx, S) {
    ctx.fillStyle = 'rgba(30, 18, 10, 0.82)';
    ctx.fillRect(0, 0, DK.W, DK.H);
    text(ctx, 'SHIFT BERAKHIR!', 640, 250, '900 64px system-ui, sans-serif', '#ff6b6b', 'center');
    text(ctx, 'SKOR AKHIR  ' + S.score, 640, 340, '800 34px system-ui, sans-serif', '#fff8e7', 'center');
    text(ctx, 'Pesanan disajikan: ' + S.serves + '    Kombo terbaik: x' + S.bestCombo + '    Level: ' + S.level, 640, 400, '20px system-ui, sans-serif', '#e8d9b8', 'center');
    text(ctx, 'Tekan R untuk main lagi', 640, 480, '800 24px system-ui, sans-serif', '#ffd166', 'center');
  }

  function drawHelp(ctx, S) {
    ctx.fillStyle = 'rgba(30, 18, 10, 0.88)';
    ctx.fillRect(0, 0, DK.W, DK.H);
    text(ctx, 'RESEP DAPUR KILAT', 640, 150, '900 40px system-ui, sans-serif', '#ffb703', 'center');
    var y = 220;
    for (var i = 0; i < DK.DISHES.length; i++) {
      var d = DK.DISHES[i];
      var parts = d.needs.map(function (n) {
        return DK.INGREDIENTS[n[0]].name + ' (' + (n[1] === 'ready' ? 'siap' : n[1] === 'cooked' ? 'dimasak' : 'dipotong') + ')';
      }).join(' + ');
      text(ctx, d.name + ' — ' + parts + '  •  ' + d.price + ' koin', 640, y, '700 20px system-ui, sans-serif', '#fff8e7', 'center');
      y += 40;
    }
    text(ctx, 'Sayur dipotong 3x di talenan. Mie, Ayam, Telur dimasak 3 detik — jangan sampai gosong!', 640, y + 20, '18px system-ui, sans-serif', '#e8d9b8', 'center');
    text(ctx, 'Tekan H untuk menutup', 640, y + 70, '800 20px system-ui, sans-serif', '#ffd166', 'center');
  }

  function drawGame(ctx, S) {
    ctx.save();
    if (S.shake > 0) {
      var m = S.shake * 14;
      ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }
    drawBackground(ctx, S);
    var near = S.state === 'playing' ? DK.world.nearestStation() : null;
    drawBins(ctx, S, near);
    drawBoard(ctx, S, near);
    drawStove(ctx, S, near);
    drawPlateStation(ctx, S, near);
    drawServe(ctx, S, near);
    drawTrash(ctx, S, near);
    drawCook(ctx, S);
    drawOrders(ctx, S);
    drawHUD(ctx, S);
    drawPrompt(ctx, S, near);
    drawPopups(ctx, S);
    ctx.restore();
    if (S.state === 'title') drawTitle(ctx, S);
    if (S.state === 'over') drawGameOver(ctx, S);
    if (S.state === 'paused') {
      ctx.fillStyle = 'rgba(30, 18, 10, 0.6)';
      ctx.fillRect(0, 0, DK.W, DK.H);
      text(ctx, 'JEDA', 640, 380, '900 64px system-ui, sans-serif', '#fff8e7', 'center');
      text(ctx, 'Tekan P untuk lanjut', 640, 450, '20px system-ui, sans-serif', '#e8d9b8', 'center');
    }
    if (S.showHelp) drawHelp(ctx, S);
  }

  DK.render = {
    drawGame: drawGame,
    drawIngredientIcon: drawIngredientIcon,
    drawPlateWithItems: drawPlateWithItems,
  };
})();
