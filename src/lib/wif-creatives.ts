import parkReel from "@/assets/while-its-fresh/videos/mihir-at-the-park-reel.mp4.asset.json";
import rotiReel from "@/assets/while-its-fresh/videos/first-roti-reel.mp4.asset.json";

export const WIF_ORIGINALS_FOLDER =
  "https://thequirkyi-my.sharepoint.com/:f:/p/harsh/IgANZiougeC9ToOh9Wt-XGO8AbM_JTTzay5zqabWxrh_-kY?e=6HIzhV";

export const WIF_EXPERIENCE_URL = "https://capture-remember.lovable.app/while-its-fresh";

export const WIF_CREATIVES = [
  {
    number: 1,
    title: "Mihir at the park",
    kind: "Vertical screen-recording reel · 48s",
    src: parkReel.url,
    downloadName: "mihir-at-the-park-reel.mp4",
    originalName: "Option 1.mp4",
    launchWarning:
      "Do not launch with this end card. It still shows app-store badges while the test sends people to the browser experience. Flagged for TQi to swap for the browser-flow end card.",
    caption: `I love narrating goofy incidents about my child to everyone around me. Now I also take an extra minute to capture them on Memreel after I do.

I'd say have a look and you'll get what I mean

Tap the button or comment "Keep" for the link!`,
    platformNote: "Post from the Memreel Instagram page and boost it from there.",
  },
  {
    number: 2,
    title: "First roti",
    kind: "Illustrated reel · 37s",
    src: rotiReel.url,
    downloadName: "first-roti-reel.mp4",
    originalName: "Option 2.mp4",
    launchWarning: null,
    caption: `Now Jyoti is the friend that recommends... so try for yourself now!

Click the button or comment "Keep" to receive the link in your dms`,
    platformNote: "Post from the Memreel Instagram page and boost it as a reel.",
  },
] as const;

export const WIF_RUN_STEPS: [string, string][] = [
  [
    "Before",
    'Decide organic page post vs boost vs ad for each reel; confirm comment-"Keep" DM mechanic vs direct button link on ads; lock budget and duration if boosting; set the launch date; confirm analytics are set up. Swap Creative 1\'s end card before launch and upload the original-quality files from Harsh\'s folder.',
  ],
  ["During", "Watch page visits > stories kept > photo age > Keep sign-ups."],
  ["After", "Report stories kept, photo-age distribution, and Keep sign-ups."],
];