import { useId } from "react";
import { swatch } from "@/lib/swatches";

type ArtProps = {
  imageKey: string;
  colors: string[];
  label: string;
};

type Paint = {
  fill: string;
  accent: string;
  uid: string;
};

const ink = "var(--color-ink)";

export function SquishyArt({ imageKey, colors, label }: ArtProps) {
  const fill = swatch(colors[0]);
  const accent = swatch(colors[1] ?? colors[0]);
  const uid = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <title>{label}</title>
      <rect width="200" height="200" fill="var(--color-studio)" />
      <circle cx="100" cy="112" r="74" fill={fill} opacity="0.16" />
      <ellipse cx="100" cy="174" rx="50" ry="8" fill={ink} opacity="0.12" />
      <Shape imageKey={imageKey} fill={fill} accent={accent} uid={uid} />
    </svg>
  );
}

function Shape({ imageKey, fill, accent, uid }: Paint & { imageKey: string }) {
  switch (imageKey) {
    case "cube":
      return <Cube fill={fill} accent={accent} x={54} y={54} size={92} />;
    case "cube-swirl":
      return <Cube fill={fill} accent={accent} x={54} y={54} size={92} swirl uid={uid} />;
    case "cube-glow":
      return <Cube fill={fill} accent={accent} x={54} y={54} size={92} glow />;
    case "berg":
      return <Cube fill={fill} accent={accent} x={36} y={40} size={128} glassy />;
    case "ice-baby":
      return <Cube fill={fill} accent={accent} x={68} y={66} size={64} glassy />;
    case "glob":
      return <Glob fill={fill} accent={accent} scale={1} />;
    case "glob-jumbo":
      return <Glob fill={fill} accent={accent} scale={1.18} />;
    case "gumdrop":
      return <Gumdrop fill={fill} accent={accent} />;
    case "drop":
      return <Drop fill={fill} accent={accent} />;
    case "drop-glow":
      return <Drop fill={fill} accent={accent} glow />;
    case "fruit-mix":
      return <FruitMix fill={fill} accent={accent} />;
    case "panic-pete":
      return <PanicPete fill={fill} />;
    case "gummy-bear":
      return <Bear fill={fill} accent={accent} glossy />;
    case "gummy-foam":
      return <Bear fill={fill} accent={accent} />;
    case "fuzz-ball":
      return <Fuzz fill={fill} accent={accent} />;
    case "fuzz-flower":
      return <FuzzFlower fill={fill} accent={accent} />;
    case "cheese-wedge":
      return <CheeseWedge fill={fill} />;
    case "cheese-slice":
      return <CheeseSlice fill={fill} />;
    case "cheese-block":
      return <CheeseBlock fill={fill} />;
    case "butter":
      return <Butter fill={fill} accent={accent} wide={false} />;
    case "butter-jumbo":
      return <Butter fill={fill} accent={accent} wide />;
    case "bread":
      return <Bread fill={fill} accent={accent} />;
    case "bread-butter":
      return <BreadButter fill={fill} accent={accent} />;
    case "mochi":
      return <Mochi fill={fill} accent={accent} />;
    case "dumpling":
      return <Dumpling fill={fill} glitter={false} />;
    case "dumpling-glitter":
      return <Dumpling fill={fill} glitter />;
    case "mystery-dumpling":
      return <MysteryBox fill={fill} accent={accent} kind="dumpling" />;
    case "avocado":
      return <Avocado fill={fill} />;
    case "egg":
      return <Egg fill={fill} accent={accent} />;
    case "strawberry":
      return <Strawberry fill={fill} />;
    case "cake":
      return <Cake fill={fill} accent={accent} />;
    case "maltose":
      return <Cube fill={fill} accent={accent} x={54} y={58} size={92} drip />;
    case "jelly":
      return <Cube fill={fill} accent={accent} x={54} y={54} size={92} glassy bubbles />;
    case "cloud":
      return <Cloud fill={fill} accent={accent} />;
    case "pizza":
      return <Pizza fill={fill} accent={accent} />;
    case "donut":
      return <Donut fill={fill} accent={accent} />;
    case "ice-cream":
      return <IceCream fill={fill} accent={accent} />;
    case "burger":
      return <Burger fill={fill} accent={accent} />;
    case "watermelon":
      return <Watermelon fill={fill} />;
    case "peach":
      return <Peach fill={fill} />;
    case "croissant":
      return <Croissant fill={fill} />;
    case "bao":
      return <Bao fill={fill} />;
    case "onigiri":
      return <Onigiri fill={fill} />;
    case "cat":
      return <Cat fill={fill} accent={accent} />;
    case "frog":
      return <Frog fill={fill} />;
    case "chick":
      return <Chick fill={fill} accent={accent} />;
    case "stress-ball":
      return <Sphere fill={fill} cx={100} cy={104} r={52} seam />;
    case "water-bead":
      return <WaterBead fill={fill} accent={accent} />;
    case "mystery-mochi":
      return <MysteryBox fill={fill} accent={accent} kind="mochi" />;
    case "macaron":
      return <Macaron fill={fill} accent={accent} />;
    case "toast":
      return <Toast fill={fill} accent={accent} />;
    case "candy-corn":
      return <CandyCorn />;
    case "whale":
      return <Whale fill={fill} accent={accent} />;
    case "mesh":
      return <Mesh fill={fill} accent={accent} />;
    default:
      return <Placeholder fill={fill} label={imageKey} />;
  }
}

