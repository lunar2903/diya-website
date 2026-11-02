/** Frames for the animated favicon: a golden cat on a stack of books. Kept tiny so swapping them costs nothing. */
const GOLD = "#C9A46A";
const TAILS = [
  "M10.2 17.2Q5.2 17.8 5.6 13.4", // resting
  "M10.2 17.2Q5.4 16.4 6.4 11.6", // lifting
  "M10.2 17.2Q6 14.8 8.2 9.6",    // raised
];
const star = (s: number) => {
  const [x, y, k] = [26.5, 7.5, s * 0.26];
  return `<path d="M${x} ${y - s}L${x + k} ${y - k}L${x + s} ${y}L${x + k} ${y + k}L${x} ${y + s}L${x - k} ${y + k}L${x - s} ${y}L${x - k} ${y - k}Z" fill="#F3DDA6"/>`;
};

export function frame(tail = 0, sparkle = 0) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" rx="7" fill="#120d09"/>` +
    `<rect x="4" y="25" width="24" height="4" rx=".8" fill="#7d5f36"/><rect x="6" y="21.4" width="20" height="3.6" rx=".8" fill="#9a7746"/><rect x="7.5" y="18" width="17" height="3.4" rx=".8" fill="#b08a52"/>` +
    `<path d="${TAILS[tail]}" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>` +
    `<ellipse cx="15.4" cy="14.2" rx="6" ry="4.6" fill="${GOLD}"/>` +
    `<circle cx="19.6" cy="9.4" r="3.9" fill="${GOLD}"/>` +
    `<path d="M16.4 7.6L16.8 3.4L19.6 6Z M19.8 6L22.6 3.4L22.8 7.6Z" fill="${GOLD}"/>` +
    (sparkle ? star(sparkle) : "") +
    `</svg>`
  );
}
export const uri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
