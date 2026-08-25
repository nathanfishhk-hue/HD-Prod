import { motion } from 'framer-motion';

// 10 stick-figure templates - lightweight, offline, no video needed
type AnimKey =
  | 'press' | 'fly' | 'pullover' | 'row' | 'pulldown' | 'deadlift'
  | 'leg-ext' | 'leg-press' | 'leg-curl' | 'calf'
  | 'shoulder-press' | 'lateral' | 'rear-fly' | 'curl' | 'pushdown' | 'extension' | 'crunch' | 'raise' | 'dip' | 'squat' | 'shrug';

export function getAnimationKeyForExercise(name: string, fallback: string = 'press'): AnimKey {
  const n = name.toLowerCase();
  if (n.includes('fly') || n.includes('crossover')) return 'fly';
  if (n.includes('pullover')) return 'pullover';
  if (n.includes('row')) return 'row';
  if (n.includes('pulldown') || n.includes('pull-up') || n.includes('chin')) return 'pulldown';
  if (n.includes('deadlift') || n.includes('rack pull') || n.includes('back extension')) return 'deadlift';
  if (n.includes('leg extension')) return 'leg-ext';
  if (n.includes('leg press') || n.includes('hack') || n.includes('smith squat') || n.includes('goblet')) return 'leg-press';
  if (n.includes('leg curl')) return 'leg-curl';
  if (n.includes('calf')) return 'calf';
  if (n.includes('shoulder press') || n.includes('military') || n.includes('arnold')) return 'shoulder-press';
  if (n.includes('lateral raise') || n.includes('cable lateral')) return 'lateral';
  if (n.includes('rear delt') || n.includes('bent-over') || n.includes('face pull')) return 'rear-fly';
  if (n.includes('curl') && !n.includes('leg curl')) return 'curl';
  if (n.includes('pushdown')) return 'pushdown';
  if (n.includes('extension') && n.includes('tricep')) return 'extension';
  if (n.includes('crunch')) return 'crunch';
  if (n.includes('knee raise') || n.includes('leg raise')) return 'raise';
  if (n.includes('dip')) return 'dip';
  if (n.includes('squat')) return 'squat';
  if (n.includes('shrug') || n.includes('upright row')) return 'shrug';
  return fallback as AnimKey;
}

export const ExerciseAnimation: React.FC<{ animKey: string; size?: number; loopMs?: number }> = ({ animKey, size = 180, loopMs = 2800 }) => {
  const k = (animKey || 'press') as AnimKey;
  // common 8s tempo hint = 3/1/4 but we loop faster for demo (2.8s)
  const cycle = loopMs / 1000;

  // Stick figure base: bench/platform hint + figure
  // All animations use same SVG skeleton but drive different joints
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 200 160" className="rounded-lg bg-zinc-900 border border-zinc-800">
        {/* platform / bench hint */}
        <rect x="10" y="115" width="180" height="6" rx="3" fill="#27272a" />
        {k === 'leg-ext' && <rect x="30" y="85" width="100" height="14" rx="6" fill="#27272a" />}
        {k === 'leg-press' && <rect x="100" y="40" width="6" height="80" rx="3" fill="#27272a" />}
        {/* figure group */}
        <g>
          {/* head */}
          <circle cx="100" cy="38" r="14" fill="none" stroke="#e4e4e7" strokeWidth="3" />
          {/* torso */}
          <line x1="100" y1="52" x2="100" y2="98" stroke="#e4e4e7" strokeWidth="4" strokeLinecap="round" />
          {/* Anim specific limbs */}
          {k === 'press' && <PressArms cycle={cycle} />}
          {k === 'fly' && <FlyArms cycle={cycle} />}
          {k === 'pullover' && <PulloverArms cycle={cycle} />}
          {k === 'row' && <RowArms cycle={cycle} />}
          {k === 'pulldown' && <PulldownArms cycle={cycle} />}
          {k === 'deadlift' && <DeadliftBody cycle={cycle} />}
          {k === 'leg-ext' && <LegExt cycle={cycle} />}
          {k === 'leg-press' && <LegPress cycle={cycle} />}
          {k === 'leg-curl' && <LegCurl cycle={cycle} />}
          {k === 'calf' && <CalfRaise cycle={cycle} />}
          {k === 'shoulder-press' && <ShoulderPress cycle={cycle} />}
          {k === 'lateral' && <LateralArms cycle={cycle} />}
          {k === 'rear-fly' && <RearFly cycle={cycle} />}
          {k === 'curl' && <CurlArm cycle={cycle} />}
          {k === 'pushdown' && <PushdownArm cycle={cycle} />}
          {k === 'extension' && <ExtensionArms cycle={cycle} />}
          {k === 'crunch' && <CrunchBody cycle={cycle} />}
          {k === 'raise' && <HangingRaise cycle={cycle} />}
          {k === 'dip' && <DipArms cycle={cycle} />}
          {k === 'squat' && <SquatBody cycle={cycle} />}
          {k === 'shrug' && <ShrugBody cycle={cycle} />}
        </g>
        {/* weight hint */}
        <rect x="92" y="108" width="16" height="4" rx="2" fill="#dc2626" opacity="0.9" />
      </svg>
      <span className="text-[10px] font-mono-code text-zinc-500 mt-1.5 tracking-wider">{k.toUpperCase()} • 3/1/4 TEMPO LOOP</span>
    </div>
  );
};