function Cube({
  fill,
  accent,
  x,
  y,
  size,
  swirl,
  glow,
  glassy,
  drip,
  bubbles,
  uid = "cube",
}: {
  fill: string;
  accent: string;
  x: number;
  y: number;
  size: number;
  swirl?: boolean;
  glow?: boolean;
  glassy?: boolean;
  drip?: boolean;
  bubbles?: boolean;
  uid?: string;
}) {
  const r = Math.max(16, size * 0.28);
  return (
    <g>
      {glow ? (
        <rect
          x={x - 8}
          y={y - 8}
          width={size + 16}
          height={size + 16}
          rx={r + 6}
          fill={accent}
          opacity="0.55"
        />
      ) : null}
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        rx={r}
        fill={fill}
        opacity={glassy ? 0.78 : 1}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      {swirl ? (
        <>
          <clipPath id={uid}>
            <rect x={x} y={y} width={size} height={size} rx={r} />
          </clipPath>
          <g clipPath={`url(#${uid})`}>
            <path
              d={`M${x - 8} ${y + size * 0.35} C ${x + size * 0.2} ${y + 8}, ${x + size * 0.55} ${y + size * 0.55}, ${x + size + 12} ${y + size * 0.22}`}
              fill="none"
              stroke={accent}
              strokeWidth={size * 0.18}
              strokeLinecap="round"
            />
            <path
              d={`M${x - 8} ${y + size * 0.62} C ${x + size * 0.3} ${y + size * 0.4}, ${x + size * 0.6} ${y + size * 0.85}, ${x + size + 8} ${y + size * 0.5}`}
              fill="none"
              stroke="white"
              strokeOpacity="0.85"
              strokeWidth={size * 0.1}
              strokeLinecap="round"
            />
          </g>
        </>
      ) : null}
      <rect
        x={x + size * 0.14}
        y={y + size * 0.12}
        width={size * 0.42}
        height={size * 0.24}
        rx={r * 0.4}
        fill="white"
        opacity={glassy ? 0.62 : 0.4}
      />
      {drip ? (
        <path
          d={`M${x + size * 0.62} ${y + size * 0.2} c8 14 6 24-2 32 c-4 4-2 8 2 8 c8 0 14-12 10-28 c-2-8-6-14-10-12z`}
          fill={accent}
          opacity="0.9"
        />
      ) : null}
      {bubbles ? (
        <g fill="white" opacity="0.7">
          <circle cx={x + size * 0.7} cy={y + size * 0.62} r={size * 0.08} />
          <circle cx={x + size * 0.58} cy={y + size * 0.74} r={size * 0.045} />
          <circle cx={x + size * 0.32} cy={y + size * 0.68} r={size * 0.06} />
        </g>
      ) : null}
    </g>
  );
}

