import { ImageResponse } from "next/og";

export const alt = "wsio — one link, everything behind it";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:woff2?|truetype|opentype)'\)/)?.[1];
    if (!src) return null;
    return await (await fetch(src)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const glyphs =
    "One link, and everything behind it. A link in bio, made with some care. wsio.lol/yourname abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,—";
  const serif = await loadFont("Newsreader", 500, glyphs);
  const fonts: { name: string; data: ArrayBuffer; weight: 500; style: "normal" }[] = [];
  if (serif) fonts.push({ name: "Newsreader", data: serif, weight: 500, style: "normal" });
  const display = serif ? "Newsreader" : "serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#faf9f5",
          color: "#1c1913",
          fontFamily: display,
        }}
      >
        <div style={{ display: "flex", fontSize: 27, color: "#a13a1e" }}>
          A link in bio, made with some care.
        </div>
        <div style={{ display: "flex", fontSize: 92, lineHeight: 1.08, maxWidth: 1000, letterSpacing: "-0.02em" }}>
          One link, and everything behind it.
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", fontSize: 34 }}>
          <span style={{ display: "flex", color: "#57524a" }}>wsio.lol/yourname</span>
          <span style={{ display: "flex", alignItems: "baseline" }}>
            wsio<span style={{ color: "#a13a1e" }}>.</span>
          </span>
        </div>
      </div>
    ),
    fonts.length ? { ...size, fonts } : { ...size }
  );
}
