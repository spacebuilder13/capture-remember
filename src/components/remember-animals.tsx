import type { ReactNode } from "react";
import type { SparkKey, WifSparkKey } from "@/lib/remember-sparks";

// Hand-drawn crayon animals. A displacement filter roughens every stroke;
// each shape is drawn twice with a small offset so it reads like crayon.
function Crayon({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full text-foreground" aria-hidden>
      <defs>
        <filter id={`cr-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
        </filter>
        <pattern id={`hatch-${id}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--primary)" strokeWidth="2.6" strokeOpacity=".55" />
        </pattern>
      </defs>
      <g filter={`url(#cr-${id})`} fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        {children}
        <g transform="translate(1.2 0.8)" strokeOpacity=".35" strokeWidth="2">{children}</g>
      </g>
    </svg>
  );
}

const H = (id: string) => `url(#hatch-${id})`;

function Stork() {
  const id = "born";
  return (
    <Crayon id={id}>
      <path d="M30 52 Q45 38 66 46 Q78 52 74 62 Q60 70 40 64 Z" />
      <path d="M36 50 Q50 44 62 52" />
      <path d="M68 48 Q76 30 82 24" />
      <circle cx="84" cy="22" r="5" />
      <path d="M88 22 L108 26 L88 27" />
      <path d="M48 66 L46 92 M58 66 L62 92" />
      <path d="M96 30 Q100 50 94 58" />
      <path d="M84 58 Q94 54 104 58 Q106 74 94 78 Q82 74 84 58 Z" fill={H(id)} />
      <circle cx="94" cy="64" r="3" />
    </Crayon>
  );
}

function Mouse() {
  const id = "tiny";
  return (
    <Crayon id={id}>
      <ellipse cx="44" cy="74" rx="20" ry="18" />
      <circle cx="44" cy="46" r="14" />
      <circle cx="32" cy="32" r="7" fill={H(id)} />
      <circle cx="56" cy="32" r="7" fill={H(id)} />
      <circle cx="40" cy="45" r="1.5" />
      <circle cx="49" cy="45" r="1.5" />
      <path d="M44 52 L44 54 M34 52 L24 50 M54 52 L64 50" />
      <path d="M26 82 Q8 92 18 104" />
      <path d="M58 64 L70 54" />
      <rect x="68" y="30" width="34" height="30" rx="2" />
      <circle cx="85" cy="42" r="6" fill={H(id)} />
      <path d="M74 56 Q85 48 96 56" />
    </Crayon>
  );
}

function Monkey() {
  const id = "funny";
  return (
    <Crayon id={id}>
      <path d="M10 14 Q60 22 110 12" />
      <path d="M52 18 Q54 30 56 40" />
      <ellipse cx="60" cy="56" rx="14" ry="18" />
      <circle cx="60" cy="88" r="15" />
      <ellipse cx="60" cy="92" rx="9" ry="7" fill={H(id)} />
      <circle cx="54" cy="84" r="1.6" />
      <circle cx="66" cy="84" r="1.6" />
      <path d="M54 96 Q60 92 66 96" />
      <circle cx="44" cy="88" r="5" />
      <circle cx="76" cy="88" r="5" />
      <path d="M48 64 Q36 74 40 84 M72 64 Q86 72 84 82" />
      <path d="M66 42 Q78 30 72 18" />
      <path d="M58 40 Q86 46 92 64 Q96 76 88 78" />
    </Crayon>
  );
}

