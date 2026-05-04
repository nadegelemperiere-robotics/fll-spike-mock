// src/simulator/hub-display.js
// Affichage du hub SPIKE (matrice 5x5 + LED du bouton power) au-dessus du mat.
// Pilote les éléments DOM en réponse aux appels du bridge `_sim_bridge`.

// Clés = valeur entière de la constante light_matrix.IMAGE_* (1..67)
const IMAGES = {
  1:  '01010 11111 11111 01110 00100', // HEART
  2:  '00000 01010 01110 00100 00000', // HEART_SMALL
  3:  '01010 01010 00000 10001 01110', // HAPPY
  4:  '00000 00000 00000 10001 01110', // SMILE
  5:  '01010 01010 00000 01110 10001', // SAD
  6:  '00000 01010 00000 01010 10101', // CONFUSED
  7:  '10001 01010 00000 11111 10101', // ANGRY
  8:  '00000 11011 00000 01110 00000', // ASLEEP
  9:  '01010 00000 00100 01010 00100', // SURPRISED
  10: '10001 00000 11111 10101 11011', // SILLY
  11: '11111 11011 00000 01010 00100', // FABULOUS
  12: '01010 00000 00111 00100 00111', // MEH
  13: '00000 00001 00010 10100 01000', // YES
  14: '10001 01010 00100 01010 10001', // NO
  15: '00100 00100 00100 00000 00000', // CLOCK12
  16: '00010 00010 00100 00000 00000', // CLOCK1
  17: '00000 00011 00100 00000 00000', // CLOCK2
  18: '00000 00000 00111 00000 00000', // CLOCK3
  19: '00000 00000 00100 00011 00000', // CLOCK4
  20: '00000 00000 00100 00010 00010', // CLOCK5
  21: '00000 00000 00100 00100 00100', // CLOCK6
  22: '00000 00000 00100 01000 01000', // CLOCK7
  23: '00000 00000 00100 11000 00000', // CLOCK8
  24: '00000 00000 11100 00000 00000', // CLOCK9
  25: '00000 11000 00100 00000 00000', // CLOCK10
  26: '01000 01000 00100 00000 00000', // CLOCK11
  27: '00100 01110 10101 00100 00100', // ARROW_N
  28: '00111 00011 00101 01000 10000', // ARROW_NE
  29: '00100 00010 11111 00010 00100', // ARROW_E
  30: '10000 01000 00101 00011 00111', // ARROW_SE
  31: '00100 00100 10101 01110 00100', // ARROW_S
  32: '00001 00010 10100 11000 11100', // ARROW_SW
  33: '00100 01000 11111 01000 00100', // ARROW_W
  34: '11100 11000 10100 00010 00001', // ARROW_NW
  35: '00000 00100 00010 11111 00010 00100', // GO_RIGHT (5 lignes)
  36: '00000 00100 01000 11111 01000 00100', // GO_LEFT
  37: '00100 01110 10101 00100 00000', // GO_UP
  38: '00000 00100 10101 01110 00100', // GO_DOWN
  39: '00000 00100 01010 11111 00000', // TRIANGLE
  40: '10000 11000 10100 11000 10000', // TRIANGLE_LEFT
  41: '01010 10101 01010 10101 01010', // CHESSBOARD
  42: '00100 01010 10001 01010 00100', // DIAMOND
  43: '00000 00100 01010 00100 00000', // DIAMOND_SMALL
  44: '11111 10001 10001 10001 11111', // SQUARE
  45: '00000 01110 01010 01110 00000', // SQUARE_SMALL
  46: '10100 10100 11111 11011 11011', // RABBIT
  47: '10001 10001 11111 01110 00100', // COW
  48: '00100 00100 00100 11100 11100', // MUSIC_CROTCHET
  49: '00111 00101 00100 11100 11100', // MUSIC_QUAVER
  50: '11111 10101 10001 11011 11011', // MUSIC_QUAVERS
  51: '10101 10101 11111 00100 00100', // PITCHFORK
  52: '00100 00100 01110 11111 00100', // XMAS
  53: '01110 11010 11100 11110 01110', // PACMAN
  54: '00100 01110 11011 01110 00100', // TARGET
  55: '11011 11111 01110 01110 01110', // TSHIRT
  56: '00111 00111 11111 11111 01010', // ROLLERSKATE
  57: '01100 11100 01111 01110 00000', // DUCK
  58: '00100 01110 11111 01110 01010', // HOUSE
  59: '00000 01110 11111 01010 00000', // TORTOISE
  60: '10001 11111 01110 11111 10001', // BUTTERFLY
  61: '00100 11111 00100 01010 10001', // STICKFIGURE
  62: '01110 10101 11111 10101 10101', // GHOST
  63: '00100 00100 00100 01110 00100', // SWORD
  64: '11000 01000 01111 01001 01001', // GIRAFFE
  65: '01110 10101 11111 01110 01010', // SKULL
  66: '01110 11111 00100 00100 01100', // UMBRELLA
  67: '11000 11011 00111 00010 00000', // SNAKE
};

function parseImage(str) {
  // 5 lignes séparées par espaces, '0'/'1' par cellule.
  const out = new Array(25).fill(0);
  const rows = str.split(/\s+/).filter(Boolean);
  for (let y = 0; y < Math.min(5, rows.length); y++) {
    for (let x = 0; x < Math.min(5, rows[y].length); x++) {
      out[y * 5 + x] = rows[y][x] === '1' ? 100 : 0;
    }
  }
  return out;
}

