import grid from "@/assets/one-photo-two-memories/grid/grid.png.asset.json";
import s2 from "@/assets/one-photo-two-memories/unblurring/slide-2.png.asset.json";
import s3 from "@/assets/one-photo-two-memories/unblurring/slide-3.png.asset.json";
import s4 from "@/assets/one-photo-two-memories/unblurring/slide-4.png.asset.json";
import s5 from "@/assets/one-photo-two-memories/unblurring/slide-5.png.asset.json";
import s6 from "@/assets/one-photo-two-memories/unblurring/slide-6.png.asset.json";
import s7 from "@/assets/one-photo-two-memories/unblurring/slide-7.png.asset.json";
import vGif from "@/assets/one-photo-two-memories/videos/portrait-gif.mp4.asset.json";
import vTogether from "@/assets/one-photo-two-memories/videos/reel-copy-together.mp4.asset.json";
import vSplit from "@/assets/one-photo-two-memories/videos/reel-copy-split.mp4.asset.json";

/** Unblurring carousel: blurry to fully clear. */
export const UNBLUR_SLIDES = [s2, s3, s4, s5, s6, s7].map((a) => a.url);
export const GRID_IMAGE = grid.url;

export const VIDEO_SLOTS: { label: string; shape: "portrait" | "wide"; src: string | null }[] = [
  { label: "Gif, 4:5", shape: "portrait", src: vGif.url },
  { label: "Reel, copy together", shape: "wide", src: vTogether.url },
  { label: "Reel, copy split", shape: "wide", src: vSplit.url },
];
