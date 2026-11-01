// Approximate swatch colours for EDELRID colour names ("Night-green", "Icemint", "Oasis").
// Two-tone names render as a split swatch. Unknown names fall back to a neutral grey.

const COL: Record<string, string> = {
  night: "#22252b", oasis: "#1f9e8f", icemint: "#8fd8cb", slate: "#59636e", snow: "#f3f3f0", white: "#fafafa", black: "#111111",
  silver: "#c0c4c8", red: "#d5303a", fire: "#ea5a2a", flame: "#f26b1d", blue: "#2c5cc5", green: "#3a9a4a", yellow: "#f2cf2e",
  orange: "#f28a1e", pink: "#e85a9b", violet: "#7d4cc2", grey: "#8a8d91", gray: "#8a8d91", anthracite: "#3a3d42", navy: "#1e2a4a",
  petrol: "#1f5f6b", mint: "#9fe0c4", lavender: "#b9a7e6", turquoise: "#2fc4c0", neon: "#c8f03c", hivis: "#e6ff2b", khaki: "#8a8460",
  sahara: "#d6b98a", desert: "#c9a878", stone: "#9a948a", steel: "#8b97a3", titan: "#7b8088", lead: "#5d6166", asphalt: "#44474c",
  obsidian: "#2a2b30", jade: "#3aa385", plum: "#6e3b6e", raspberry: "#c2264f", beetroot: "#8b1e3f", rhubarb: "#b8324a", vinered: "#8c1c2c",
  darkred: "#8b1a1a", lava: "#c9452b", salsa: "#d9483b", marigold: "#f2a516", amber: "#f0a21b", mustard: "#d4a22a", citrus: "#e8d43a",
  lemon: "#f1e45a", curry: "#d9a520", gold: "#c9a24a", aniseed: "#b8c46a", alga: "#5c8a4a", forest: "#2e5e3a", pine: "#24503a",
  grass: "#5ea43a", blueberry: "#3b3f8c", deepblue: "#1d3b8c", denim: "#3d5a80", indigo: "#3b3f9c", lapis: "#2a4f9c", royal: "#2c4fd1",
  sailor: "#2a4c7a", shark: "#4f6f8a", stoneblue: "#6f8aa0", mineral: "#3d6f8f", aqua: "#3fb5d6", sky: "#8cc8ee", pacific: "#6fc4d6",
  bahamas: "#3fc0c8", aruba: "#45c2b3", seychellen: "#2aa7a5", river: "#4d8fa8", polar: "#d8eef2", dolphin: "#7f8d97", ocean: "#6d7c86",
  bluegrey: "#6c7d8c", pebbles: "#a8a196", granita: "#9da3a6", shell: "#f1c0c0", coral: "#f08a7e", rose: "#e88aa0", flower: "#e86fa8",
  blowball: "#e8e2d0", hokkaido: "#e07a3a", coffee: "#5a3c2a", oil: "#3c3a2a", space: "#2b2f4a", eco: "#7a8a5a", transparent: "#d9dcdf",
  reflective: "#cfd6db", chute: "#4caf6b", plantain: "#a5a34a", sake: "#c9a24a", light: "#c4c6c9", dark: "#3a3d42",
};

function one(part: string): string {
  const words = part.toLowerCase().trim().split(/\s+/);
  for (let i = words.length - 1; i >= 0; i--) if (COL[words[i]]) return COL[words[i]];
  return "#9a9c9f";
}

export function colourFill(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("assorted") || n.includes("multi")) return "conic-gradient(#e5484d,#f2cf2e,#3a9a4a,#2c5cc5,#e5484d)";
  const parts = n.split(/[-/]/).filter(Boolean);
  if (parts.length < 2) return one(n);
  return `linear-gradient(135deg, ${one(parts[0])} 50%, ${one(parts[1])} 50%)`;
}