// Couleur enum SPIKE → RGB
const COLOR_ID_TO_RGB = {
  '-1': [0, 0, 0],
  '0':  [0, 0, 0],         // BLACK
  '1':  [255, 0, 200],     // MAGENTA
  '2':  [160, 0, 220],     // PURPLE
  '3':  [0, 50, 220],      // BLUE
  '4':  [0, 200, 255],     // AZURE
  '5':  [0, 220, 200],     // TURQUOISE
  '6':  [0, 200, 50],      // GREEN
  '7':  [255, 240, 0],     // YELLOW
  '8':  [255, 140, 0],     // ORANGE
  '9':  [255, 0, 0],       // RED
  '10': [255, 255, 255],   // WHITE
};

export class HubDisplay {
  constructor() {
    this.matrix = new Array(25).fill(0);
    this.brightness = 100;
    this.matrixEl = document.getElementById('hub-matrix');
    this.buttonEl = document.getElementById('hub-power-btn');
    this.bluetoothEl = document.getElementById('hub-bluetooth-btn');
    this.writeEl = document.getElementById('hub-write-text');
    this.pixelEls = [];
    this._build();
    this._scrollTimer = null;
  }

  _build() {
    if (!this.matrixEl) return;
    this.matrixEl.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const px = document.createElement('div');
      px.className = 'pixel';
      this.matrixEl.appendChild(px);
      this.pixelEls.push(px);
    }
    this._renderAll();
  }

  _renderAll() {
    for (let i = 0; i < 25; i++) this._renderPixel(i);
  }

  _renderPixel(i) {
    if (!this.pixelEls[i]) return;
    const intensity = (this.matrix[i] || 0) * (this.brightness / 100);
    const a = Math.max(0, Math.min(1, intensity / 100));
    this.pixelEls[i].style.background = a > 0
      ? `rgba(255, 165, 60, ${0.15 + a * 0.85})`
      : '#20262e';
  }

  _stopScroll() {
    if (this._scrollTimer) {
      clearInterval(this._scrollTimer);
      this._scrollTimer = null;
    }
  }

  setPixel(x, y, intensity) {
    this._stopScroll();
    if (x < 0 || x >= 5 || y < 0 || y >= 5) return;
    const idx = y * 5 + x;
    this.matrix[idx] = Math.max(0, Math.min(100, intensity));
    this._renderPixel(idx);
  }

  clear() {
    this._stopScroll();
    this.matrix.fill(0);
    this._renderAll();
    if (this.writeEl) this.writeEl.textContent = '';
  }

  showImage(imageId) {
    this._stopScroll();
    const pat = IMAGES[imageId];
    if (!pat) return this.clear();
    this.matrix = parseImage(pat);
    this._renderAll();
    if (this.writeEl) this.writeEl.textContent = '';
  }

  setBrightness(pct) {
    this.brightness = Math.max(0, Math.min(100, pct));
    this._renderAll();
  }

  write(text) {
    // Pas de font 5x5 : on affiche le texte à droite de la matrice et on
    // anime un défilement de la matrice (chenillard simple) pendant la durée.
    this._stopScroll();
    if (this.writeEl) this.writeEl.textContent = `« ${text} »`;
    let i = 0;
    this._scrollTimer = setInterval(() => {
      this.matrix.fill(0);
      const col = i % 6;
      if (col < 5) {
        for (let y = 0; y < 5; y++) this.matrix[y * 5 + col] = 100;
      }
      this._renderAll();
      i++;
      if (i > Math.max(20, text.length * 4)) {
        this._stopScroll();
        this.matrix.fill(0);
        this._renderAll();
      }
    }, 80);
  }

  setOrientation(orientation) {
    // 0=UP 1=RIGHT 2=DOWN 3=LEFT — pivote la matrice visuellement.
    if (!this.matrixEl) return;
    const deg = (Number(orientation) || 0) * 90;
    this.matrixEl.style.transform = `rotate(${deg}deg)`;
  }

  rotate(direction) {
    // Pivote la matrice de 90° dans la direction donnée (+1 = horaire).
    const next = new Array(25).fill(0);
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const src = this.matrix[y * 5 + x];
        if (direction >= 0) next[x * 5 + (4 - y)] = src; // CW
        else next[(4 - x) * 5 + y] = src;                 // CCW
      }
    }
    this.matrix = next;
    this._renderAll();
  }

  _setLed(el, r, g, b) {
    if (!el) return;
    const off = (r === 0 && g === 0 && b === 0);
    el.style.background = off ? '#20262e' : `rgb(${r}, ${g}, ${b})`;
    el.style.boxShadow = off
      ? 'inset 0 0 3px rgba(0,0,0,0.4)'
      : `0 0 10px rgba(${r}, ${g}, ${b}, 0.7), inset 0 0 3px rgba(0,0,0,0.3)`;
  }

  setButtonColor(r, g, b) {
    this._setLed(this.buttonEl, r, g, b);
  }

  /** light.color(light_id, color_id) — light_id : 0=POWER, 1=CONNECT */
  setLightColor(lightId, colorId) {
    const rgb = COLOR_ID_TO_RGB[String(colorId)] || [0, 0, 0];
    if (lightId === 0) this._setLed(this.buttonEl, ...rgb);
    else if (lightId === 1) this._setLed(this.bluetoothEl, ...rgb);
  }

  reset() {
    this._stopScroll();
    this.matrix.fill(0);
    this.brightness = 100;
    this._renderAll();
    if (this.writeEl) this.writeEl.textContent = '';
    this._setLed(this.buttonEl, 0, 0, 0);
    this._setLed(this.bluetoothEl, 0, 0, 0);
    this.setOrientation(0);
  }
}
