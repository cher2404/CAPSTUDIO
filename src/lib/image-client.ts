/** Browser-helpers: afmetingen lezen en een verkleinde JPEG-versie maken. */

export async function loadImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  return bitmap;
}

export async function resizeImage(file: File, maxEdge: number, quality = 0.82): Promise<{ blob: Blob; width: number; height: number; originalWidth: number; originalHeight: number }> {
  const bitmap = await loadImage(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Kon afbeelding niet verwerken"))), "image/jpeg", quality));
  const result = { blob, width, height, originalWidth: bitmap.width, originalHeight: bitmap.height };
  bitmap.close();
  return result;
}

export function safeName(name: string) {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "_");
}

/** Voert taken uit met een maximum aantal tegelijk. */
export async function pool<T>(items: T[], limit: number, fn: (item: T, i: number) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i]!, i);
      }
    }),
  );
}
