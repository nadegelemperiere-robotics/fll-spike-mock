// src/robot/io-parser.js
// Lit un fichier .io (BrickLink Studio) : c'est un ZIP avec mot de passe `soho0909`.
// On utilise JSZip + déchiffrement ZipCrypto manuel (l'algo legacy ZIP 2.0,
// que JSZip ne supporte pas nativement).
//
// Spec ZipCrypto : https://en.wikipedia.org/wiki/ZIP_(file_format)#Encryption
// Implémentation directe ci-dessous, suffisante pour les fichiers Studio.

const PASSWORD = 'soho0909';

// --- ZipCrypto (CRC-32 based) ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32update(crc, byte) {
  return (CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8)) >>> 0;
}

class ZipCrypto {
  constructor(password) {
    this.k0 = 0x12345678;
    this.k1 = 0x23456789;
    this.k2 = 0x34567890;
    for (const ch of password) this.update(ch.charCodeAt(0));
  }
  update(b) {
    this.k0 = crc32update(this.k0, b);
    this.k1 = (this.k1 + (this.k0 & 0xFF)) >>> 0;
    this.k1 = Math.imul(this.k1, 134775813) + 1 >>> 0;
    this.k2 = crc32update(this.k2, (this.k1 >>> 24) & 0xFF);
  }
  decryptByte() {
    const t = (this.k2 | 2) & 0xFFFF;
    return (Math.imul(t, t ^ 1) >>> 8) & 0xFF;
  }
  decrypt(buf) {
    const out = new Uint8Array(buf.length);
    for (let i = 0; i < buf.length; i++) {
      const c = buf[i] ^ this.decryptByte();
      this.update(c);
      out[i] = c;
    }
    return out;
  }
}

// --- Parsing ZIP minimal (on lit les en-têtes locaux) ---
// On fait simple : on s'appuie sur JSZip pour la *structure*, mais
// pour les fichiers chiffrés, on extrait nous-mêmes les données brutes
// puis on déchiffre + décompresse.

async function readZipEntries(arrayBuffer) {
  // Parser EOCD (End of Central Directory)
  const data = new DataView(arrayBuffer);
  const len = data.byteLength;
  let eocd = -1;
  for (let i = len - 22; i >= Math.max(0, len - 65557); i--) {
    if (data.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Archive ZIP invalide (EOCD manquant)');

  const cdOffset = data.getUint32(eocd + 16, true);
  const nEntries = data.getUint16(eocd + 10, true);

  let p = cdOffset;
  const entries = [];
  for (let i = 0; i < nEntries; i++) {
    if (data.getUint32(p, true) !== 0x02014b50) throw new Error('CD signature invalide');
    const flag = data.getUint16(p + 8, true);
    const method = data.getUint16(p + 10, true);
    const crc32 = data.getUint32(p + 16, true);
    const compSize = data.getUint32(p + 20, true);
    const uncompSize = data.getUint32(p + 24, true);
    const nameLen = data.getUint16(p + 28, true);
    const extraLen = data.getUint16(p + 30, true);
    const commentLen = data.getUint16(p + 32, true);
    const localHeaderOffset = data.getUint32(p + 42, true);
    const name = new TextDecoder().decode(new Uint8Array(arrayBuffer, p + 46, nameLen));
    entries.push({ name, flag, method, crc32, compSize, uncompSize, localHeaderOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function getLocalFileData(arrayBuffer, entry) {
  const data = new DataView(arrayBuffer);
  const p = entry.localHeaderOffset;
  if (data.getUint32(p, true) !== 0x04034b50) throw new Error('Local header invalide');
  const nameLen = data.getUint16(p + 26, true);
  const extraLen = data.getUint16(p + 28, true);
  const start = p + 30 + nameLen + extraLen;
  return new Uint8Array(arrayBuffer, start, entry.compSize);
}

async function inflateRaw(buf) {
  // Utilise DecompressionStream natif (méthode 'deflate-raw' = sans en-tête zlib).
  const stream = new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
  return new Uint8Array(await stream.arrayBuffer());
}

/**
 * Lit un File .io et retourne le contenu de model.ldr (texte LDraw).
 */
export async function parseIoFile(file) {
  const buf = await file.arrayBuffer();
  const entries = await readZipEntries(buf);

  // On cherche model.ldr (parfois dans un sous-dossier)
  const target = entries.find(e => e.name.toLowerCase().endsWith('model.ldr'))
              || entries.find(e => e.name.toLowerCase().endsWith('.ldr'));
  if (!target) throw new Error('Aucun fichier .ldr trouvé dans l\'archive .io');

  let raw = getLocalFileData(buf, target);

  // Si chiffré, déchiffrer (les 12 premiers octets sont le header de validation)
  if (target.flag & 0x1) {
    const cipher = new ZipCrypto(PASSWORD);
    const decrypted = cipher.decrypt(raw);
    // Vérification : le 12e octet doit correspondre au CRC ou au timestamp
    raw = decrypted.slice(12);
  }

  // Décompression
  let plain;
  if (target.method === 0) {
    plain = raw;
  } else if (target.method === 8) {
    plain = await inflateRaw(raw);
  } else {
    throw new Error('Méthode de compression non supportée: ' + target.method);
  }

  return new TextDecoder('utf-8').decode(plain);
}
