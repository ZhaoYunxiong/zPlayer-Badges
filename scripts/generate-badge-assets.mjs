import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const groups = {
  resolution: {
    primarySize: 52,
    items: {
      "r-1440p": ["1440p", "QHD"],
      "r-2k": ["2K", "DCI"],
      "r-576p": ["576p", "SD"],
      "r-360p": ["360p", "SD"],
    },
  },
  source: {
    primarySize: 52,
    items: {
      "s-tvrip": ["TVRip", "TV RECORDING"],
      "s-uhdtv": ["UHDTV", "ULTRA HD"],
    },
  },
  container: {
    primarySize: 50,
    items: {
      "ct-avi": ["AVI", "AUDIO VIDEO INTERLEAVE"],
      "ct-mov": ["MOV", "QUICKTIME"],
      "ct-wmv": ["WMV", "WINDOWS MEDIA VIDEO"],
      "ct-flv": ["FLV", "FLASH VIDEO"],
      "ct-ts": ["TS", "TRANSPORT STREAM"],
      "ct-m2ts": ["M2TS", "MPEG-2 TRANSPORT"],
      "ct-webm": ["WEBM", "WEB MEDIA"],
      "ct-rmvb": ["RMVB", "REALMEDIA VBR"],
      "ct-mpg": ["MPEG", "PROGRAM STREAM"],
      "ct-vob": ["VOB", "DVD VIDEO OBJECT"],
      "ct-m4v": ["M4V", "MPEG-4 VIDEO"],
    },
  },
  "video-codec": {
    primarySize: 52,
    subtitleColor: "#C9A7FF",
    items: {
      "vc-vp9": ["VP9", "GOOGLE VIDEO"],
      "vc-mpeg2": ["MPEG-2", "VIDEO CODING"],
      "vc-vc1": ["VC-1", "SMPTE 421M"],
      "vc-xvid": ["XviD", "MPEG-4 ASP"],
      "vc-divx": ["DivX", "DIGITAL VIDEO"],
    },
  },
  "audio-codec": {
    primarySize: 50,
    items: {
      "ac-alac": ["ALAC", "APPLE LOSSLESS"],
      "ac-opus": ["Opus", "LOW LATENCY"],
      "ac-mp3": ["MP3", "MPEG LAYER III"],
      "ac-vorbis": ["Vorbis", "OGG AUDIO"],
      "ac-wma": ["WMA", "WINDOWS MEDIA AUDIO"],
      "ac-ape": ["APE", "MONKEY'S AUDIO"],
      "ac-wav": ["WAV", "WAVE AUDIO"],
      "ac-mp2": ["MP2", "MPEG LAYER II"],
    },
  },
  "audio-channels": {
    primarySize: 52,
    items: {
      "ch-916": ["9.1.6", "SURROUND"],
      "ch-20": ["2.0", "STEREO"],
      "ch-10": ["1.0", "MONO"],
    },
  },
  "audio-bit-depth": {
    primarySize: 50,
    items: {
      "abd-32f": ["32BIT", "FLOAT AUDIO DEPTH"],
      "abd-32": ["32BIT", "AUDIO DEPTH"],
      "abd-24": ["24BIT", "AUDIO DEPTH"],
      "abd-16": ["16BIT", "AUDIO DEPTH"],
    },
  },
  "sample-rate": {
    primarySize: 52,
    items: {
      "sr-192": ["192", "kHz"],
      "sr-1764": ["176.4", "kHz"],
      "sr-96": ["96", "kHz"],
      "sr-882": ["88.2", "kHz"],
      "sr-48": ["48", "kHz"],
      "sr-441": ["44.1", "kHz"],
    },
  },
  "frame-rate": {
    primarySize: 52,
    items: {
      "fr-120": ["120", "FPS"],
      "fr-60": ["60", "FPS"],
      "fr-50": ["50", "FPS"],
      "fr-30": ["30", "FPS"],
      "fr-25": ["25", "FPS"],
      "fr-24": ["24", "FPS"],
    },
  },
  "subtitle-format": {
    primarySize: 52,
    subtitleColor: "#73D79B",
    items: {
      "sf-ass": ["ASS", "ADVANCED SUBSTATION"],
      "sf-ssa": ["SSA", "SUBSTATION ALPHA"],
      "sf-srt": ["SRT", "SUBRIP TEXT"],
      "sf-pgs": ["PGS", "BLU-RAY SUP"],
      "sf-vtt": ["VTT", "WEBVTT"],
      "sf-sub": ["SUB", "MICRODVD"],
      "sf-idx": ["IDX", "VOBSUB INDEX"],
      "sf-cc": ["CC", "CLOSED CAPTIONS"],
      "sf-sdh": ["SDH", "HEARING IMPAIRED"],
      "sf-forced": ["FORCED", "FORCED SUBTITLES"],
    },
  },
};

function textWidth(text, size, spacing) {
  let width = 0;
  for (const char of text) {
    if (char === " ") width += size * 0.3;
    else if (char === ".") width += size * 0.28;
    else if ("-/".includes(char)) width += size * 0.4;
    else if (/[A-Z]/.test(char)) width += size * 0.67;
    else if (/\d/.test(char)) width += size * 0.58;
    else width += size * 0.53;
    width += spacing;
  }
  return width;
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wordmark(primary, subtitle, options) {
  const primarySize = options.primarySize;
  const subtitleSize = 14;
  const primarySpacing = 0.8;
  const subtitleSpacing = 1.2;
  const primaryWidth = textWidth(primary, primarySize, primarySpacing);
  const subtitleWidth = textWidth(subtitle, subtitleSize, subtitleSpacing);
  const width = Math.max(88, Math.ceil((Math.max(primaryWidth, subtitleWidth) + 32) / 2) * 2);
  const center = width / 2;
  const subtitleColor = options.subtitleColor || "#C4CDD8";
  const label = `${primary} — ${subtitle}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="89" viewBox="0 0 ${width} 89" role="img" aria-label="${escapeXml(label)}">
  <title>${escapeXml(label)}</title>
  <text x="${center}" y="49" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${primarySize}" font-weight="800" letter-spacing="${primarySpacing}" fill="#FEFEFE">${escapeXml(primary)}</text>
  <text x="${center}" y="68" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${subtitleSize}" font-weight="700" letter-spacing="${subtitleSpacing}" fill="${subtitleColor}">${escapeXml(subtitle)}</text>
</svg>
`;
}

for (const group of Object.values(groups)) {
  for (const [id, [primary, subtitle]] of Object.entries(group.items)) {
    const output = join(root, "assets", `${id}.svg`);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, wordmark(primary, subtitle, group), "utf8");
  }
}

console.log(`Generated ${Object.values(groups).reduce((sum, group) => sum + Object.keys(group.items).length, 0)} badge assets.`);