function Glob({ fill, accent, scale }: { fill: string; accent: string; scale: number }) {
  return (
    <g transform={`translate(100 108) scale(${scale}) translate(-100 -108)`}>
      <path
        d="M62 118c-8-22 4-48 28-54 8-22 36-28 52-12 18-6 40 8 40 28 16 8 22 32 10 48-4 20-22 34-42 34-10 14-36 16-50 4-16 2-34-10-38-28-8-4-12-12 0-20z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <ellipse cx="86" cy="92" rx="18" ry="12" fill="white" opacity="0.4" />
      <circle cx="132" cy="96" r="7" fill={accent} />
      <circle cx="78" cy="126" r="5" fill={accent} opacity="0.8" />
    </g>
  );
}

function Gumdrop({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <path
        d="M68 132c0-36 12-78 32-78s32 42 32 78c0 16-14 28-32 28s-32-12-32-28z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <ellipse cx="90" cy="78" rx="12" ry="16" fill="white" opacity="0.4" />
      <g fill={accent}>
        <circle cx="86" cy="108" r="3.5" />
        <circle cx="104" cy="96" r="3" />
        <circle cx="112" cy="120" r="3.2" />
        <circle cx="94" cy="132" r="2.6" />
      </g>
    </g>
  );
}

function Drop({ fill, accent, glow }: { fill: string; accent: string; glow?: boolean }) {
  return (
    <g>
      {glow ? <ellipse cx="100" cy="112" rx="62" ry="70" fill={accent} opacity="0.35" /> : null}
      <path
        d="M100 40c18 28 40 58 40 84a40 40 0 0 1-80 0c0-26 22-56 40-84z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <ellipse cx="86" cy="96" rx="12" ry="20" fill="white" opacity="0.45" />
      <circle cx="118" cy="124" r="5" fill={accent} opacity="0.8" />
    </g>
  );
}

function FruitMix({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <circle cx="70" cy="118" r="28" fill={accent} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <ellipse cx="70" cy="108" rx="8" ry="5" fill="white" opacity="0.4" />
      <g>
        <path
          d="M118 78c-14 10-22 28-18 46 16 6 36 0 44-16 6-18-8-38-26-30z"
          fill={fill}
          stroke={ink}
          strokeOpacity="0.14"
          strokeWidth="2"
        />
        <path d="M124 70l-6 16 12-2z" fill="var(--color-swatch-leaf)" />
      </g>
      <circle cx="124" cy="136" r="22" fill="var(--color-swatch-grape)" stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <ellipse cx="118" cy="128" rx="6" ry="4" fill="white" opacity="0.35" />
    </g>
  );
}

function PanicPete({ fill }: { fill: string }) {
  return (
    <g>
      <circle cx="78" cy="78" r="16" fill="white" stroke={ink} strokeWidth="2" />
      <circle cx="122" cy="78" r="16" fill="white" stroke={ink} strokeWidth="2" />
      <circle cx="78" cy="80" r="6" fill={ink} />
      <circle cx="122" cy="80" r="6" fill={ink} />
      <rect x="52" y="86" width="96" height="78" rx="36" fill={fill} stroke={ink} strokeOpacity="0.16" strokeWidth="2" />
      <path d="M78 124h44a8 8 0 0 1 0 16H86c-8 0-12-6-8-16z" fill="var(--color-swatch-berry)" />
      <path d="M70 108c10 8 50 8 60 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Bear({ fill, accent, glossy }: { fill: string; accent: string; glossy?: boolean }) {
  return (
    <g>
      <circle cx="74" cy="70" r="16" fill={fill} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <circle cx="126" cy="70" r="16" fill={fill} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <ellipse cx="74" cy="150" rx="16" ry="18" fill={fill} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <ellipse cx="126" cy="150" rx="16" ry="18" fill={fill} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <ellipse cx="58" cy="116" rx="14" ry="18" fill={fill} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <ellipse cx="142" cy="116" rx="14" ry="18" fill={fill} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <ellipse cx="100" cy="112" rx="40" ry="46" fill={fill} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <ellipse cx="100" cy="124" rx="22" ry="18" fill={accent} opacity="0.85" />
      <circle cx="88" cy="104" r="4" fill={ink} />
      <circle cx="112" cy="104" r="4" fill={ink} />
      <ellipse cx="100" cy="114" rx="5" ry="3.5" fill={ink} opacity="0.7" />
      {glossy ? <ellipse cx="84" cy="88" rx="10" ry="14" fill="white" opacity="0.45" /> : null}
    </g>
  );
}

function Fuzz({ fill, accent }: { fill: string; accent: string }) {
  const bumps = Array.from({ length: 14 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 14;
    return { cx: 100 + Math.cos(angle) * 48, cy: 108 + Math.sin(angle) * 48 };
  });
  return (
    <g>
      {bumps.map((bump) => (
        <circle key={`${bump.cx}-${bump.cy}`} cx={bump.cx} cy={bump.cy} r="12" fill={fill} />
      ))}
      <circle cx="100" cy="108" r="40" fill={fill} stroke={ink} strokeOpacity="0.1" strokeWidth="2" />
      <ellipse cx="86" cy="96" rx="12" ry="8" fill="white" opacity="0.35" />
      <circle cx="118" cy="112" r="6" fill={accent} />
    </g>
  );
}

function FuzzFlower({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="100"
          cy="70"
          rx="18"
          ry="28"
          fill={fill}
          transform={`rotate(${deg} 100 108)`}
          stroke={ink}
          strokeOpacity="0.08"
        />
      ))}
      <circle cx="100" cy="108" r="24" fill={accent} />
      <circle cx="100" cy="108" r="10" fill="white" opacity="0.35" />
    </g>
  );
}

