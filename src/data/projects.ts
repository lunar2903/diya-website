// All projects below are FICTIONAL PLACEHOLDERS, not real commissioned work.
// Replace entries (and the art in /public/art) with Diya's real projects. Optional fields may be omitted.
export type Category = "Graphic Design" | "Pitches" | "Illustration" | "Branding" | "Experiments";
/** the only categories offered as Library filters */
export const categories: Category[] = ["Graphic Design", "Pitches"];

export type Shot = { src: string; caption?: string };

export type Project = {
  slug: string;
  title: string;
  category: Category;
  /** omitted when not supplied (e.g. pitches) */
  year?: number;
  description: string;
  coverColor: string; // spine / accent colour
  spineText: string; // readable text colour on the spine
  coverImage: string;
  thumbnailImage: string;
  featured: boolean;
  /** kept as data and routable, but not shown on the library shelf */
  hidden?: boolean;
  /** shelf shape: cover width x height in px */
  size: { w: number; h: number; t: number };
  overview?: string;
  brief?: string;
  concept?: string;
  processImages?: Shot[];
  finalImages?: Shot[];
  tools?: string[];
  credits?: string[];
  /** real campaign projects render with the campaign layout instead of the placeholder one */
  campaign?: Campaign;
  /** points the book at an existing project page instead of /projects/{slug} */
  route?: string;
  /** pitch presentation (PDF in /public/pitches) and/or external reference link */
  pitch?: { pdf?: string; link?: { href: string; label: string } };
  /** shorter title for the narrow book spine */
  spineTitle?: string;
};

export type Reel = { src: string; label: string };
/** single image or video, shown at its source aspect ratio */
export type Tile = { kind: "video" | "image"; src: string; label: string; w: number; h: number };
/** a titled block of loose tiles and/or independent carousels */
export type Block = { title: string; description?: string; prominent?: boolean; cols?: 1 | 2 | 3; tiles?: Tile[]; /** extra row of tiles shown as a sideways snap strip */ strip?: Tile[]; carousels?: PostCarousel[] };
export type PostCarousel = { label: string; title?: string; ratio: string; photos: { src: string; alt: string }[] };

export type Campaign = {
  /** bespoke page composition instead of the standard campaign layout */
  layout?: "montra" | "zee5" | "fms" | "pvp" | "kotak" | "broadway" | "fevicyrl" | "chetak";
  /** headline; when omitted the project title is the headline */
  campaignTitle?: string;
  /** small label above the headline; defaults to the project title */
  eyebrow?: string;
  /** full-width image shown above the header, at its source aspect ratio */
  hero?: Tile;
  /** header paragraphs; replaces the project description when present */
  intro?: string[];
  featuredVideo?: string;
  /** heading and copy shown beside the featured video */
  featuredTitle?: string;
  featuredText?: string;
  /** headline number, e.g. follower growth */
  stat?: { label: string; from: string; to: string; period: string };
  fullVideo?: { youtubeId: string; url: string };
  /** simple reel gallery followed by independent photo carousels */
  /** ordered titled sections (used by account-style projects) */
  blocks?: Block[];
  reelsTitle?: string;
  reels?: Reel[];
  carouselsTitle?: string;
  carousels?: PostCarousel[];
  /** in display order; a carousel is one gallery item */
  aftershots?: (
    | { type: "reel"; src: string; label: string }
    | { type: "carousel"; label: string; photos: { src: string; alt: string }[] }
  )[];
};

const fms = "/projects/four-more-shots";
const pvp = "/projects/prime-video-presents";
const pvpPosts = (post: number, count: number): PostCarousel["photos"] =>
  Array.from({ length: count }, (_, i) => ({ src: `${pvp}/presents-${post}-post-${i + 1}.jpg`, alt: `Post ${post}, photo ${i + 1} of ${count}` }));
const k8 = "/projects/kotak811";
const kUrl = (f: string) => encodeURI(`${k8}/${f}`);
const vid = (f: string, w: number, h: number, label: string): Tile => ({ kind: "video", src: kUrl(f), label, w, h });
const img = (f: string, w: number, h: number, label: string): Tile => ({ kind: "image", src: kUrl(f), label, w, h });
const kSeries = (prefix: string, count: number, alt: string): PostCarousel["photos"] =>
  Array.from({ length: count }, (_, i) => ({ src: kUrl(`${prefix}-${String(i + 1).padStart(2, "0")}.jpg`), alt: `${alt}, photo ${i + 1} of ${count}` }));
