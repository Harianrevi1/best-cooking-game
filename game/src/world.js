// DAPUR KILAT — world: game state, orders, stations, cooking, serving.
(function () {
  var DK = window.DK || (window.DK = {});
  var T = DK.TUNING;
  var L = DK.LAYOUT;

  function binRect(i) {
    return {
      x: L.bins.x + i * (L.bins.w + L.bins.gap),
      y: L.bins.y,
      w: L.bins.w,
      h: L.bins.h,
    };
  }

  function stationRects() {
    var rects = [];
    for (var i = 0; i < DK.INGREDIENT_ORDER.length; i++) {
      rects.push({ type: 'bin', kind: DK.INGREDIENT_ORDER[i], rect: binRect(i) });
    }
    rects.push({ type: 'board', rect: L.board });
    rects.push({ type: 'stove', rect: L.stove });
    rects.push({ type: 'plate', rect: L.plate });
    rects.push({ type: 'serve', rect: L.serve });
    rects.push({ type: 'trash', rect: L.trash });
    return rects;
  }

  function distToRect(px, py, r) {
    var cx = Math.max(r.x, Math.min(px, r.x + r.w));
    var cy = Math.max(r.y, Math.min(py, r.y + r.h));
    return Math.hypot(px - cx, py - cy);
  }

  function itemKey(item) { return item.kind + ':' + item.state; }

  function needsOf(dish) {
    return dish.needs.map(function (n) { return n[0] + ':' + n[1]; });
  }

  function plateMatches(order, items) {
    var need = needsOf(order.dish).slice().sort();
    var have = items.map(itemKey).sort();
    if (need.length !== have.length) return false;
    for (var i = 0; i < need.length; i++) if (need[i] !== have[i]) return false;
    return true;
  }

  var S = null; // the world state

  function newWorld() {
    return {
      state: 'title',
      score: 0,
      combo: 0,
      bestCombo: 0,
      level: 1,
      serves: 0,
      missed: 0,
      hearts: T.hearts,
      elapsed: 0,
      spawnTimer: T.firstOrderAt,
      orders: [],
      cook: { x: 640, y: 580, dir: 1, carrying: [], walkPhase: 0 },
      board: { item: null, chops: 0, knifeT: 0 },
      burners: [
        { item: null, t: 0, cooked: false, burnt: false },
        { item: null, t: 0, cooked: false, burnt: false },
      ],
      plate: { items: [] },
      popups: [],
      shake: 0,
      showHelp: false,
      flashServe: 0,
    };
  }

  function dishById(id) {
    for (var i = 0; i < DK.DISHES.length; i++) {
      if (DK.DISHES[i].id === id) return DK.DISHES[i];
    }
    return DK.DISHES[0];
  }

  function spawnOrder() {
    if (S.orders.length >= T.maxOrders) return;
    var dish = DK.DISHES[Math.floor(Math.random() * DK.DISHES.length)];
    var time = Math.max(T.orderTimeMin, T.orderTimeStart - 2 * (S.level - 1));
    S.orders.push({ dish: dish, timeLeft: time, total: time });
    DK.sfx.tick();
  }

  function addPopup(x, y, text, color) {
    S.popups.push({ x: x, y: y, text: text, color: color || '#ffffff', life: 1.3 });
  }

  function handFree() {
    return S.cook.carrying.length < T.handSlots;
  }

  function carryingPlate() {
    for (var i = 0; i < S.cook.carrying.length; i++) {
      if (S.cook.carrying[i].kind === 'plate') return i;
    }
    return -1;
  }

  function plateItems() {
    var pi = carryingPlate();
    if (pi >= 0) return S.cook.carrying[pi].items;
    return S.plate.items;
  }

  function matchingOrder() {
    var items = plateItems();
    if (items.length === 0) return null;
    for (var i = 0; i < S.orders.length; i++) {
      if (plateMatches(S.orders[i], items)) return S.orders[i];
    }
    return null;
  }

  function nearestStation() {
    var c = S.cook;
    var best = null;
    var bestGap = Infinity;
    var rects = stationRects();
    for (var i = 0; i < rects.length; i++) {
      var gap = distToRect(c.x, c.y, rects[i].rect) - T.cookRadius;
      if (gap < T.interactRange && gap < bestGap) {
        bestGap = gap;
        best = rects[i];
      }
    }
    return best;
  }

  function takeFromHand(pred) {
    for (var i = 0; i < S.cook.carrying.length; i++) {
      if (pred(S.cook.carrying[i])) return S.cook.carrying.splice(i, 1)[0];
    }
    return null;
  }

  function interact() {
    if (S.state !== 'playing') return;
    var st = nearestStation();
    var c = S.cook;
    if (!st) {
      addPopup(c.x, c.y - 50, 'Dekati stasiun dulu!', '#ffd166');
      return;
    }
    if (st.type === 'bin') {
      var def = DK.INGREDIENTS[st.kind];
      if (!handFree()) {
        addPopup(c.x, c.y - 50, 'Tangan penuh!', '#ff6b6b');
        return;
      }
      var state = def.prep === 'ready' ? 'ready' : 'raw';
      S.cook.carrying.push({ kind: st.kind, state: state });
      DK.sfx.pickup();
      addPopup(c.x, c.y - 50, '+' + def.name, '#ffffff');
      return;
    }
    if (st.type === 'board') {
      if (!S.board.item) {
        var raw = takeFromHand(function (it) { return it.kind === 'sayur' && it.state === 'raw'; });
        if (raw) {
          S.board.item = raw;
          S.board.chops = 0;
          DK.sfx.place();
        } else {
          addPopup(c.x, c.y - 50, 'Taruh Sayur mentah di sini', '#ffd166');
        }
        return;
      }
      if (S.board.item.state === 'raw') {
        S.board.chops++;
        S.board.knifeT = 0.28;
        DK.sfx.chop();
        if (S.board.chops >= T.chopsNeeded) {
          S.board.item.state = 'chopped';
          addPopup(c.x, c.y - 50, 'Sayur siap!', '#7ee787');
        }
        return;
      }
      if (handFree()) {
        S.cook.carrying.push(S.board.item);
        S.board.item = null;
        S.board.chops = 0;
        DK.sfx.pickup();
      } else {
        addPopup(c.x, c.y - 50, 'Tangan penuh!', '#ff6b6b');
      }
      return;
    }
    if (st.type === 'stove') {
      var bi = 0;
      var bd = Infinity;
      for (var b = 0; b < 2; b++) {
        var bp = L.stove.burners[b];
        var d = Math.hypot(c.x - bp.x, c.y - bp.y);
        if (d < bd) { bd = d; bi = b; }
      }
      var burner = S.burners[bi];
      if (!burner.item) {
        var rawCook = takeFromHand(function (it) {
          return it.state === 'raw' && DK.INGREDIENTS[it.kind].prep === 'cook';
        });
        if (rawCook) {
          burner.item = rawCook;
          burner.t = 0;
          burner.cooked = false;
          burner.burnt = false;
          DK.sfx.place();
        } else {
          addPopup(c.x, c.y - 50, 'Taruh bahan mentah (Mie/Ayam/Telur)', '#ffd166');
        }
        return;
      }
      if (burner.item.state === 'cooked' || burner.item.state === 'burnt') {
        if (handFree()) {
          var done = burner.item;
          burner.item = null;
          burner.t = 0;
          S.cook.carrying.push(done);
          DK.sfx.pickup();
          if (done.state === 'burnt') addPopup(c.x, c.y - 50, 'Gosong! Buang ke sampah', '#ff6b6b');
        } else {
          addPopup(c.x, c.y - 50, 'Tangan penuh!', '#ff6b6b');
        }
        return;
      }
      addPopup(c.x, c.y - 50, 'Masih dimasak...', '#ffd166');
      return;
    }
    if (st.type === 'plate') {
      var pi = carryingPlate();
      if (pi >= 0) {
        S.plate.items = S.cook.carrying[pi].items;
        S.cook.carrying.splice(pi, 1);
        DK.sfx.place();
        return;
      }
      var readyIdx = -1;
      for (var i = 0; i < S.cook.carrying.length; i++) {
        var it = S.cook.carrying[i];
        if (it.state === 'ready' || it.state === 'cooked' || it.state === 'chopped') { readyIdx = i; break; }
      }
      if (readyIdx >= 0) {
        if (S.plate.items.length >= T.plateSlots) {
          addPopup(c.x, c.y - 50, 'Piring penuh!', '#ff6b6b');
          return;
        }
        S.plate.items.push(S.cook.carrying.splice(readyIdx, 1)[0]);
        DK.sfx.place();
        if (matchingOrder()) {
          S.flashServe = 0.6;
          DK.sfx.ding();
        }
        return;
      }
      var rawIdx = -1;
      for (var j = 0; j < S.cook.carrying.length; j++) {
        if (S.cook.carrying[j].state === 'raw') { rawIdx = j; break; }
      }
      if (rawIdx >= 0) {
        addPopup(c.x, c.y - 50, 'Olah dulu bahannya!', '#ffd166');
        return;
      }
      if (S.plate.items.length > 0 && handFree()) {
        S.cook.carrying.push({ kind: 'plate', items: S.plate.items });
        S.plate.items = [];
        DK.sfx.pickup();
        return;
      }
      addPopup(c.x, c.y - 50, 'Piring kosong — tambah bahan dulu', '#ffd166');
      return;
    }
    if (st.type === 'serve') {
      var pi2 = carryingPlate();
      if (pi2 < 0) {
        addPopup(c.x, c.y - 50, 'Bawa piring yang sudah jadi ke sini', '#ffd166');
        return;
      }
      var order = matchingOrder();
      if (!order) {
        addPopup(c.x, c.y - 50, 'Belum cocok dengan pesanan!', '#ff6b6b');
        DK.sfx.fail();
        return;
      }
      var bonus = Math.min(S.combo, 4) * 2;
      var gained = order.dish.price + bonus;
      S.score += gained;
      S.combo++;
      if (S.combo > S.bestCombo) S.bestCombo = S.combo;
      S.serves++;
      S.level = Math.floor(S.serves / T.servesPerLevel) + 1;
      S.orders.splice(S.orders.indexOf(order), 1);
      S.cook.carrying.splice(pi2, 1);
      S.flashServe = 0.9;
      DK.sfx.serve();
      addPopup(1150, 330, '+' + gained + '  ' + order.dish.name + '!', '#ffd166');
      if (S.serves % T.servesPerLevel === 0) {
        DK.sfx.levelUp();
        addPopup(640, 300, 'LEVEL ' + S.level + ' — makin ramai!', '#7ee787');
      }
      return;
    }
    if (st.type === 'trash') {
      var pi3 = carryingPlate();
      if (pi3 >= 0) {
        S.cook.carrying[pi3].items = [];
        DK.sfx.place();
        addPopup(c.x, c.y - 50, 'Piring dikosongkan', '#ffffff');
        return;
      }
      if (S.cook.carrying.length > 0) {
        S.cook.carrying.shift();
        DK.sfx.place();
        addPopup(c.x, c.y - 50, 'Dibuang', '#ffffff');
        return;
      }
      addPopup(c.x, c.y - 50, 'Tidak ada yang dibuang', '#ffd166');
      return;
    }
  }

  function collideCook() {
    var c = S.cook;
    var r = T.cookRadius;
    c.x = Math.max(24 + r, Math.min(DK.W - 24 - r, c.x));
    c.y = Math.max(258, Math.min(DK.H - 12 - r, c.y));
    var rects = stationRects();
    for (var i = 0; i < rects.length; i++) {
      var rc = rects[i].rect;
      var nx = Math.max(rc.x, Math.min(c.x, rc.x + rc.w));
      var ny = Math.max(rc.y, Math.min(c.y, rc.y + rc.h));
      var dx = c.x - nx;
      var dy = c.y - ny;
      var d2 = dx * dx + dy * dy;
      if (d2 < r * r) {
        if (d2 < 0.0001) {
          c.y = rc.y + rc.h + r;
        } else {
          var d = Math.sqrt(d2);
          c.x = nx + (dx / d) * r;
          c.y = ny + (dy / d) * r;
        }
      }
    }
  }

  function update(dt) {
    if (S.state !== 'playing') return;
    S.elapsed += dt;
    var c = S.cook;
    var mv = DK.input.moveVector();
    var speed = T.cookSpeed;
    var target = DK.input.getMoveTarget();
    if (mv.active) {
      DK.input.clearMoveTarget();
      c.x += mv.x * speed * dt;
      c.y += mv.y * speed * dt;
      if (mv.x !== 0) c.dir = mv.x > 0 ? 1 : -1;
      c.walkPhase += dt * 12;
    } else if (target) {
      var dx = target.x - c.x;
      var dy = target.y - c.y;
      var dist = Math.hypot(dx, dy);
      if (dist < 8) {
        DK.input.clearMoveTarget();
      } else {
        c.x += (dx / dist) * speed * dt;
        c.y += (dy / dist) * speed * dt;
        if (Math.abs(dx) > 4) c.dir = dx > 0 ? 1 : -1;
        c.walkPhase += dt * 12;
      }
    }
    collideCook();

    if (S.board.knifeT > 0) S.board.knifeT -= dt;
    if (S.flashServe > 0) S.flashServe -= dt;

    for (var b = 0; b < 2; b++) {
      var burner = S.burners[b];
      if (!burner.item) continue;
      var prev = burner.t;
      burner.t += dt;
      if (burner.item.state === 'raw' && prev < T.stoveCookSeconds && burner.t >= T.stoveCookSeconds) {
        burner.item.state = 'cooked';
        burner.cooked = true;
        DK.sfx.ding();
        addPopup(L.stove.burners[b].x, L.stove.burners[b].y - 40, 'Matang!', '#7ee787');
      }
      if (burner.item.state === 'cooked' && prev < T.stoveBurnSeconds && burner.t >= T.stoveBurnSeconds) {
        burner.item.state = 'burnt';
        burner.burnt = true;
        DK.sfx.fail();
        addPopup(L.stove.burners[b].x, L.stove.burners[b].y - 40, 'Gosong!', '#ff6b6b');
      }
    }

    S.spawnTimer -= dt;
    if (S.spawnTimer <= 0) {
      spawnOrder();
      var interval = Math.max(T.spawnIntervalMin, T.spawnIntervalStart - (S.level - 1));
      S.spawnTimer = interval;
    }

    for (var i = S.orders.length - 1; i >= 0; i--) {
      var o = S.orders[i];
      o.timeLeft -= dt;
      if (o.timeLeft <= 10.5 && o.timeLeft + dt > 10.5) DK.sfx.tick();
      if (o.timeLeft <= 0) {
        S.orders.splice(i, 1);
        S.missed++;
        S.hearts--;
        S.combo = 0;
        S.shake = 0.4;
        DK.sfx.fail();
        addPopup(640, 200, 'Pesanan ' + o.dish.name + ' hangus!', '#ff6b6b');
        if (S.hearts <= 0) {
          S.state = 'over';
        }
      }
    }

    for (var p = S.popups.length - 1; p >= 0; p--) {
      var pop = S.popups[p];
      pop.y -= 34 * dt;
      pop.life -= dt;
      if (pop.life <= 0) S.popups.splice(p, 1);
    }
    if (S.shake > 0) S.shake -= dt;
  }

  function startGame() {
    S = newWorld();
    S.state = 'playing';
  }

  function toTitle() {
    S = newWorld();
    S.state = 'title';
  }

  S = newWorld();

  DK.world = {
    get state() { return S; },
    newGame: startGame,
    toTitle: toTitle,
    update: update,
    interact: interact,
    spawnOrder: spawnOrder,
    addPopup: addPopup,
    plateMatches: plateMatches,
    matchingOrder: matchingOrder,
    nearestStation: nearestStation,
    plateItems: plateItems,
    dishById: dishById,
    carryingPlateIndex: carryingPlate,
    stationRects: stationRects,
    binRect: binRect,
  };
})();
