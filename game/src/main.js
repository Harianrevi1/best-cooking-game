// DAPUR KILAT — main: boot, game loop, and wiring between input and world.
(function () {
  var DK = window.DK || (window.DK = {});
  window.__DK = DK;

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');

  var params = new URLSearchParams(window.location.search);
  var demoName = params.get('demo');

  if (demoName && DK.demoScenes[demoName]) {
    DK.demoScenes[demoName]();
  }

  function stationAt(p) {
    var rects = DK.world.stationRects();
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i].rect;
      if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return rects[i];
    }
    return null;
  }

  function onClick(p) {
    var S = DK.world.state;
    if (S.state === 'title') {
      DK.world.newGame();
      return;
    }
    if (S.state === 'over') return;
    if (S.state !== 'playing') return;
    var st = stationAt(p);
    var near = DK.world.nearestStation();
    if (st && near && st.type === near.type) {
      DK.world.interact();
      return;
    }
    DK.input.setMoveTarget(p);
  }

  DK.input.attach(canvas, {
    onKey: function () { DK.sfx.unlock(); },
    onUnlockAudio: function () { DK.sfx.unlock(); },
    onClick: onClick,
  });

  var last = performance.now();

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var S = DK.world.state;

    if (DK.input.consume('start') && S.state === 'title') DK.world.newGame();
    if (DK.input.consume('restart') && (S.state === 'over' || S.state === 'playing')) DK.world.newGame();
    if (DK.input.consume('pause') && (S.state === 'playing' || S.state === 'paused')) {
      S.state = S.state === 'playing' ? 'paused' : 'playing';
    }
    if (DK.input.consume('mute')) {
      var muted = DK.sfx.toggleMute();
      DK.world.addPopup(S.cook.x, S.cook.y - 50, muted ? 'Suara mati' : 'Suara hidup', '#ffffff');
    }
    if (DK.input.consume('help')) S.showHelp = !S.showHelp;
    if (DK.input.consume('interact') && S.state === 'playing') DK.world.interact();

    DK.world.update(dt);
    DK.render.drawGame(ctx, DK.world.state);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