const bw = "/projects/broadway";
const bwVid = (f: string, w: number, h: number, label: string): Tile => ({ kind: "video", src: `${bw}/${f}`, label, w, h });
const bwImg = (f: string, w: number, h: number, label: string): Tile => ({ kind: "image", src: `${bw}/${f}`, label, w, h });
const fv = "/projects/fevicyrl";
const fvVid = (f: string, w: number, h: number, label: string): Tile => ({ kind: "video", src: `${fv}/${f}`, label, w, h });
const fvImg = (f: string, w: number, h: number, label: string): Tile => ({ kind: "image", src: `${fv}/${f}`, label, w, h });
const mt = "/projects/montra-electric";
const mtVid = (f: string, w: number, h: number, label: string): Tile => ({ kind: "video", src: `${mt}/${f}`, label, w, h });
const mtImg = (f: string, label: string): Tile => ({ kind: "image", src: `${mt}/${f}`, label, w: 1080, h: 1080 });
const ch = "/projects/chetak";
const cv = (f: string, w = 720, h = 1280): Tile => ({ kind: "video", src: `${ch}/${f}.mp4`, label: f.replace(/-/g, " "), w, h });
const ci = (f: string, w = 1080, h = 1350): Tile => ({ kind: "image", src: `${ch}/${f}.jpg`, label: f.replace(/-/g, " "), w, h });
const cn = (prefix: string, count: number, make: (f: string) => Tile) => Array.from({ length: count }, (_, i) => make(`${prefix}${i + 1}`));
/** a post of still images: one carousel, in numerical order */
const cPost = (label: string, prefix: string, count: number, ratio = "1080 / 1350"): PostCarousel =>
  ({ label, ratio, photos: Array.from({ length: count }, (_, i) => ({ src: `${ch}/${prefix}${i + 1}.jpg`, alt: `${label}, photo ${i + 1} of ${count}` })) });
const zee = "/projects/zee5-global";
const zi = (f: string, w: number, h: number, label: string): Tile => ({ kind: "image", src: `${zee}/${f}`, label, w, h });
const reel = (n: number) => ({ type: "reel" as const, src: `${fms}/aftershots-0${n}-reel.mp4`, label: `Aftershot ${n}` });

const art = (slug: string, n: string) => `/art/${slug}-${n}.svg`;
const base = (slug: string) => ({
  coverImage: art(slug, "cover"),
  thumbnailImage: art(slug, "cover"),
  processImages: [
    { src: art(slug, "p1"), caption: "Early line study — placeholder sketch." },
    { src: art(slug, "p2"), caption: "Detail exploration — placeholder." },
  ],
  finalImages: [
    { src: art(slug, "f1"), caption: "Final composition, wide crop — placeholder." },
    { src: art(slug, "f2"), caption: "Final detail — placeholder." },
  ],
});
const note = "Sample project: placeholder text to be replaced with Diya's real story.";