function Elephants() {
  const id = "when_small";
  return (
    <Crayon id={id}>
      {/* mum, facing right */}
      <ellipse cx="38" cy="64" rx="26" ry="18" />
      <path d="M22 78 L22 94 M34 80 L34 94 M46 80 L46 94 M56 76 L56 92" />
      <circle cx="66" cy="50" r="14" />
      <path d="M58 42 Q44 46 48 62 Q58 66 62 56" fill={H(id)} />
      <circle cx="70" cy="46" r="1.8" />
      <path d="M78 54 Q86 66 82 78 Q80 84 86 84" />
      <path d="M12 60 Q6 66 10 72" />
      {/* calf, holding mum's tail? no: trunk up to mum */}
      <ellipse cx="92" cy="86" rx="13" ry="9" />
      <path d="M84 94 L84 102 M92 95 L92 103 M100 94 L100 102" />
      <circle cx="102" cy="76" r="8" />
      <path d="M98 72 Q90 74 94 82" fill={H(id)} />
      <circle cx="105" cy="74" r="1.4" />
      <path d="M108 80 Q114 86 112 92" />
    </Crayon>
  );
}

function Owl() {
  const id = "own";
  return (
    <Crayon id={id}>
      <path d="M34 30 L42 42 M86 30 L78 42" />
      <path d="M38 40 Q60 30 82 40 Q94 70 82 96 Q60 104 38 96 Q26 70 38 40 Z" />
      <circle cx="50" cy="54" r="9" />
      <circle cx="70" cy="54" r="9" />
      <circle cx="50" cy="55" r="2.4" />
      <circle cx="70" cy="55" r="2.4" />
      <path d="M57 62 L60 68 L63 62" />
      <path d="M46 76 Q60 86 74 76 Q72 92 60 94 Q48 92 46 76 Z" fill={H(id)} />
      <path d="M44 100 L42 108 M52 102 L52 108 M68 102 L68 108 M76 100 L78 108" />
      <path d="M82 70 L106 46 L110 50 L86 74 Z" />
      <path d="M106 46 L110 42 L112 46" />
    </Crayon>
  );
}

export const ANIMALS: Record<SparkKey, () => ReactNode> = {
  born: Stork,
  tiny: Mouse,
  funny: Monkey,
  when_small: Elephants,
  own: Owl,
};

function ParkSlide() {
  const id = "wif-outing";
  return (
    <Crayon id={id}>
      <circle cx="92" cy="24" r="10" fill={H(id)} />
      <path d="M92 8 L92 12 M108 24 L104 24 M104 12 L100 16 M80 12 L84 16" />
      <path d="M26 96 L26 42 L44 42" />
      <path d="M26 56 L38 56 M26 70 L38 70 M26 84 L38 84" />
      <path d="M44 42 Q64 46 78 74 Q88 92 102 94" />
      <path d="M40 48 Q58 52 72 78 Q82 96 98 98" />
      <path d="M16 98 Q60 94 108 98" />
    </Crayon>
  );
}

function SpeechBubble() {
  const id = "wif-said";
  return (
    <Crayon id={id}>
      <path d="M22 30 Q22 18 60 18 Q98 18 98 48 Q98 76 62 76 L42 76 L26 92 L30 74 Q22 68 22 48 Z" fill={H(id)} />
      <circle cx="48" cy="44" r="2.2" />
      <circle cx="72" cy="44" r="2.2" />
      <path d="M46 56 Q60 66 74 56" />
    </Crayon>
  );
}

function FirstStar() {
  const id = "wif-first";
  return (
    <Crayon id={id}>
      <path d="M60 18 L70 44 L98 46 L76 64 L83 92 L60 76 L37 92 L44 64 L22 46 L50 44 Z" fill={H(id)} />
      <path d="M22 24 L28 30 M98 22 L92 28 M60 100 L60 108" />
    </Crayon>
  );
}

function KeepsakeHeart() {
  const id = "wif-other";
  return (
    <Crayon id={id}>
      <path d="M60 92 Q24 68 24 44 Q24 26 42 26 Q54 26 60 38 Q66 26 78 26 Q96 26 96 44 Q96 68 60 92 Z" fill={H(id)} />
      <path d="M84 82 L104 62 L108 66 L88 86 Z" />
    </Crayon>
  );
}

export const WIF_SKETCHES: Record<WifSparkKey, () => ReactNode> = {
  outing: ParkSlide,
  said: SpeechBubble,
  first: FirstStar,
  other: KeepsakeHeart,
};
