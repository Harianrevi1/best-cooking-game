// DAPUR KILAT — audio: tiny WebAudio beeps and sizzles, no files.
(function () {
  var DK = window.DK || (window.DK = {});

  var ctx = null;
  var muted = false;

  function ensureCtx() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, dur, type, vol, when) {
    if (muted) return;
    var ac = ensureCtx();
    if (!ac) return;
    var t0 = ac.currentTime + (when || 0);
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noiseBurst(dur, vol) {
    if (muted) return;
    var ac = ensureCtx();
    if (!ac) return;
    var len = Math.floor(ac.sampleRate * dur);
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ac.createBufferSource();
    src.buffer = buf;
    var gain = ac.createGain();
    gain.gain.value = vol || 0.15;
    var filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    src.start();
  }

  DK.sfx = {
    unlock: function () { ensureCtx(); },
    toggleMute: function () {
      muted = !muted;
      return muted;
    },
    isMuted: function () { return muted; },
    pickup: function () { tone(620, 0.08, 'triangle', 0.12); },
    place: function () { tone(300, 0.07, 'square', 0.07); },
    chop: function () { noiseBurst(0.09, 0.22); tone(180, 0.06, 'square', 0.08); },
    ding: function () { tone(880, 0.18, 'sine', 0.14); tone(1320, 0.22, 'sine', 0.1, 0.09); },
    serve: function () {
      tone(523, 0.12, 'triangle', 0.14);
      tone(659, 0.12, 'triangle', 0.14, 0.1);
      tone(784, 0.2, 'triangle', 0.14, 0.2);
    },
    fail: function () { tone(160, 0.35, 'sawtooth', 0.1); tone(110, 0.4, 'sawtooth', 0.08, 0.08); },
    tick: function () { tone(980, 0.05, 'square', 0.05); },
    levelUp: function () {
      tone(392, 0.1, 'triangle', 0.12);
      tone(523, 0.1, 'triangle', 0.12, 0.09);
      tone(659, 0.16, 'triangle', 0.12, 0.18);
    },
  };
})();
