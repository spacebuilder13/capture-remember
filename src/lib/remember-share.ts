import shareImage from "@/assets/remember-when-share.jpg.asset.json";

export const SHARE_SITE = "https://capture-remember.lovable.app";

/** Link-preview readers and crawlers; they must never count as real visitors. */
const BOT = /whatsapp|facebookexternalhit|facebot|meta-externalagent|twitterbot|slackbot|telegrambot|discordbot|linkedinbot|skypeuripreview|googlebot|google-inspectiontool|bingbot|applebot|embedly|pinterest|redditbot|vkshare|iframely|bot\b|crawler|spider/i;

export function isPreviewBot(userAgent: string | null | undefined) {
  return !!userAgent && BOT.test(userAgent);
}

type Meta = { sender: string | null; child: string | null; hasPreview: boolean } | null | undefined;

/** Head tags for a family invitation: the story's blurred photo, or the Remember When image. */
export function familyLinkHead(token: string, m: Meta) {
  const title = m?.sender ? `${m.sender} is telling ${m.child || "the little one"} a story tonight` : "A story for tonight | Remember When";
  const desc = "Add what you remember. It takes a minute.";
  const img = m?.hasPreview ? `${SHARE_SITE}/api/public/remember-preview/${token}.jpg` : `${SHARE_SITE}${shareImage.url}`;
  return {
    meta: [
      { title },
      { name: "description", content: desc },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: img },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: img },
    ],
  };
}
