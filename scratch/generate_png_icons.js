import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, bgColor = [15, 17, 21], text = 'PL') {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: 2 (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with scanline filters (0 = none)
  const rowSize = width * 3 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter byte

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;

      // Draw rounded card / Poland red accent emblem
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      const radius = width * 0.42;

      if (dist < radius) {
        if (y < cy) {
          // Top half: White/Silver
          rawData[pixelOffset] = 240;
          rawData[pixelOffset + 1] = 240;
          rawData[pixelOffset + 2] = 245;
        } else {
          // Bottom half: Polish Crimson
          rawData[pixelOffset] = 220;
          rawData[pixelOffset + 1] = 38;
          rawData[pixelOffset + 2] = 38;
        }
      } else {
        // Dark background
        rawData[pixelOffset] = bgColor[0];
        rawData[pixelOffset + 1] = bgColor[1];
        rawData[pixelOffset + 2] = bgColor[2];
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(length + 12);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, length + 8));
  chunk.writeInt32BE(crc, length + 8);
  return chunk;
}

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

const icon192 = createPNG(192, 192);
const icon512 = createPNG(512, 512);

fs.writeFileSync('public/icon-192.png', icon192);
fs.writeFileSync('public/icon-512.png', icon512);
console.log('Created public/icon-192.png (' + icon192.length + ' bytes) and public/icon-512.png (' + icon512.length + ' bytes)');
