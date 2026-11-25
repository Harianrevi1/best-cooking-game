// DAPUR KILAT — shots: staged mid-game scenes for the screenshots.
// Each scene starts a fresh game and places orders, food and the cook so a
// screenshot shows a real, playable moment (kitchen, order board, assembly,
// timer, plate ready to serve). The game stays fully playable afterwards.
(function () {
  var DK = window.DK || (window.DK = {});

  function base(score, combo, level, serves, elapsed) {
    DK.world.newGame();
    var S = DK.world.state;
    S.score = score;
    S.combo = combo;
    S.bestCombo = combo;
    S.level = level;
    S.serves = serves;
    S.elapsed = elapsed;
    S.spawnTimer = 9;
    return S;
  }

  function order(id, timeLeft, total) {
    return { dish: DK.world.dishById(id), timeLeft: timeLeft, total: total };
  }

  function item(kind, state) {
    return { kind: kind, state: state };
  }

  // Full kitchen: three orders, a burner going, chopping half done, a plate
  // mid-assembly and the cook carrying ingredients.
  function busy() {
    var S = base(340, 3, 2, 7, 47);
    S.orders = [order('nasgor', 32, 50), order('miegor', 24, 50), order('soto', 41, 50)];
    S.cook.x = 640;
    S.cook.y = 600;
    S.cook.carrying = [item('nasi', 'ready'), item('telur', 'cooked')];
    S.burners[0].item = item('ayam', 'raw');
    S.burners[0].t = 1.8;
    S.board.item = item('sayur', 'raw');
    S.board.chops = 2;
    S.plate.items = [item('nasi', 'ready'), item('sambal', 'ready')];
  }

  // A dish mid-assembly: the plate holds two of three Nasi Goreng parts and
  // the cook carries the last one (Sambal) at the plating counter.
  function assembly() {
    var S = base(180, 1, 1, 3, 26);
    S.orders = [order('nasgor', 28, 50), order('geprek', 35, 50)];
    S.cook.x = 850;
    S.cook.y = 500;
    S.cook.carrying = [item('sambal', 'ready')];
    S.plate.items = [item('nasi', 'ready'), item('telur', 'cooked')];
    S.burners[1].item = item('mie', 'raw');
    S.burners[1].t = 1.1;
  }

  // A plate ready to serve: complete Ayam Geprek in the cook's hands, glowing,
  // at the serving window with its order timer still running.
  function serve() {
    var S = base(260, 2, 1, 5, 58);
    S.orders = [order('geprek', 18, 50), order('gado', 30, 50)];
    S.cook.x = 1120;
    S.cook.y = 500;
    S.cook.carrying = [{ kind: 'plate', items: [item('ayam', 'cooked'), item('sambal', 'ready')] }];
    S.flashServe = 10;
    S.burners[0].item = item('telur', 'cooked');
  }

  // The cooking rush: both burners going, chopping started, two orders ticking.
  function cook() {
    var S = base(120, 1, 1, 2, 33);
    S.orders = [order('miegor', 38, 50), order('soto', 22, 50)];
    S.cook.x = 170;
    S.cook.y = 500;
    S.cook.carrying = [item('sayur', 'raw')];
    S.burners[0].item = item('ayam', 'raw');
    S.burners[0].t = 2.6;
    S.burners[1].item = item('mie', 'raw');
    S.burners[1].t = 1.2;
    S.board.item = item('sayur', 'raw');
    S.board.chops = 1;
  }

  DK.demoScenes = {
    busy: busy,
    assembly: assembly,
    serve: serve,
    cook: cook,
  };
})();