export const projects: Project[] = [
  {
    slug: "four-more-shots-please", title: "Four More Shots Please! × Prime Video", category: "Graphic Design", year: 2025,
    description: "For the launch of the final season of Four More Shots Please!, we teamed up with Ashwarya Mohanraj to bring the show’s unapologetic energy to life. From ideating and co-writing her script to creating fun activations around the launch, we built the buzz before the big moment and kept it going with videos during the launch. Because some shows deserve more than just a goodbye, ONE LAST SHOT!",
    spineTitle: "Four More Shots Please!", coverColor: "#A57756", spineText: "#F1E7DD", featured: true, size: { w: 210, h: 280, t: 46 },
    coverImage: `${fms}/01_book-cover.jpg`, thumbnailImage: `${fms}/01_book-cover.jpg`,
    campaign: {
      layout: "fms",
      campaignTitle: "ONE LAST SHOT!",
      featuredVideo: `${fms}/highlight-video-01.mp4`,
      fullVideo: { youtubeId: "t4bqjos-Rs8", url: "https://youtu.be/t4bqjos-Rs8" },
      aftershots: [
        reel(1), reel(2), reel(3), reel(4), reel(5),
        {
          type: "carousel", label: "Aftershot 6 · photo carousel",
          photos: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ src: `${fms}/aftershots-06-carousel-photo-${n}.jpg`, alt: `Aftershots carousel, photo ${n} of 8` })),
        },
        reel(7), reel(8),
      ],
    },
  },
  {
    slug: "prime-video-presents", title: "Prime Video Presents: Setting the Stage for What’s Next", category: "Graphic Design", year: 2025,
    description: "Every year, Prime Video gives audiences a peek at the stories worth looking forward to with Prime Video Presents. We got to be part of the big reveal, creating fun launch videos and on-ground activations that built the buzz, sparked curiosity, and got everyone talking. Because when there’s a whole world of stories waiting to drop, the hype deserves a story of its own.",
    spineTitle: "Prime Video Presents", coverColor: "#988780", spineText: "#3F3029", featured: true, size: { w: 170, h: 305, t: 44 },
    coverImage: `${pvp}/01_book-cover.png`, thumbnailImage: `${pvp}/01_book-cover.png`,
    campaign: {
      layout: "pvp",
      reelsTitle: "The Campaign Films",
      reels: Array.from({ length: 9 }, (_, i) => ({ src: `${pvp}/presents-0${i + 1}-reel.mp4`, label: `Campaign film ${i + 1}` })),
      carouselsTitle: "Behind the Launch",
      carousels: [
        { label: "Post 10 photo carousel", ratio: "1440 / 1789", photos: pvpPosts(10, 16) },
        { label: "Post 11 photo carousel", ratio: "1440 / 960", photos: pvpPosts(11, 20) },
        { label: "Post 12 photo carousel", ratio: "1440 / 1720", photos: pvpPosts(12, 19) },
      ],
    },
  },
  {
    slug: "kotak811", title: "Kotak811", category: "Graphic Design", year: 2025, description: "",
    spineTitle: "Kotak811", coverColor: "#C9A792", spineText: "#3F3029", featured: true, size: { w: 170, h: 305, t: 44 },
    coverImage: `${k8}/01_book-cover.png`, thumbnailImage: `${k8}/01_book-cover.png`,
    campaign: {
      layout: "kotak",
      blocks: [
        {
          title: "Makkhan Jaise Smooth Banking", prominent: true, cols: 2,
          description: "Helped launch a campaign built around one simple promise: banking so smooth, it feels like makkhan.",
          tiles: [vid("highlight-makkhan-01.mp4", 854, 480, "Makkhan film 1") ],
        },
        {
          title: "ActivMoney × Ranveer Singh", prominent: true, cols: 2,
          description: "Worked on films featuring Ranveer Singh, bringing the product story to life with a familiar face.",
          tiles: [vid("highlight-activmoney-01.mp4", 1920, 1080, "ActivMoney film 1"), vid("highlight-activmoney-02.mp4", 1920, 1080, "ActivMoney film 2")],
        },
        {
          // No description supplied. Files (1) and (2) each exist as both .mp4 and .jpg; (3) is a .jpg only.
          title: "Hausla Hai Toh Ho Jaayega", prominent: true, cols: 3,
          tiles: [
            vid("highlight-hausla-campaign-05 (1).mp4", 1920, 1080, "Hausla Hai Toh Ho Jaayega, video 1"),
            img("highlight-hausla-campaign-05 (1).jpg", 1350, 1687, "Hausla Hai Toh Ho Jaayega, image 1"),
            vid("highlight-hausla-campaign-05 (2).mp4", 358, 446, "Hausla Hai Toh Ho Jaayega, video 2"),
            img("highlight-hausla-campaign-05 (2).jpg", 1350, 1687, "Hausla Hai Toh Ho Jaayega, image 2"),
            img("highlight-hausla-campaign-05 (3).jpg", 1350, 1687, "Hausla Hai Toh Ho Jaayega, image 3"),
          ],
        },
        {
          title: "Kotak811 Super", cols: 2,
          tiles: [1, 2, 3, 4].map((n) => vid(`kotak-super-0${n}.mp4`, 1920, 1080, `Kotak811 Super film ${n}`)),
        },
        {
          title: "Moments", cols: 3,
          tiles: [2, 3, 4, 5, 6].map((n) => img(`kotak-moments-0${n}.jpg`, 1350, 1687, `Moments ${n}`)),
          carousels: [{ label: "Moments photo carousel", ratio: "1440 / 1800", photos: kSeries("kotak-moments-carousel", 8, "Moments carousel") }],
        },
        {
          title: "Topicals", cols: 3,
          tiles: [
            vid("kotak-topicals-02.mp4", 360, 360, "Topical 2"), vid("kotak-topicals-05.mp4", 720, 900, "Topical 5"),
            vid("kotak-topicals-06.mp4", 360, 450, "Topical 6"), vid("kotak-topicals-07.mp4", 720, 1280, "Topical 7"),
            img("kotak-topicals-08.jpg", 1350, 1687, "Topical 8"), vid("kotak-topicals-10.mp4", 720, 1280, "Topical 10"),
          ],
          carousels: [
            { label: "Ganpati photo carousel", title: "Ganpati", ratio: "1080 / 1080", photos: kSeries("kotak-topicals-ganpati-carousel", 5, "Ganpati carousel") },
            { label: "Dussehra photo carousel", title: "Dussehra", ratio: "1080 / 1080", photos: kSeries("kotak-topicals-dushera-carousel", 8, "Dussehra carousel") },
            { label: "Interest photo carousel", title: "Interest", ratio: "1440 / 1800", photos: kSeries("kotak-topicals-interest-carousel", 4, "Interest carousel") },
          ],
        },
      ],
    },
  },
  {
    slug: "broadway", title: "Broadway", category: "Graphic Design", year: 2025, description: "",
    spineTitle: "Broadway", coverColor: "#EFD7CC", spineText: "#3F3029", featured: true, size: { w: 170, h: 305, t: 44 },
    coverImage: `${bw}/broadway-book-cover.png`, thumbnailImage: `${bw}/broadway-book-cover.png`,
    campaign: {
      layout: "broadway",
      hero: bwImg("billboard-highlight.jpg", 553, 255, "Broadway billboard"),
      eyebrow: "Broadway:",
      campaignTitle: "Broadway, Hyderabad",
      intro: [
        "Broadway Hyderabad on the map through OOH campaigns that built buzz around its launch and kept the destination top of mind long after the big reveal.",
        "The brief was to create a tagline that people would remember long after the launch. Enter “Shop. Vibe. Tribe.” Three words that capture the whole point of Broadway: come for the shopping, stay for the vibe, find your tribe.",
      ],
      blocks: [
        {
          title: "The Launch", prominent: true, cols: 2,
          tiles: [1, 2, 3, 4].map((n) => bwVid(`broadway-delhi-${n}.mp4`, 360, 640, `Delhi launch film ${n}`)),
        },
        {
          title: "Hyderabad Launch", prominent: true, cols: 3,
          tiles: [bwVid("broadway-hyderabad-1.mp4", 360, 640, "Hyderabad launch film 1"), ...[2, 3, 4, 5, 6].map((n) => bwVid(`broadway-hyderabad-${n}.mp4`, 720, 1280, `Hyderabad launch film ${n}`))],
        },
        {
          title: "Billboards", prominent: true, cols: 3,
          tiles: [
            bwImg("billboard-1.jpg", 427, 182, "Billboard 1"), bwImg("billboard-2.jpg", 359, 319, "Billboard 2"), bwImg("billboard-3.jpg", 175, 344, "Billboard 3"),
            bwImg("billboard-4.jpg", 202, 409, "Billboard 4"), bwImg("billboard-5.jpg", 555, 202, "Billboard 5"),
          ],
        },
        {
          title: "Self-Shot Reels", prominent: true, cols: 3,
          tiles: [[1, 360, 640], [2, 720, 1280], [3, 360, 640], [4, 720, 1280], [5, 360, 640], [6, 720, 1280], [7, 360, 640]].map(([n, w, h]) => bwVid(`self-shot-${n}.mp4`, w, h, `Self-shot reel ${n}`)),
        },
      ],
    },
  },
  {
    slug: "fevicyrl", title: "Fevicyrl", category: "Graphic Design", year: 2025, description: "",
    spineTitle: "Fevicyrl", coverColor: "#A57756", spineText: "#F1E7DD", featured: true, size: { w: 170, h: 305, t: 44 },
    coverImage: `${fv}/book-cover.png`, thumbnailImage: `${fv}/book-cover.png`,
    campaign: {
      layout: "fevicyrl",
      hero: fvImg("fevicryl-banner.webp", 1691, 930, "Fevicryl — The Magic of Dreamy Pastels"),
      blocks: [
        { title: "A Little More Colour, A Lot More Creativity.", prominent: true, cols: 2,
          description: "Launched the Pastel Campaign with Masaba, bringing a fresh, creative spin to the world of colours.",
          tiles: [1, 2].map((n) => fvVid(`masaba-highlight-${n}.mp4`, 720, 1280, `Masaba highlight film ${n}`)) },
        { title: "Diwali Campaign", prominent: true, cols: 1,
          description: "Worked on the Tie-Dye campaign, Diwali campaign and introduced ongoing content IPs like *Elevate Your Art*, *Tuesday Tips*, *Art of India*, and *Crafting Memories* to keep creativity flowing beyond campaigns.",
          tiles: [fvImg("diwali-post.webp", 799, 675, "Diwali post"), fvVid("diwali-highlight.mp4", 720, 1280, "Diwali highlight film")] },
        {
          title: "Tie-Dye Campaign", prominent: true, cols: 3,
          tiles: [
            ...[1, 2, 3].map((n) => fvImg(`tie-die-${n}.jpg`, 1350, 1687, `Tie-dye image ${n}`)),
            ...[1, 2, 3].map((n) => fvVid(`tie-die-vid-${n}.mp4`, n === 2 ? 360 : 720, n === 2 ? 640 : 1280, `Tie-dye film ${n}`)),
          ],
        },
        { title: "Art of India & Ongoing Content", prominent: true, cols: 3,
          description: "Handled BAU content for the brand from 2024–2025, keeping its social presence colourful, consistent, and full of inspiration.",
          tiles: [1, 2, 3, 4, 5, 6, 7].map((n) => fvVid(`art-of-india-${n}.mp4`, 720, 1280, `Art of India film ${n}`)) },
        { title: "Influencer Collaboration", prominent: true, cols: 2,
          description: "Partnered with Abhinav, whose Lippan Art of India kit creations boosted reach by 8.3 million and showcased product versatility.",
          tiles: [1, 2].map((n) => fvVid(`influencer-colab-${n}.mp4`, 720, 1280, `Influencer collaboration film ${n}`)) },
      ],
    },
  },
  {
    slug: "montra-electric", title: "Montra Electric", category: "Graphic Design", year: 2025, description: "",
    spineTitle: "Montra Electric", coverColor: "#988780", spineText: "#3F3029", featured: true, size: { w: 170, h: 305, t: 44 },
    coverImage: `${mt}/book-cover.png`, thumbnailImage: `${mt}/book-cover.png`,
    campaign: {
      layout: "montra",
      eyebrow: "Montra Electric",
      campaignTitle: "Putting the Bigger Picture in Motion.",
      intro: ["Worked on the brand’s corporate film, helping bring its larger vision and positioning to life through a key brand communication."],
      featuredVideo: `${mt}/highlight-corporate-film.mp4`,
      blocks: [
        { title: "Moments", tiles: [mtImg("moments-1.jpg", "Moments 1"), mtImg("moments-2.jpg", "Moments 2"), mtVid("moments-3.mp4", 360, 360, "Moments film 3"), mtImg("moments-4.jpg", "Moments 4")] },
        {
          title: "Tropicals",
          tiles: [
            mtImg("tropicals-1.jpg", "Tropicals 1"), mtImg("tropicals-2.jpg", "Tropicals 2"), mtImg("tropicals-3.jpg", "Tropicals 3"),
            mtVid("tropicals-4.mp4", 720, 720, "Tropicals film 4"), mtImg("tropicals-5.jpg", "Tropicals 5"), mtVid("tropicals-6.mp4", 360, 360, "Tropicals film 6"),
          ],
        },
        {
          title: "BAU Content",
          description: "Handled BAU content for the brand from 2024–2025, keeping its day-to-day communication moving alongside its bigger brand stories.",
          tiles: [[1, 360, 640], [2, 720, 1280], [3, 360, 640], [4, 360, 640], [5, 360, 640]].map(([n, w, h]) => mtVid(`bau-${n}.mp4`, w, h, `BAU film ${n}`)),
        },
      ],
    },
  },
  {
    slug: "zee5-global", title: "ZEE5 Global", category: "Graphic Design", year: 2025,
    description: "Kept the stories going beyond the screen, working on the brand\u2019s social retainer to bring its world of entertainment to life online.",
    coverColor: "#C9A792", spineText: "#3F3029", featured: true, size: { w: 170, h: 305, t: 44 },
    coverImage: `${zee}/book-cover.png`, thumbnailImage: `${zee}/book-cover.png`,
    campaign: {
      layout: "zee5",
      blocks: [
        { title: "Group 1", tiles: [zi("group1-1.png", 1177, 1337, "Group 1, image 1"), zi("group1-2.png", 1187, 1325, "Group 1, image 2"), zi("group1-3.png", 1168, 1346, "Group 1, image 3"), zi("group1-4.png", 1171, 1343, "Group 1, image 4")] },
        { title: "Group 2", tiles: [zi("group2-1.png", 1133, 1388, "Group 2, image 1"), zi("group2-2.png", 1193, 1318, "Group 2, image 2"), zi("group2-3.png", 1142, 1378, "Group 2, image 3"), zi("group2-4.png", 1114, 1412, "Group 2, image 4")] },
        { title: "Group 3", tiles: [zi("group3-1.png", 1174, 1340, "Group 3, image 1"), zi("group3-2.png", 1174, 1340, "Group 3, image 2"), zi("group3-3.png", 1192, 1320, "Group 3, image 3"), zi("group3-4.png", 1244, 1265, "Group 3, image 4")] },
        { title: "Group 4", tiles: [zi("group4-1.png", 1131, 1391, "Group 4, image 1"), zi("group4-2.png", 1144, 1375, "Group 4, image 2"), zi("group4-3.png", 1143, 1376, "Group 4, image 3"), zi("group4-4.png", 1154, 1363, "Group 4, image 4")] },
        { title: "Group 5", tiles: [zi("group5-1.png", 1166, 1349, "Group 5, image 1"), zi("group5-2.png", 1138, 1382, "Group 5, image 2"), zi("group5-3.png", 1165, 1350, "Group 5, image 3"), zi("group5-4.png", 1142, 1377, "Group 5, image 4")] },
        { title: "Group 6", tiles: [zi("group6-1.png", 718, 882, "Group 6, image 1"), zi("group6-2.png", 708, 885, "Group 6, image 2"), zi("group6-3.png", 717, 880, "Group 6, image 3")] },
        { title: "Group 7", tiles: [zi("group7-1.png", 748, 841, "Group 7, image 1"), zi("group7-2.png", 748, 844, "Group 7, image 2"), zi("group7-3.png", 748, 844, "Group 7, image 3")] },
        { title: "Group 8", tiles: [zi("group8-1.png", 981, 970, "Group 8, image 1"), zi("group8-2.png", 978, 966, "Group 8, image 2")] },
        { title: "Group 9", tiles: [zi("group9-1.png", 873, 1081, "Group 9, image 1"), zi("group9-2.png", 873, 1086, "Group 9, image 2")] },
        { title: "Group 10", tiles: [zi("group10-1.png", 538, 795, "Group 10, image 1"), zi("group10-2.png", 475, 796, "Group 10, image 2"), zi("group10-3.png", 448, 793, "Group 10, image 3"), zi("group10-4.png", 463, 795, "Group 10, image 4"), zi("group10-5.png", 459, 795, "Group 10, image 5")] },
        { title: "Group 11", tiles: [zi("group11-1.png", 481, 799, "Group 11, image 1"), zi("group11-2.png", 468, 796, "Group 11, image 2"), zi("group11-3.png", 463, 796, "Group 11, image 3"), zi("group11-4.png", 484, 795, "Group 11, image 4"), zi("group11-5.png", 481, 796, "Group 11, image 5")] },
        { title: "Group 12", tiles: [zi("group12-1.png", 481, 792, "Group 12, image 1"), zi("group12-2.png", 471, 792, "Group 12, image 2"), zi("group12-3.png", 475, 795, "Group 12, image 3"), zi("group12-4.png", 472, 796, "Group 12, image 4"), zi("group12-5.png", 478, 793, "Group 12, image 5")] },
        { title: "Posts", tiles: [zi("post-1.png", 1376, 1143, "Post 1"), zi("post-2.png", 1123, 1400, "Post 2"), zi("post-3.png", 1083, 1452, "Post 3"), zi("post-4.png", 1169, 1345, "Post 4"), zi("post-5.png", 1154, 1363, "Post 5"), zi("post-6.png", 1268, 1241, "Post 6"), zi("post-7.png", 1254, 1254, "Post 7"), zi("post-8.png", 1219, 1290, "Post 8")] },
      ],
    },
  },
  {
    slug: "chetak", title: "Chetak", category: "Graphic Design", description: "",
    spineTitle: "Chetak", coverColor: "#A57756", spineText: "#F1E7DD", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: `${ch}/book-cover.webp`, thumbnailImage: `${ch}/book-cover.webp`,
    campaign: {
      layout: "chetak",
      intro: [
        "Over the course of 2025–2026, I worked on leading and managing Bajaj Chetak’s social media and brand campaigns across key launches, partnerships and brand-building initiatives. Some of the key campaigns included Miles of Trust, the brand film launch, the launch of the new Chetak C25, and partnerships with RCB and SCREEN Awards.",
        "During this period, the brand’s Instagram community grew from 122K to 282K followers, reflecting the growth in its digital presence and audience engagement.",
      ],
      stat: { label: "Instagram followers", from: "122K", to: "282K", period: "2025–2026" },
      featuredVideo: `${ch}/chetak-highlight-brand-film.mp4`,
      featuredTitle: "In the Most Difficult, Chetak Makes Life Easy",
      featuredText: "The brand film brought alive Chetak’s core promise of making everyday life easier, even when situations get difficult. It reinforced the brand’s reliability and convenience, while building an emotional connection with consumers through the thought that no matter what life throws at you, Chetak makes the ride easier.",
      blocks: [
        { title: "Techproof Rides", description: "Chetak has always stood for reliable technology, thoughtful innovation and convenience. With TechProof, the idea was to bring these strengths to life through relatable, everyday situations. Instead of simply talking about product features, we showed how Chetak’s technology makes everyday riding easier, more convenient and worry-free, reinforcing the thought of being truly Befikar.", tiles: cn("Techproof-", 3, cv) },
        { title: "SCREEN Awards", description: "Bajaj Chetak came on board as the title sponsor of SCREEN Awards. The association was built around the idea of Chetak being a star in everyday life, connecting the brand’s youthful relevance with the world of entertainment, cinema and the stars we celebrate.", tiles: [cv("Screen-Awards-1"), cv("Screen-Awards-2", 1280, 720), ...[3, 4, 5, 6].map((n) => cv(`Screen-Awards-${n}`))] },
        { title: "Launch of C25", description: "Chetak introduced the C25, a more compact, accessible and youth-oriented addition to its scooter portfolio. The communication revolved around the proposition 'Ride Easy. Vibe Easy', positioning the scooter as an easy, effortless and fun companion for the everyday journeys of a younger audience.", tiles: [cv("C25-1", 1276, 720), cv("C25-2"), cv("C25-3"), cv("C25-4")], carousels: [cPost("C25 post 1 photo carousel", "C25-post1-", 7)] },
        { title: "RCB", description: "Following the launch of the C25, Chetak’s communication took on a more youthful, vibrant and fun personality. The association with RCB was a natural extension of this direction. By bringing together two brands with a strong connection to young audiences, the partnership helped build excitement and visibility around the new scooter launch.", tiles: [cv("RCB-1"), cv("RCB-2"), cv("RCB-3", 720, 900)], carousels: [cPost("RCB post 1 photo carousel", "RCB-post1-", 4)] },
        { title: "Christmas Series", tiles: cn("Christmas-", 4, cv) },
        {
          title: "Collaboration with Google",
          tiles: [...cn("google-colab-post1-", 6, (f) => cv(f, 716, 918)), ci("google-colab-post1-7", 896, 1152)],
          carousels: [cPost("Google Colab post 2 photo carousel", "google-colab-post2-", 8, "1080 / 1080")],
        },
        {
          title: "Topicals & Moments",
          tiles: [cv("tropical-moments-1", 1032, 720), cv("tropical-moments-2"), ci("tropical-moments-3", 1350, 1688), ci("tropical-moments-4", 1350, 1688),
            ...[5, 6, 7, 8, 9].map((n) => cv(`tropical-moments-${n}`)), cv("tropical-moments-11", 360, 640), cv("tropical-moments-12"), cv("tropical-moments-13")],
          strip: cn("tropical-moments-post10-", 5, (f) => cv(f, 720, 900)),
        },
        {
          title: "Best of Everyday Hustle",
          tiles: [1, 2, 3, 4, 5, 8, 9].map((n) => cv(`everyday-hustle-${n}`)),
          carousels: [
            cPost("Everyday Hustle post 6 photo carousel", "everyday-hustle-6-", 4), cPost("Everyday Hustle post 7 photo carousel", "everyday-hustle-7-", 5),
            cPost("Everyday Hustle post 10 photo carousel", "everyday-hustle-10-", 7), cPost("Everyday Hustle post 11 photo carousel", "everyday-hustle-11-", 6),
          ],
        },
      ],
    },
  },
  {
    slug: "fictional-brand-identity", title: "Maison Petit", category: "Branding", year: 2024,
    description: "A fictional brand identity for a neighbourhood stationery shop.",
    coverColor: "#A57756", spineText: "#F1E7DD", featured: false, hidden: true, size: { w: 165, h: 270, t: 42 },
    overview: `A made-up studio brand, built end to end. ${note}`,
    brief: "Invent a small business and give it a memorable identity system. (Fictional.)",
    concept: "A modular set of simple shapes that can be stamped, folded and stacked.",
    tools: ["Illustrator", "InDesign"], credits: ["Fictional client — no real business"],
    ...base("fictional-brand-identity"),
  },
  {
    slug: "editorial-illustration", title: "Faces in Print", category: "Illustration", year: 2023,
    description: "An editorial illustration series imagining magazine portraits.",
    coverColor: "#988780", spineText: "#3F3029", featured: false, hidden: true, size: { w: 155, h: 280, t: 36 },
    overview: `Portraits for imaginary feature stories. ${note}`,
    brief: "Illustrate five fictional articles with one visual language.",
    tools: ["Procreate", "Photoshop"],
    ...base("editorial-illustration"),
  },
  {
    slug: "personal-visual-exploration", title: "Loose Threads", category: "Experiments", year: 2025,
    description: "A personal visual exploration — doodles, dots and happy accidents.",
    coverColor: "#C9A792", spineText: "#3F3029", featured: false, size: { w: 150, h: 250, t: 34 },
    overview: `Untidy, unfinished, entirely free. ${note}`,
    concept: "Follow the line wherever it goes.",
    tools: ["Pencil", "Ink", "Procreate"],
    ...base("personal-visual-exploration"),
  },
  // Pitches: typographic covers (empty coverImage) unless an existing project supplies one. Kotak811 reuses its existing page.
  {
    slug: "kotak811-pitch", title: "Kotak811", category: "Pitches",
    description: "Making banking feel less bank-y and more Gen Z. Won the YouTube pitch to bring the brand closer to a younger, digital-first audience.",
    coverColor: "#A57756", spineText: "#F1E7DD", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: `${k8}/01_book-cover.png`, thumbnailImage: `${k8}/01_book-cover.png`,
    pitch: { pdf: "/pitches/KOTAK-811.pdf" },
  },
  {
    slug: "android", title: "Android", category: "Pitches",
    description: "Smarter, better, safer, with Kareena and Saif Ali Khan in the mix. Won the retainer pitch to help Android make everyday tech feel more intuitive.",
    coverColor: "#988780", spineText: "#3F3029", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: "/pitches/android-book-cover.png", thumbnailImage: "/pitches/android-book-cover.png",
    pitch: { pdf: "/pitches/Android.pdf" },
  },
  {
    slug: "airtel-payments-bank", title: "Airtel Payments Bank", category: "Pitches",
    description: "Giving digital banking a more traditionality-free, forward-thinking voice. Won the social retainer pitch to help the brand move with a new-age audience.",
    coverColor: "#C9A792", spineText: "#3F3029", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: "/pitches/Airtel-book-cover.png", thumbnailImage: "/pitches/Airtel-book-cover.png",
    pitch: { pdf: "/pitches/Airtel.pdf" },
  },
  {
    slug: "khosla-ka-ghosla", title: "Khosla Ka Ghosla", category: "Pitches",
    description: "When Google Gemini meets a cult classic. Worked on the big idea to launch the film’s integration with Gemini, bringing AI into the story in a way that feels fresh and relevant.",
    coverColor: "#EFD7CC", spineText: "#3F3029", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: "/pitches/Khosla-Ka-Ghosla-book-cover.png", thumbnailImage: "/pitches/Khosla-Ka-Ghosla-book-cover.png",
    pitch: { pdf: "/pitches/Khosla-Ka-Ghosla.pdf" },
  },
  {
    slug: "google-maps", title: "Google Maps", category: "Pitches",
    description: "Helping a familiar everyday essential find new ways to show up. Won the social retainer pitch to make the brand’s world feel more engaging, one idea at a time.",
    coverColor: "#A57756", spineText: "#F1E7DD", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: "/pitches/google-maps-book-cover.png", thumbnailImage: "/pitches/google-maps-book-cover.png",
    pitch: { pdf: "/pitches/Google-Maps.pdf" },
  },
  {
    slug: "matka-king", title: "Matka King", category: "Pitches",
    description: "A big story deserves a big entry. Worked on launch ideas to build intrigue and get audiences ready to tune in.",
    coverColor: "#988780", spineText: "#3F3029", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: "/pitches/Matka-King-book-cover.png", thumbnailImage: "/pitches/Matka-King-book-cover.png",
    pitch: { pdf: "/pitches/Matka-King.pdf" },
  },
  {
    slug: "glory", title: "Glory", category: "Pitches",
    description: "Bringing the drama, ambition and intensity of Glory to life through big launch ideas designed to get people talking.",
    coverColor: "#C9A792", spineText: "#3F3029", featured: false, size: { w: 229, h: 305, t: 44 },
    coverImage: "/pitches/glory-book-cover.png", thumbnailImage: "/pitches/glory-book-cover.png",
    pitch: { pdf: "/pitches/glory.pdf" },
  },
  {
    slug: "google-pixel-shubman-gill", title: "Google Pixel × Shubman Gill", category: "Pitches",
    description: "Getting the right people talking. Worked on a seeding plan with Shubman Gill to get Google Pixel into the right conversations and in front of the right audiences.",
    coverColor: "#EFD7CC", spineText: "#3F3029", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: "/pitches/google-pixel-book-cover.png", thumbnailImage: "/pitches/google-pixel-book-cover.png",
    pitch: { pdf: "/pitches/google-pixel.pdf" },
  },
  {
    slug: "king-google-gemini", title: "King × Google Gemini", category: "Pitches",
    description: "When SRK meets Gemini, the launch needs to be just as big. Worked on big ideas for the film’s launch with Google Gemini, bringing together star power and smart storytelling.",
    coverColor: "#A57756", spineText: "#F1E7DD", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: "/pitches/google-gemini-book-cover.png", thumbnailImage: "/pitches/google-gemini-book-cover.png",
    pitch: { pdf: "/pitches/google-gemini.pdf" },
  },
  {
    slug: "tara-and-sri", title: "Tara & Sri", category: "Pitches",
    description: "Turning a launch into a moment worth noticing, with big ideas built to spark curiosity and get audiences invested.",
    coverColor: "#988780", spineText: "#3F3029", featured: false, size: { w: 170, h: 305, t: 44 },
    coverImage: "/pitches/tara-siri-book-cover.png", thumbnailImage: "/pitches/tara-siri-book-cover.png",
    pitch: { link: { href: "https://www.instagram.com/tarasri.tibarumals/", label: "View Instagram Profile" } },
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const getNeighbours = (slug: string) => {
  const list = projects.filter((p) => !p.route);
  const i = list.findIndex((p) => p.slug === slug);
  return { prev: list[(i - 1 + list.length) % list.length], next: list[(i + 1) % list.length] };
};
