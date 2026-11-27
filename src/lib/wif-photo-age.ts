const DAY_MS = 86_400_000;
const MAX_AGE_DAYS = 3650;

export function computePhotoAgeDays(takenMs: number | null, nowMs = Date.now()): number | null {
  if (takenMs === null || !Number.isFinite(takenMs) || takenMs <= 0) return null;
  const days = Math.floor((nowMs - takenMs) / DAY_MS);
  if (days < 0) return 0;
  if (days > MAX_AGE_DAYS) return MAX_AGE_DAYS;
  return days;
}

/** Parses EXIF DateTimeOriginal (0x9003) or DateTime (0x0132) from a JPEG buffer. */
export function parseExifDate(buffer: ArrayBuffer): number | null {
  const view = new DataView(buffer);
  if (view.byteLength < 12 || view.getUint16(0, false) !== 0xffd8) return null;
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset, false);
    offset += 2;
    if (marker === 0xffe1) {
      const len = view.getUint16(offset, false);
      const start = offset + 2;
      if (start + 6 > view.byteLength) return null;
      // "Exif\0\0"
      if (view.getUint32(start, false) !== 0x45786966 || view.getUint16(start + 4, false) !== 0x0000) {
        offset += len;
        continue;
      }
      const tiff = start + 6;
      if (tiff + 8 > view.byteLength) return null;
      const little = view.getUint16(tiff, false) === 0x4949;
      const ifd0 = tiff + view.getUint32(tiff + 4, little);
      const readStr = (pos: number, count: number) => {
        if (pos < 0 || pos + count > view.byteLength) return null;
        let s = "";
        for (let i = 0; i < count - 1; i++) s += String.fromCharCode(view.getUint8(pos + i));
        return s;
      };
      const scanIfd = (dirOffset: number): { original: string | null; fallback: string | null; exifPtr: number | null } => {
        if (dirOffset + 2 > view.byteLength) return { original: null, fallback: null, exifPtr: null };
        const entries = view.getUint16(dirOffset, little);
        let original: string | null = null;
        let fallback: string | null = null;
        let exifPtr: number | null = null;
        for (let i = 0; i < entries; i++) {
          const e = dirOffset + 2 + i * 12;
          if (e + 12 > view.byteLength) break;
          const tag = view.getUint16(e, little);
          const count = view.getUint32(e + 4, little);
          const valOffset = tiff + view.getUint32(e + 8, little);
          if (tag === 0x8769) exifPtr = valOffset;
          else if (tag === 0x9003 && count >= 19) original = readStr(valOffset, 20);
          else if (tag === 0x0132 && count >= 19) fallback = readStr(valOffset, 20);
        }
        return { original, fallback, exifPtr };
      };
      const root = scanIfd(ifd0);
      const sub = root.exifPtr ? scanIfd(root.exifPtr) : null;
      const raw = sub?.original ?? root.original ?? root.fallback;
      if (!raw) return null;
      const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(raw);
      if (!m) return null;
      const ms = Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, +m[4]!, +m[5]!, +m[6]!);
      return Number.isFinite(ms) ? ms : null;
    }
    if ((marker & 0xff00) !== 0xff00) break;
    const size = view.getUint16(offset, false);
    if (size < 2) break;
    offset += size;
  }
  return null;
}

export async function photoAgeDays(file: File, nowMs = Date.now()): Promise<number | null> {
  try {
    const slice = await file.slice(0, 131_072).arrayBuffer();
    const exifMs = parseExifDate(slice);
    if (exifMs !== null) return computePhotoAgeDays(exifMs, nowMs);
  } catch {
    // Fall through to file.lastModified
  }
  return computePhotoAgeDays(file.lastModified > 0 ? file.lastModified : null, nowMs);
}