function CheeseWedge({ fill }: { fill: string }) {
  return (
    <g>
      <path
        d="M46 146c0 8 10 14 22 14h78c14 0 22-10 16-22L122 62c-6-14-18-16-26-4L52 128c-4 6-6 12-6 18z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <ellipse cx="78" cy="92" rx="16" ry="8" fill="white" opacity="0.35" />
      <circle cx="96" cy="112" r="9" fill={ink} opacity="0.18" />
      <circle cx="124" cy="128" r="7" fill={ink} opacity="0.18" />
      <circle cx="108" cy="146" r="5" fill={ink} opacity="0.16" />
    </g>
  );
}

function CheeseSlice({ fill }: { fill: string }) {
  return (
    <g>
      <rect
        x="36"
        y="68"
        width="128"
        height="72"
        rx="18"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <rect x="48" y="78" width="46" height="16" rx="8" fill="white" opacity="0.35" />
      <circle cx="78" cy="112" r="10" fill={ink} opacity="0.18" />
      <circle cx="112" cy="100" r="8" fill={ink} opacity="0.18" />
      <circle cx="136" cy="120" r="7" fill={ink} opacity="0.16" />
    </g>
  );
}

function CheeseBlock({ fill }: { fill: string }) {
  return (
    <g>
      <Cube fill={fill} accent={fill} x={48} y={52} size={104} />
      <circle cx="86" cy="96" r="8" fill={ink} opacity="0.16" />
      <circle cx="118" cy="112" r="10" fill={ink} opacity="0.16" />
      <circle cx="100" cy="132" r="6" fill={ink} opacity="0.14" />
    </g>
  );
}

