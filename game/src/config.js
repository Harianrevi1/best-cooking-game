// DAPUR KILAT — config: ingredients, dishes, stations, tuning.
// Written from the design spec; no starter code was read.
(function () {
  var DK = window.DK || (window.DK = {});

  DK.W = 1280;
  DK.H = 800;

  // An ingredient's prep: 'ready' (take and use), 'cook' (stove), 'chop' (board).
  DK.INGREDIENTS = {
    nasi:   { name: 'Nasi',   color: '#fff3d6', prep: 'ready', blurb: 'Siap saji' },
    mie:    { name: 'Mie',    color: '#f2c14e', prep: 'cook',  blurb: 'Masak di kompor' },
    ayam:   { name: 'Ayam',   color: '#e07840', prep: 'cook',  blurb: 'Masak di kompor' },
    telur:  { name: 'Telur',  color: '#ffe9a8', prep: 'cook',  blurb: 'Masak di kompor' },
    sayur:  { name: 'Sayur',  color: '#58b368', prep: 'chop',  blurb: 'Potong di talenan' },
    sambal: { name: 'Sambal', color: '#d92b2b', prep: 'ready', blurb: 'Siap saji' },
  };
  DK.INGREDIENT_ORDER = ['nasi', 'mie', 'ayam', 'telur', 'sayur', 'sambal'];

  // A dish is a set of (kind, finished state) items on the plate.
  DK.DISHES = [
    { id: 'nasgor', name: 'Nasi Goreng', price: 25, needs: [['nasi', 'ready'], ['telur', 'cooked'], ['sambal', 'ready']] },
    { id: 'geprek', name: 'Ayam Geprek', price: 20, needs: [['ayam', 'cooked'], ['sambal', 'ready']] },
    { id: 'miegor', name: 'Mie Goreng',  price: 30, needs: [['mie', 'cooked'], ['sayur', 'chopped'], ['telur', 'cooked']] },
    { id: 'soto',   name: 'Soto Ayam',   price: 30, needs: [['ayam', 'cooked'], ['nasi', 'ready'], ['sayur', 'chopped']] },
    { id: 'gado',   name: 'Gado-Gado',   price: 25, needs: [['sayur', 'chopped'], ['telur', 'cooked'], ['sambal', 'ready']] },
  ];

  DK.TUNING = {
    cookSpeed: 285,        // px per second
    cookRadius: 26,        // cook body radius
    interactRange: 95,     // px from a station's edge to use it
    handSlots: 2,          // items the cook can carry
    plateSlots: 4,         // items one plate holds
    stoveCookSeconds: 3,   // raw -> cooked
    stoveBurnSeconds: 6.5, // cooked -> burnt
    chopsNeeded: 3,        // chops to finish sayur
    maxOrders: 3,
    firstOrderAt: 2,       // seconds into a shift
    orderTimeStart: 50,    // seconds per order at level 1
    orderTimeMin: 32,
    spawnIntervalStart: 14,
    spawnIntervalMin: 8,
    servesPerLevel: 4,
    hearts: 3,
  };

  // Kitchen layout (canvas coordinates). Stations are obstacles the cook walks around.
  DK.LAYOUT = {
    hudH: 56,
    boardY: 64,
    boardH: 88,
    floorTop: 164,
    floorBottom: 788,
    bins: { x: 40, y: 178, w: 122, h: 66, gap: 12 },
    board: { x: 60, y: 340, w: 200, h: 120, label: 'TALENAN' },
    stove: { x: 340, y: 340, w: 300, h: 120, label: 'KOMPOR', burners: [{ x: 430, y: 400 }, { x: 550, y: 400 }] },
    plate: { x: 700, y: 340, w: 300, h: 120, label: 'MEJA RACIK' },
    serve: { x: 1060, y: 340, w: 180, h: 120, label: 'SERAHKAN' },
    trash: { x: 1120, y: 620, w: 110, h: 110, label: 'SAMPAH' },
  };

  DK.COLORS = {
    floorA: '#e8c890',
    floorB: '#dfc083',
    wall: '#b8452e',
    wallTrim: '#8f2f1d',
    wood: '#a06a35',
    woodDark: '#7d4f24',
    steel: '#c9ced6',
    steelDark: '#9aa1ad',
    ink: '#2b2118',
    cream: '#fff8e7',
    gold: '#ffb703',
    green: '#2f9e44',
    red: '#d92b2b',
  };
})();