// --- sub components ---
const PressArms: React.FC<{ cycle: number }> = ({ cycle }) => (
  <>
    <motion.g animate={{ rotate: [-15, 25, -15] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "100px", originY: "62px" }}>
      <line x1="100" y1="62" x2="62" y2="78" stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
      <line x1="62" y1="78" x2="62" y2="98" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
    </motion.g>
    <motion.g animate={{ rotate: [15, -25, 15] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "100px", originY: "62px" }}>
      <line x1="100" y1="62" x2="138" y2="78" stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
      <line x1="138" y1="78" x2="138" y2="98" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
    </motion.g>
    <line x1="56" y1="96" x2="144" y2="96" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
  </>
);
const FlyArms: React.FC<{ cycle: number }> = ({ cycle }) => (
  <>
    <motion.g animate={{ rotate: [-55, -10, -55] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "100px", originY: "62px" }}>
      <line x1="100" y1="62" x2="58" y2="75" stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <motion.g animate={{ rotate: [55, 10, 55] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "100px", originY: "62px" }}>
      <line x1="100" y1="62" x2="142" y2="75" stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
  </>
);
const PulloverArms: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ rotate: [-70, 20, -70] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "100px", originY: "62px" }}>
    <line x1="100" y1="62" x2="100" y2="18" stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
  </motion.g>
);
const RowArms: React.FC<{ cycle: number }> = ({ cycle }) => (
  <>
    <motion.line x1="100" y1="98" x2="100" y2="115" animate={{ y2: [95, 108, 95] } as any} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} stroke="#e4e4e7" strokeWidth="4" />
    <motion.g animate={{ x: [0, -12, 0] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }}>
      <line x1="92" y1="68" x2="72" y2="85" stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
    <motion.g animate={{ x: [0, 12, 0] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }}>
      <line x1="108" y1="68" x2="128" y2="85" stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
  </>
);
const PulldownArms: React.FC<{ cycle: number }> = ({ cycle }) => (
  <>
    <line x1="60" y1="22" x2="140" y2="22" stroke="#52525b" strokeWidth="3" />
    <motion.line x1="62" y1="22" x2="86" y2="62" animate={{ y2: [62, 78, 62] } as any} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
    <motion.line x1="138" y1="22" x2="114" y2="62" animate={{ y2: [62, 78, 62] } as any} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
  </>
);
const DeadliftBody: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ rotate: [18, 0, 18] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "100px", originY: "98px" }}>
    <line x1="100" y1="52" x2="100" y2="98" stroke="#e4e4e7" strokeWidth="4" />
    <line x1="100" y1="68" x2="82" y2="105" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
    <line x1="100" y1="68" x2="118" y2="105" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
    <line x1="100" y1="98" x2="80" y2="125" stroke="#e4e4e7" strokeWidth="4" />
    <line x1="100" y1="98" x2="120" y2="125" stroke="#e4e4e7" strokeWidth="4" />
    <rect x="76" y="105" width="48" height="4" rx="2" fill="#dc2626" />
  </motion.g>
);
const LegExt: React.FC<{ cycle: number }> = ({ cycle }) => (
  <>
    <line x1="88" y1="98" x2="70" y2="119" stroke="#e4e4e7" strokeWidth="5" />
    <motion.g animate={{ rotate: [75, 0, 75] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "70px", originY: "119px" }}>
      <line x1="70" y1="119" x2="108" y2="119" stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
      <circle cx="108" cy="119" r="5" fill="#dc2626" />
    </motion.g>
  </>
);
const LegPress: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ x: [0, 18, 0] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }}>
    <line x1="100" y1="98" x2="78" y2="118" stroke="#e4e4e7" strokeWidth="5" />
    <line x1="78" y1="118" x2="104" y2="118" stroke="#f87171" strokeWidth="5" />
    <rect x="104" y="108" width="6" height="20" rx="2" fill="#dc2626" />
  </motion.g>
);
const LegCurl: React.FC<{ cycle: number }> = ({ cycle }) => (
  <>
    <line x1="100" y1="98" x2="68" y2="98" stroke="#e4e4e7" strokeWidth="5" />
    <motion.g animate={{ rotate: [0, 85, 0] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "68px", originY: "98px" }}>
      <line x1="68" y1="98" x2="68" y2="125" stroke="#f87171" strokeWidth="5" />
    </motion.g>
  </>
);
const CalfRaise: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ y: [0, -10, 0] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }}>
    <line x1="100" y1="52" x2="100" y2="98" stroke="#e4e4e7" strokeWidth="4" />
    <line x1="92" y1="98" x2="92" y2="126" stroke="#f87171" strokeWidth="5" />
    <line x1="108" y1="98" x2="108" y2="126" stroke="#f87171" strokeWidth="5" />
    <ellipse cx="100" cy="130" rx="28" ry="3" fill="#52525b" />
  </motion.g>
);
const ShoulderPress: React.FC<{ cycle: number }> = ({ cycle }) => (
  <>
    <motion.line x1="100" y1="62" x2="68" y2="48" animate={{ y2: [48, 22, 48] } as any} transition={{ duration: cycle, repeat: Infinity }} stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
    <motion.line x1="100" y1="62" x2="132" y2="48" animate={{ y2: [48, 22, 48] } as any} transition={{ duration: cycle, repeat: Infinity }} stroke="#f87171" strokeWidth="5" strokeLinecap="round" />
    <line x1="62" y1="22" x2="138" y2="22" stroke="#dc2626" strokeWidth="4" />
  </>
);
const LateralArms: React.FC<{ cycle: number }> = ({ cycle }) => (
  <>
    <motion.g animate={{ rotate: [0, 65, 0] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "100px", originY: "62px" }}>
      <line x1="100" y1="62" x2="66" y2="62" stroke="#f87171" strokeWidth="5" />
    </motion.g>
    <motion.g animate={{ rotate: [0, -65, 0] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "100px", originY: "62px" }}>
      <line x1="100" y1="62" x2="134" y2="62" stroke="#f87171" strokeWidth="5" />
    </motion.g>
  </>
);
const RearFly: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ rotate: [20, 0, 20] }} transition={{ duration: cycle, repeat: Infinity }} style={{ originX: "100px", originY: "58px" }}>
    <line x1="100" y1="58" x2="62" y2="82" stroke="#f87171" strokeWidth="5" />
    <line x1="100" y1="58" x2="138" y2="82" stroke="#f87171" strokeWidth="5" />
  </motion.g>
);
const CurlArm: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ rotate: [0, -95, 0] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "78px", originY: "82px" }}>
    <line x1="100" y1="62" x2="78" y2="82" stroke="#f87171" strokeWidth="5" />
    <line x1="78" y1="82" x2="78" y2="112" stroke="#f87171" strokeWidth="4" />
    <circle cx="78" cy="116" r="4" fill="#dc2626" />
  </motion.g>
);
const PushdownArm: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ rotate: [0, 65, 0] }} transition={{ duration: cycle, repeat: Infinity }} style={{ originX: "84px", originY: "64px" }}>
    <line x1="100" y1="62" x2="84" y2="64" stroke="#e4e4e7" strokeWidth="4" />
    <line x1="84" y1="64" x2="84" y2="94" stroke="#f87171" strokeWidth="4" />
  </motion.g>
);
const ExtensionArms: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ rotate: [-35, 25, -35] }} transition={{ duration: cycle, repeat: Infinity }} style={{ originX: "100px", originY: "52px" }}>
    <line x1="100" y1="52" x2="92" y2="82" stroke="#f87171" strokeWidth="5" />
    <line x1="92" y1="82" x2="96" y2="112" stroke="#f87171" strokeWidth="4" />
  </motion.g>
);
const CrunchBody: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ rotate: [0, 22, 0] }} transition={{ duration: cycle, repeat: Infinity }} style={{ originX: "100px", originY: "98px" }}>
    <line x1="100" y1="52" x2="100" y2="98" stroke="#e4e4e7" strokeWidth="4" />
    <circle cx="100" cy="38" r="14" fill="none" stroke="#e4e4e7" strokeWidth="3" />
  </motion.g>
);
const HangingRaise: React.FC<{ cycle: number }> = ({ cycle }) => (
  <>
    <line x1="70" y1="18" x2="130" y2="18" stroke="#52525b" strokeWidth="3" />
    <line x1="92" y1="18" x2="92" y2="52" stroke="#e4e4e7" strokeWidth="2" />
    <line x1="108" y1="18" x2="108" y2="52" stroke="#e4e4e7" strokeWidth="2" />
    <motion.g animate={{ rotate: [0, 62, 0] }} transition={{ duration: cycle, repeat: Infinity }} style={{ originX: "100px", originY: "98px" }}>
      <line x1="100" y1="98" x2="100" y2="126" stroke="#f87171" strokeWidth="5" />
    </motion.g>
  </>
);
const DipArms: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ y: [0, 14, 0] }} transition={{ duration: cycle, repeat: Infinity }}>
    <line x1="76" y1="42" x2="76" y2="68" stroke="#52525b" strokeWidth="3" />
    <line x1="124" y1="42" x2="124" y2="68" stroke="#52525b" strokeWidth="3" />
    <line x1="100" y1="52" x2="76" y2="68" stroke="#f87171" strokeWidth="4" />
    <line x1="100" y1="52" x2="124" y2="68" stroke="#f87171" strokeWidth="4" />
  </motion.g>
);
const SquatBody: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ y: [0, 18, 0] }} transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }}>
    <line x1="100" y1="52" x2="100" y2="98" stroke="#e4e4e7" strokeWidth="4" />
    <line x1="100" y1="98" x2="78" y2="126" stroke="#f87171" strokeWidth="5" />
    <line x1="100" y1="98" x2="122" y2="126" stroke="#f87171" strokeWidth="5" />
    <line x1="82" y1="62" x2="118" y2="62" stroke="#dc2626" strokeWidth="4" />
  </motion.g>
);
const ShrugBody: React.FC<{ cycle: number }> = ({ cycle }) => (
  <motion.g animate={{ y: [0, -7, 0] }} transition={{ duration: cycle, repeat: Infinity }}>
    <line x1="84" y1="62" x2="76" y2="98" stroke="#f87171" strokeWidth="4" />
    <line x1="116" y1="62" x2="124" y2="98" stroke="#f87171" strokeWidth="4" />
    <rect x="70" y="96" width="16" height="4" rx="2" fill="#dc2626" />
    <rect x="114" y="96" width="16" height="4" rx="2" fill="#dc2626" />
  </motion.g>
);
