import { useRef, useState } from "react";
import { Crosshair, Settings, Minus, X } from "lucide-react";

const LEFT = ["Enable Hook", "Aimbot Visible", "Silent Aim", "Drag Aimbot", "Ignore Knock", "No Recoil", "Sniper Scope", "AimFov"];
const RIGHT = ["Esp Line", "Esp CornerBox", "Esp Skeleton", "Esp Info", "Esp Rgb", "Esp Tracker", "Esp Rank", "ESP Weapon", "Invalid Timer", "Esp Fix"];

// The panel is built as a solid block: the printed face sits on top of a stack of
// thin slabs that run back in Z, so tilting reveals a lit edge instead of a flat card.
const DEPTH_LAYERS = 24;
const DEPTH_STEP = 1.6;

function slabColor(i: number) {
  const t = i / (DEPTH_LAYERS - 1);
  const g = Math.round(52 - t * 42); // #343434 at the face, #0a0a0a at the back
  const h = g.toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}

function Box({ on }: { on: boolean }) {
  return (
    <span
      className={`grid h-[15px] w-[15px] shrink-0 place-items-center rounded-[3px] border transition-colors ${
        on ? "border-[#ff1a1a] bg-[#ff1a1a]" : "border-[#5a5a5a] bg-[#1b1b1b]"
      }`}
    >
      {on && <span className="h-[6px] w-[6px] rounded-[1px] bg-white" />}
    </span>
  );
}

function KeyBtn() {
  return (
    <span className="ml-2 rounded-[3px] border border-[#4a4a4a] bg-[#2a2a2a] px-2 py-[1px] text-[9px] font-bold text-white">Key</span>
  );
}

function Check({ label, on, toggle, keyBtn }: { label: string; on: boolean; toggle: () => void; keyBtn?: boolean }) {
  return (
    <div className="flex h-[18px] items-center">
      <button type="button" onClick={toggle} className="flex items-center gap-2 text-[10.5px] font-bold text-[#e8e8e8] hover:text-white">
        <Box on={on} />
        {label}
      </button>
      {keyBtn && <KeyBtn />}
    </div>
  );
}