function Butter({ fill, accent, wide }: { fill: string; accent: string; wide: boolean }) {
  const x = wide ? 28 : 46;
  const w = wide ? 144 : 108;
  return (
    <g>
      <rect
        x={x}
        y="78"
        width={w}
        height="58"
        rx="16"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <rect x={x + 8} y="88" width={w * 0.28} height="14" rx="7" fill="white" opacity="0.4" />
      {[0.3, 0.45, 0.6, 0.75].map((t) => (
        <path
          key={t}
          d={`M${x + w * t} 84 v46`}
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
    </g>
  );
}

function Bread({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <path
        d="M40 128c0-36 24-62 60-62s60 26 60 62v20c0 10-10 16-22 16H62c-12 0-22-6-22-16z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <path
        d="M70 96c6 16 4 28-2 36M100 88c4 18 2 32-4 42M128 98c-2 14-2 26-8 34"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="78" cy="92" rx="16" ry="8" fill="white" opacity="0.28" />
    </g>
  );
}

function BreadButter({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <g transform="translate(-18 8) scale(0.72)">
        <Bread fill={fill} accent={accent} />
      </g>
      <g transform="translate(78 18) scale(0.62)">
        <Butter fill={accent} accent={fill} wide={false} />
      </g>
    </g>
  );
}

function Mochi({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <rect
        x="52"
        y="62"
        width="96"
        height="92"
        rx="42"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <ellipse cx="84" cy="86" rx="14" ry="8" fill="white" opacity="0.4" />
      <circle cx="86" cy="108" r="3.5" fill={ink} />
      <circle cx="114" cy="108" r="3.5" fill={ink} />
      <path d="M90 122c8 8 16 8 24 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <circle cx="70" cy="78" r="3" fill={accent} opacity="0.7" />
      <circle cx="132" cy="90" r="2.5" fill={accent} opacity="0.7" />
    </g>
  );
}

function Dumpling({ fill, glitter }: { fill: string; glitter: boolean }) {
  return (
    <g>
      <path
        d="M36 112c8-36 36-52 64-52s56 16 64 52c-20 28-40 40-64 40s-44-12-64-40z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <path
        d="M52 104c8 10 14 10 20 0M78 98c8 12 16 12 24 0M110 100c8 12 14 12 22 0M136 106c6 8 12 8 16 0"
        fill="none"
        stroke={ink}
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="78" cy="90" rx="14" ry="8" fill="white" opacity="0.35" />
      {glitter ? (
        <g fill="white">
          <Spark x={112} y={88} />
          <Spark x={132} y={112} s={3} />
          <Spark x={96} y={120} s={3.5} />
        </g>
      ) : null}
    </g>
  );
}

function Spark({ x, y, s = 5 }: { x: number; y: number; s?: number }) {
  return (
    <polygon
      points={`${x},${y - s} ${x + s * 0.28},${y - s * 0.28} ${x + s},${y} ${x + s * 0.28},${y + s * 0.28} ${x},${y + s} ${x - s * 0.28},${y + s * 0.28} ${x - s},${y} ${x - s * 0.28},${y - s * 0.28}`}
    />
  );
}

function MysteryBox({
  fill,
  accent,
  kind,
}: {
  fill: string;
  accent: string;
  kind: "dumpling" | "mochi";
}) {
  return (
    <g>
      <rect x="48" y="78" width="104" height="78" rx="12" fill={accent} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      <path d="M48 96h104" stroke={ink} strokeOpacity="0.15" />
      <path d="M70 78c8-22 52-22 60 0" fill={fill} stroke={ink} strokeOpacity="0.14" strokeWidth="2" />
      {kind === "dumpling" ? (
        <path d="M78 70c6-16 38-16 44 0" fill="white" opacity="0.35" />
      ) : (
        <circle cx="100" cy="66" r="14" fill={fill} />
      )}
      <text
        x="100"
        y="132"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="36"
        fontWeight="700"
        fill={ink}
      >
        ?
      </text>
    </g>
  );
}

function Avocado({ fill }: { fill: string }) {
  return (
    <g>
      <path
        d="M100 40c28 8 48 40 44 78-4 32-24 52-44 52s-40-20-44-52C52 80 72 48 100 40z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <circle cx="100" cy="118" r="22" fill="var(--color-swatch-cocoa)" />
      <circle cx="94" cy="112" r="6" fill="white" opacity="0.25" />
      <path d="M108 48c10 6 16 2 22-8-12 0-18 2-22 8z" fill="var(--color-swatch-leaf)" />
    </g>
  );
}

function Egg({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <path
        d="M46 112c0-10 8-18 14-28 8 10 18 14 28 10 2-16 14-24 26-18 12 4 20 8 28 20 8 8 16 16 14 28-4 22-22 36-48 36s-58-10-62-48z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <circle cx="108" cy="112" r="22" fill={accent} stroke={ink} strokeOpacity="0.1" strokeWidth="2" />
      <ellipse cx="100" cy="104" rx="7" ry="4" fill="white" opacity="0.45" />
    </g>
  );
}

function Strawberry({ fill }: { fill: string }) {
  return (
    <g>
      <path
        d="M100 58c-22 8-40 36-36 70 4 28 20 40 36 40s32-12 36-40c4-34-14-62-36-70z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <path d="M100 52c-8 10-22 12-34 6 12-2 20-10 22-20 2 8 8 14 12 14z" fill="var(--color-swatch-leaf)" />
      <path d="M100 46c6 8 8 12 6 20 8-2 16-2 26-8-10 0-18-4-22-12-2 0-6 0-10 0z" fill="var(--color-swatch-leaf)" />
      <g fill="var(--color-swatch-yolk)" opacity="0.85">
        <ellipse cx="86" cy="100" rx="3" ry="4" transform="rotate(-20 86 100)" />
        <ellipse cx="108" cy="92" rx="3" ry="4" transform="rotate(15 108 92)" />
        <ellipse cx="112" cy="118" rx="3" ry="4" />
        <ellipse cx="90" cy="128" rx="3" ry="4" transform="rotate(20 90 128)" />
        <ellipse cx="124" cy="136" rx="3" ry="4" />
      </g>
      <ellipse cx="84" cy="86" rx="8" ry="12" fill="white" opacity="0.28" />
    </g>
  );
}

function Cake({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <rect x="48" y="108" width="104" height="42" rx="12" fill={accent} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <rect x="58" y="78" width="84" height="36" rx="12" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <path
        d="M70 78c4 10 4 10 10 0s6 10 12 0 6 10 12 0 6 10 12 0 6 10 12 0 4 10 10 0"
        fill={accent}
      />
      <circle cx="100" cy="68" r="6" fill="var(--color-swatch-berry)" />
    </g>
  );
}

function Cloud({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <circle cx="78" cy="112" r="28" fill={fill} />
      <circle cx="112" cy="100" r="34" fill={fill} />
      <circle cx="140" cy="116" r="24" fill={fill} />
      <rect x="70" y="112" width="80" height="28" fill={fill} />
      <ellipse cx="104" cy="96" rx="16" ry="10" fill="white" opacity="0.55" />
      <circle cx="126" cy="112" r="5" fill={accent} opacity="0.7" />
    </g>
  );
}

function Pizza({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <path
        d="M48 58c36 8 78 28 100 92-40 10-86-6-112-40 4-20 6-38 12-52z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <path d="M56 70c32 8 70 28 88 74" fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" />
      <circle cx="96" cy="100" r="8" fill="var(--color-swatch-berry)" />
      <circle cx="118" cy="124" r="7" fill="var(--color-swatch-berry)" />
      <circle cx="84" cy="128" r="6" fill="var(--color-swatch-berry)" />
    </g>
  );
}

function Donut({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <circle cx="100" cy="108" r="52" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="100" cy="108" r="34" fill={accent} />
      <circle cx="100" cy="108" r="16" fill="var(--color-studio)" />
      <g>
        <rect x="78" y="70" width="6" height="10" rx="2" fill="var(--color-swatch-berry)" transform="rotate(-20 81 75)" />
        <rect x="112" y="74" width="6" height="10" rx="2" fill="var(--color-swatch-leaf)" transform="rotate(18 115 79)" />
        <rect x="124" y="104" width="6" height="10" rx="2" fill="var(--color-swatch-yolk)" />
        <rect x="70" y="112" width="6" height="10" rx="2" fill="var(--color-swatch-sky)" />
      </g>
    </g>
  );
}

function IceCream({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <path d="M78 120h44l-22 48z" fill="var(--color-swatch-toast)" stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <path d="M84 120l8 16 8-16 8 16 8-16" fill="none" stroke={ink} strokeOpacity="0.25" />
      <circle cx="100" cy="104" r="28" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="100" cy="78" r="22" fill={accent} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <ellipse cx="90" cy="72" rx="6" ry="4" fill="white" opacity="0.4" />
    </g>
  );
}

function Burger({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <path
        d="M52 96c0-22 20-36 48-36s48 14 48 36z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <rect x="50" y="98" width="100" height="12" rx="4" fill="var(--color-swatch-leaf)" />
      <rect x="50" y="112" width="100" height="16" rx="6" fill={accent} />
      <path d="M50 132c6 16 22 24 50 24s44-8 50-24z" fill="var(--color-swatch-toast)" />
      <circle cx="78" cy="84" r="3" fill={ink} opacity="0.35" />
      <circle cx="96" cy="78" r="3" fill={ink} opacity="0.35" />
      <circle cx="116" cy="86" r="3" fill={ink} opacity="0.35" />
    </g>
  );
}

function Watermelon({ fill }: { fill: string }) {
  return (
    <g>
      <path
        d="M36 92c18-36 110-36 128 0-10 48-36 70-64 70S46 140 36 92z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <path d="M44 96c16-28 96-28 112 0" fill="none" stroke="var(--color-swatch-leaf)" strokeWidth="12" strokeLinecap="round" />
      <path d="M48 100c14-24 90-24 104 0" fill="none" stroke="var(--color-swatch-cream)" strokeWidth="5" />
      <g fill={ink} opacity="0.55">
        <ellipse cx="78" cy="120" rx="3" ry="5" transform="rotate(-20 78 120)" />
        <ellipse cx="100" cy="132" rx="3" ry="5" />
        <ellipse cx="124" cy="118" rx="3" ry="5" transform="rotate(18 124 118)" />
      </g>
    </g>
  );
}

function Peach({ fill }: { fill: string }) {
  return (
    <g>
      <circle cx="100" cy="114" r="46" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <path d="M100 78c8 16 8 36 0 56c-8-20-8-40 0-56z" fill={ink} opacity="0.08" />
      <path d="M104 70c8-16 20-18 28-12-12 2-20 8-24 16-2-2-4-4-4-4z" fill="var(--color-swatch-leaf)" />
      <ellipse cx="84" cy="100" rx="10" ry="8" fill="white" opacity="0.3" />
    </g>
  );
}

function Croissant({ fill }: { fill: string }) {
  return (
    <g>
      <path
        d="M36 120c20-48 70-62 112-40 10 6 18 16 16 28-28 4-52 16-70 36-18-6-40-10-58-24z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <path
        d="M58 112c18-20 48-26 78-16M70 122c16-12 40-14 62-6"
        fill="none"
        stroke={ink}
        strokeOpacity="0.25"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function Bao({ fill }: { fill: string }) {
  return (
    <g>
      <ellipse cx="100" cy="124" rx="52" ry="36" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <path
        d="M100 70c22 8 36 28 36 48H64c0-20 14-40 36-48z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <path
        d="M100 78c6 10 6 16 0 26c-6-10-6-16 0-26z"
        fill="none"
        stroke={ink}
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <path d="M86 96c6 6 8 8 14 6M114 96c-6 6-8 8-14 6" fill="none" stroke={ink} strokeOpacity="0.25" strokeWidth="2" />
    </g>
  );
}

function Onigiri({ fill }: { fill: string }) {
  return (
    <g>
      <path
        d="M100 46l58 96c4 8-2 16-12 16H54c-10 0-16-8-12-16z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <path d="M58 112h84v22H58z" fill="var(--color-swatch-nori)" />
      <ellipse cx="86" cy="86" rx="10" ry="6" fill="white" opacity="0.28" />
    </g>
  );
}

function Cat({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <path d="M62 96l-6-36 28 18z" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <path d="M138 96l6-36-28 18z" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="100" cy="116" r="46" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <ellipse cx="84" cy="98" rx="10" ry="6" fill="white" opacity="0.35" />
      <circle cx="84" cy="112" r="4" fill={ink} />
      <circle cx="116" cy="112" r="4" fill={ink} />
      <path d="M96 122h8l-4 6z" fill={accent} />
      <path d="M70 120h16M114 120h16" stroke={ink} strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Frog({ fill }: { fill: string }) {
  return (
    <g>
      <ellipse cx="100" cy="126" rx="58" ry="40" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="74" cy="86" r="20" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="126" cy="86" r="20" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="74" cy="86" r="8" fill={ink} />
      <circle cx="126" cy="86" r="8" fill={ink} />
      <circle cx="76" cy="84" r="3" fill="white" />
      <circle cx="128" cy="84" r="3" fill="white" />
      <path d="M90 124c8 10 16 10 24 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Chick({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <circle cx="100" cy="112" r="48" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <ellipse cx="82" cy="96" rx="12" ry="8" fill="white" opacity="0.4" />
      <circle cx="86" cy="106" r="4" fill={ink} />
      <circle cx="114" cy="106" r="4" fill={ink} />
      <path d="M96 118h14l-7 10z" fill={accent} />
      <ellipse cx="62" cy="124" rx="12" ry="8" fill={fill} stroke={ink} strokeOpacity="0.12" />
    </g>
  );
}

function Sphere({
  fill,
  cx,
  cy,
  r,
  seam,
}: {
  fill: string;
  cx: number;
  cy: number;
  r: number;
  seam?: boolean;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <ellipse cx={cx - r * 0.28} cy={cy - r * 0.28} rx={r * 0.28} ry={r * 0.18} fill="white" opacity="0.4" />
      {seam ? (
        <path
          d={`M${cx - r + 6} ${cy}c${r * 0.4} 16 ${r * 1.1} 16 ${r * 1.6} 0`}
          fill="none"
          stroke={ink}
          strokeOpacity="0.2"
          strokeWidth="2"
        />
      ) : null}
    </g>
  );
}

function WaterBead({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <circle cx="100" cy="108" r="54" fill={fill} opacity="0.45" stroke={ink} strokeOpacity="0.15" strokeWidth="2" />
      <circle cx="82" cy="100" r="10" fill={accent} />
      <circle cx="108" cy="92" r="8" fill="var(--color-swatch-sky)" />
      <circle cx="116" cy="118" r="11" fill="var(--color-swatch-blush)" />
      <circle cx="90" cy="124" r="7" fill="var(--color-swatch-yolk)" />
      <circle cx="124" cy="100" r="6" fill="var(--color-swatch-mint)" />
      <ellipse cx="84" cy="88" rx="12" ry="8" fill="white" opacity="0.45" />
    </g>
  );
}

function Macaron({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <ellipse cx="100" cy="92" rx="52" ry="28" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <rect x="52" y="100" width="96" height="16" fill={accent} />
      <ellipse cx="100" cy="124" rx="52" ry="26" fill={fill} stroke={ink} strokeOpacity="0.12" strokeWidth="2" />
      <ellipse cx="80" cy="84" rx="12" ry="6" fill="white" opacity="0.35" />
    </g>
  );
}

function Toast({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <rect
        x="52"
        y="48"
        width="96"
        height="108"
        rx="22"
        fill={accent}
        stroke={ink}
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <rect x="64" y="60" width="72" height="84" rx="16" fill={fill} />
      <path d="M118 48c8 16 22 20 30 16-8 18-28 20-36 4z" fill={accent} />
    </g>
  );
}

function CandyCorn() {
  return (
    <g>
      <path
        d="M100 42l62 104c4 8-2 16-12 16H50c-10 0-16-8-12-16z"
        fill="var(--color-swatch-cream)"
        stroke={ink}
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <path d="M58 118h84l12 28c2 6-2 12-10 12H56c-8 0-12-6-10-12z" fill="var(--color-swatch-coral)" />
      <path d="M74 86h52l10 32H64z" fill="var(--color-swatch-yolk)" />
    </g>
  );
}

function Whale({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <path
        d="M36 112c8-32 40-48 74-40 20 4 36 6 52 20 6 18-8 36-28 40-10 16-30 18-44 8-28 6-52-4-54-28z"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <path d="M150 96c18-8 24 6 16 16-10 2-16-2-16-16z" fill={fill} />
      <circle cx="78" cy="104" r="4" fill={ink} />
      <path d="M96 78c4-16 8-20 8-28" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <circle cx="108" cy="46" r="4" fill={accent} />
    </g>
  );
}

function Mesh({ fill, accent }: { fill: string; accent: string }) {
  return (
    <g>
      <circle cx="100" cy="108" r="54" fill={fill} opacity="0.35" stroke={ink} strokeOpacity="0.2" strokeWidth="2" />
      <g stroke={ink} strokeOpacity="0.28" fill="none">
        <path d="M60 80h80M56 108h88M64 136h72" />
        <path d="M78 62v92M100 58v100M124 62v92" />
      </g>
      <circle cx="88" cy="100" r="8" fill={accent} />
      <circle cx="112" cy="118" r="7" fill="var(--color-swatch-sky)" />
      <circle cx="104" cy="90" r="5" fill="var(--color-swatch-yolk)" />
    </g>
  );
}

function Placeholder({ fill, label }: { fill: string; label: string }) {
  const short = label.replace(/-/g, " ").slice(0, 18);
  return (
    <g>
      <rect
        x="40"
        y="48"
        width="120"
        height="104"
        rx="36"
        fill={fill}
        stroke={ink}
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <text
        x="100"
        y="108"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="16"
        fontWeight="600"
        fill={ink}
      >
        {short}
      </text>
    </g>
  );
}
