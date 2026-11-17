import grid from "@/assets/one-photo-two-memories/grid/grid.png.asset.json";
import s1 from "@/assets/one-photo-two-memories/unblurring/slide-1.png.asset.json";
import s2 from "@/assets/one-photo-two-memories/unblurring/slide-2.png.asset.json";
import s3 from "@/assets/one-photo-two-memories/unblurring/slide-3.png.asset.json";
import s4 from "@/assets/one-photo-two-memories/unblurring/slide-4.png.asset.json";
import s5 from "@/assets/one-photo-two-memories/unblurring/slide-5.png.asset.json";
import s6 from "@/assets/one-photo-two-memories/unblurring/slide-6.png.asset.json";
import s7 from "@/assets/one-photo-two-memories/unblurring/slide-7.png.asset.json";

export const UNBLUR_SLIDES = [s1, s2, s3, s4, s5, s6, s7].map((a) => a.url);
export const GRID_IMAGE = grid.url;

/** Block 1 video slots. Set `src` to an asset URL once the file arrives. */
export const VIDEO_SLOTS: { label: string; shape: "square" | "wide"; src: string | null }[] = [
  { label: "Square", shape: "square", src: null },
  { label: "Wide, copy together", shape: "wide", src: null },
  { label: "Wide, copy split", shape: "wide", src: null },
];