function Bar({ value, max, onChange, h = 9 }: { value: number; max: number; onChange: (v: number) => void; h?: number }) {
  const p = (value / max) * 100;
  return (
    <div className="relative w-full rounded-[3px] bg-[#3a3a3a]" style={{ height: h }}>
      <div className="absolute inset-y-0 left-0 rounded-[3px] bg-[#ff0000]" style={{ width: `${p}%` }} />
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

export function CheatPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 35 });
  const [state, setState] = useState<Record<string, boolean>>({});
  const [fov, setFov] = useState(1010);
  const [thr, setThr] = useState(15);
  const [dist, setDist] = useState(25);
  const [tab, setTab] = useState(0);

  const toggle = (k: string) => setState((s) => ({ ...s, [k]: !s[k] }));

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (py - 0.5) * -12, y: (px - 0.5) * 16, gx: px * 100, gy: py * 100 });
  };

  const rest = () => setTilt({ x: 0, y: 0, gx: 50, gy: 35 });

  return (
    <div className="pointer-events-auto relative" style={{ perspective: "1150px" }}>
      {/* Cast shadow that drifts opposite the tilt */}
      <div
        aria-hidden
        className="absolute inset-x-4 -bottom-8 h-10 rounded-[50%] bg-black/75 blur-2xl"
        style={{ transform: `translate(${tilt.y * -1.8}px, ${tilt.x * 1.4}px) translateZ(-70px)` }}
      />

      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={rest}
        className="relative w-[330px] select-none transition-transform duration-200 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateZ(24px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          willChange: "transform",
          fontFamily: "Segoe UI, Arial, sans-serif",
        }}
      >
        {/* Body of the block: stacked slabs, all strictly behind the printed face */}
        {Array.from({ length: DEPTH_LAYERS }).map((_, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute inset-0 rounded-[6px]"
            style={{
              transform: `translateZ(${-DEPTH_STEP * (i + 1)}px)`,
              background: slabColor(i),
              boxShadow: i === DEPTH_LAYERS - 1 ? "0 0 0 1px rgba(0,0,0,0.9)" : undefined,
            }}
          />
        ))}

        {/* Printed face */}
        <div
          className="relative rounded-[6px] bg-[#141414]"
          style={{
            transformStyle: "preserve-3d",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {/* Title bar */}
          <div
            className="flex h-[30px] items-center justify-between px-2"
            style={{ transform: "translateZ(9px)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black italic leading-[0.8] text-[#ff1a1a] [text-shadow:1px_1px_0_#fff]">
                JASSU<br />CHEATS
              </span>
              <span className="text-[12px] tracking-wide text-white"><span className="text-[#ff2a2a]">JASSU</span> CHEATS</span>
            </div>
            <div className="flex gap-[2px]">
              {[Crosshair, Settings].map((I, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTab(i)}
                  className={`grid h-[22px] w-[26px] place-items-center rounded-[3px] ${tab === i ? "bg-[#ff0000]" : "bg-[#262626]"} text-white`}
                >
                  <I className="h-3 w-3" strokeWidth={3} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Minus className="h-3 w-3 text-white/80" />
              <X className="h-3 w-3 text-[#ff2a2a]" />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1fr] gap-[6px] px-[5px]" style={{ transformStyle: "preserve-3d" }}>
            <div
              className="flex flex-col gap-[5px] rounded-[3px] bg-[#1c1c1c] px-2 py-2"
              style={{ transform: "translateZ(14px)", boxShadow: "0 12px 20px -8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              {LEFT.map((l) => (
                <Check key={l} label={l} on={!!state[l]} toggle={() => toggle(l)} keyBtn={l === "Aimbot Visible"} />
              ))}
              <div className="mt-1 text-[8.5px] text-[#ddd]">AimFov</div>
              <div className="flex items-center gap-2">
                <Bar value={fov} max={1300} onChange={setFov} h={10} />
                <span className="text-[9px] font-bold text-white">{fov}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="text-[8px] text-[#ddd]">Drag Threshold</div>
                  <Bar value={thr} max={100} onChange={setThr} />
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] text-[#ddd]">Drag Distance</div>
                  <Bar value={dist} max={100} onChange={setDist} />
                </div>
              </div>
            </div>
            <div
              className="flex flex-col gap-[5px] rounded-[3px] bg-[#1c1c1c] px-2 py-2"
              style={{ transform: "translateZ(14px)", boxShadow: "0 12px 20px -8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              {RIGHT.map((l) => (
                <Check key={l} label={l} on={!!state[l]} toggle={() => toggle(l)} keyBtn={l === "Esp Fix"} />
              ))}
              <div className="flex h-[18px] items-center gap-2 text-[10.5px] font-bold text-[#e8e8e8]">
                <button type="button" onClick={() => toggle("Nick Name")}><Box on={!!state["Nick Name"]} /></button>
                Nick Name
                <span className="flex-1 overflow-hidden whitespace-nowrap rounded-[3px] border border-[#3a3a3a] bg-[#222] px-1 py-[1px] text-[8px]">JASSU CHEATS</span>
              </div>
            </div>
          </div>

          <div
            className="flex justify-between px-2 py-[5px] text-[8.5px] font-bold"
            style={{ transform: "translateZ(6px)" }}
          >
            <span className="text-[#ffd400]">Esp Fix Auto Refresh Disabled</span>
            <span className="text-white">User: C E O</span>
          </div>

          {/* Moving sheen + faint brand rim light */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[6px]"
            style={{
              transform: "translateZ(20px)",
              background: `radial-gradient(220px 150px at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.16), transparent 68%), linear-gradient(to top, rgba(255,26,26,0.1), transparent 34%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
