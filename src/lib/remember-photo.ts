export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_PATH = /^pending\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function checkPhoto(type: string, bytes: number): string | null {
  if (!(PHOTO_TYPES as readonly string[]).includes(type)) return "Please pick a JPG, PNG or WebP photo.";
  if (bytes <= 0) return "This photo is empty.";
  if (bytes > PHOTO_MAX_BYTES) return "This photo is too big. Please pick one under 5 MB.";
  return null;
}

export const PHOTO_EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
