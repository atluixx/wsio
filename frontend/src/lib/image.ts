// Client-side avatar processing: take whatever the user drops/pastes/uploads,
// centre-crop it to a square, shrink it, and hand back a small data URI the
// profile can store inline. Keeps the app free of a blob store.

const MAX_DIM = 400;
const MAX_BYTES = 600_000; // data-URI length; backend caps at 700_000

async function loadImage(blob: Blob): Promise<HTMLImageElement | ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob);
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function fileToAvatarDataUrl(blob: Blob): Promise<string> {
  if (!blob.type || !blob.type.startsWith("image/")) {
    throw new Error("That doesn't look like an image.");
  }

  const source = await loadImage(blob);
  const w = "width" in source ? source.width : 0;
  const h = "height" in source ? source.height : 0;
  if (!w || !h) throw new Error("Couldn't read that image.");

  const side = Math.min(w, h);
  const out = Math.min(MAX_DIM, side);
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process that image.");
  ctx.drawImage(source, (w - side) / 2, (h - side) / 2, side, side, 0, 0, out, out);
  if ("close" in source) source.close();

  for (const quality of [0.85, 0.72, 0.6, 0.45]) {
    const webp = canvas.toDataURL("image/webp", quality);
    const data = webp.startsWith("data:image/webp")
      ? webp
      : canvas.toDataURL("image/jpeg", quality);
    if (data.length <= MAX_BYTES) return data;
  }
  throw new Error("That image is too detailed to shrink — try a smaller one.");
}
