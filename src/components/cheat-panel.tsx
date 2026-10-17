import { useRef, useState } from "react";
import { Crosshair, Settings, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LEFT = ["Enable Hook", "Aimbot Visible", "Silent Aim", "Drag Aimbot", "Ignore Knock", "No Recoil", "Sniper Scope", "AimFov"];
const RIGHT = ["Esp Line", "Esp CornerBox", "Esp Skeleton", "Esp Info", "Esp Rgb", "Esp Tracker", "Esp Rank", "ESP Weapon", "Invalid Timer", "Esp Fix"];

function Box({ on }: { on: boolean }) {
  return (
    <span
      className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[4px] border transition-all duration-200 ${
        on ? "border-ember bg-ember shadow-ember" : "border-site-foreground/15 bg-site-foreground/[0.03]"
      }`}
    >
      {on && <span className="h-1.5 w-1.5 rounded-[1px] bg-site-foreground" />}
    </span>
  );
}

function KeyBtn() {
  return (
    <span className="ml-auto rounded-full border border-site-foreground/10 bg-site-foreground/5 px-2 py-px text-[9px] font-medium text-site-foreground/70">Key</span>
  );
}

function Check({ label, on, toggle, keyBtn }: { label: string; on: boolean; toggle: () => void; keyBtn?: boolean }) {
  return (
    <div className="flex min-w-0 min-h-7 items-center md:min-h-6">
      <Button
        type="button"
        variant="ghost"
        aria-pressed={on}
        onClick={toggle}
        className={`h-auto min-w-0 justify-start gap-2 rounded-none p-0 text-xs hover:bg-transparent transition-colors ${on ? "text-site-foreground" : "text-site-foreground/60 hover:text-site-foreground/90"}`}
      >
        <Box on={on} />
        <span className="min-w-0 text-left">{label}</span>
      </Button>
      {keyBtn && <KeyBtn />}
    </div>
  );
}

function Bar({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  const p = (value / max) * 100;
  return (
    <div className="relative h-1.5 w-full rounded-full bg-site-foreground/10">
      <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ember/60 to-ember" style={{ width: `${p}%` }} />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-site-foreground/40 bg-site-foreground shadow-ember"
        style={{ left: `${p}%` }}
      />
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute -inset-y-2 inset-x-0 w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

export function CheatPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 30 });
  const [state, setState] = useState<Record<string, boolean>>({ "Enable Hook": true, "Esp Line": true, "No Recoil": true });
  const [fov, setFov] = useState(1010);
  const [thr, setThr] = useState(15);
  const [dist, setDist] = useState(25);
  const [tab, setTab] = useState(0);

  const toggle = (k: string) => setState((s) => ({ ...s, [k]: !s[k] }));

  const onMove = (e: React.PointerEvent) => {
    if (!ref.current || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (py - 0.5) * -6, y: (px - 0.5) * 8, gx: px * 100, gy: py * 100 });
  };
  const rest = () => setTilt({ x: 0, y: 0, gx: 50, gy: 30 });

  return (
    <div className="panel-preview pointer-events-auto relative w-full max-w-[460px]" style={{ perspective: "1200px" }}>
      {/* Soft red glow behind the glass so it sits inside the beams */}
      <div aria-hidden className="absolute -inset-10 rounded-full bg-ember/20 blur-3xl" />

      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={rest}
        className="panel-glass relative w-full select-none overflow-hidden rounded-2xl border border-site-foreground/10 bg-site-foreground/[0.04] shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        {/* Title bar */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-site-foreground/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ember shadow-ember" />
            <span className="text-sm font-semibold text-site-foreground">
              Jassu <span className="text-site-foreground/50">Cheats</span>
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-site-foreground/10 bg-site-foreground/5 p-0.5">
            {[Crosshair, Settings].map((I, i) => (
              <Button
                key={i}
                type="button"
                variant="ghost"
                aria-label={i === 0 ? "Aim" : "Settings"}
                aria-pressed={tab === i}
                onClick={() => setTab(i)}
                className={`grid h-8 w-8 shrink-0 place-items-center p-0 rounded-full transition-colors ${
                  tab === i ? "bg-site-foreground text-site-background" : "text-site-foreground/60 hover:text-site-foreground"
                }`}
              >
                <I className="h-3 w-3" strokeWidth={2.5} />
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-site-foreground/40">
            <Minus className="h-3.5 w-3.5" />
            <X className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="panel-columns grid grid-cols-2 gap-2 p-2 sm:gap-3 sm:p-3">
          <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-site-foreground/5 bg-site-foreground/[0.03] p-2 sm:p-3">
            <div className="mb-1 text-[9px] font-medium uppercase tracking-widest text-site-foreground/40">Aim</div>
            {LEFT.map((l) => (
              <Check key={l} label={l} on={!!state[l]} toggle={() => toggle(l)} keyBtn={l === "Aimbot Visible"} />
            ))}
            <div className="mt-2 flex justify-between text-[9px] text-site-foreground/50">
              <span>AimFov</span>
              <span className="text-site-foreground">{fov}</span>
            </div>
            <Bar value={fov} max={1300} onChange={setFov} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <div className="text-[8px] text-site-foreground/50">Threshold</div>
                <Bar value={thr} max={100} onChange={setThr} />
              </div>
              <div className="space-y-1.5">
                <div className="text-[8px] text-site-foreground/50">Distance</div>
                <Bar value={dist} max={100} onChange={setDist} />
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-site-foreground/5 bg-site-foreground/[0.03] p-2 sm:p-3">
            <div className="mb-1 text-[9px] font-medium uppercase tracking-widest text-site-foreground/40">Visuals</div>
            {RIGHT.map((l) => (
              <Check key={l} label={l} on={!!state[l]} toggle={() => toggle(l)} keyBtn={l === "Esp Fix"} />
            ))}
            <div className="mt-1 flex min-w-0 min-h-7 items-center gap-2 text-[11px] text-site-foreground/60">
              <Button variant="ghost" aria-label="Nick name" aria-pressed={!!state["Nick Name"]} className="h-auto shrink-0 p-0 hover:bg-transparent" type="button" onClick={() => toggle("Nick Name")}>
                <Box on={!!state["Nick Name"]} />
              </Button>
              Nick
              <span className="min-w-0 flex-1 truncate rounded-full border border-site-foreground/10 bg-site-foreground/5 px-2 py-px text-[8px] text-site-foreground/70">JASSU CHEATS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-site-foreground/10 px-4 py-2 text-[9px]">
          <span className="flex items-center gap-1.5 text-site-foreground/50">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
            Auto refresh off
          </span>
          <span className="text-site-foreground/50">
            User: <span className="text-site-foreground">CEO</span>
          </span>
        </div>

        {/* Moving sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(260px 180px at ${tilt.gx}% ${tilt.gy}%, var(--panel-sheen), transparent 70%)` }}
        />
      </div>
    </div>
  );
}
