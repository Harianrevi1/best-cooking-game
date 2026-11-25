// DAPUR KILAT — input: keyboard (WASD/arrows + E/Space) and mouse (click to walk / use).
(function () {
  var DK = window.DK || (window.DK = {});

  var keys = {};
  var moveTarget = null; // {x, y} in canvas coordinates, or null
  var pressed = {}; // edge-triggered keys, consumed once per frame

  var KEYMAP = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
  };

  function canvasPoint(canvas, clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (clientX - r.left) * (canvas.width / r.width),
      y: (clientY - r.top) * (canvas.height / r.height),
    };
  }

  DK.input = {
    attach: function (canvas, handlers) {
      window.addEventListener('keydown', function (ev) {
        var action = KEYMAP[ev.code];
        if (action) {
          keys[action] = true;
          ev.preventDefault();
        }
        if (ev.code === 'KeyE' || ev.code === 'Space') {
          pressed.interact = true;
          ev.preventDefault();
        }
        if (ev.code === 'Enter') pressed.start = true;
        if (ev.code === 'KeyR') pressed.restart = true;
        if (ev.code === 'KeyP') pressed.pause = true;
        if (ev.code === 'KeyM') pressed.mute = true;
        if (ev.code === 'KeyH') pressed.help = true;
        if (handlers && handlers.onKey) handlers.onKey(ev.code);
      });
      window.addEventListener('keyup', function (ev) {
        var action = KEYMAP[ev.code];
        if (action) keys[action] = false;
      });
      canvas.addEventListener('pointerdown', function (ev) {
        var p = canvasPoint(canvas, ev.clientX, ev.clientY);
        if (handlers && handlers.onUnlockAudio) handlers.onUnlockAudio();
        if (handlers && handlers.onClick) handlers.onClick(p);
      });
      window.addEventListener('blur', function () {
        keys = {};
        moveTarget = null;
      });
    },

    // Held movement direction from keys, normalized.
    moveVector: function () {
      var x = 0;
      var y = 0;
      if (keys.left) x -= 1;
      if (keys.right) x += 1;
      if (keys.up) y -= 1;
      if (keys.down) y += 1;
      if (x !== 0 && y !== 0) {
        var inv = 1 / Math.sqrt(2);
        x *= inv;
        y *= inv;
      }
      return { x: x, y: y, active: x !== 0 || y !== 0 };
    },

    setMoveTarget: function (p) { moveTarget = p; },
    getMoveTarget: function () { return moveTarget; },
    clearMoveTarget: function () { moveTarget = null; },

    // True once after the key went down; call once per frame.
    consume: function (name) {
      if (pressed[name]) {
        pressed[name] = false;
        return true;
      }
      return false;
    },
    clearPressed: function () { pressed = {}; },
  };
})();
