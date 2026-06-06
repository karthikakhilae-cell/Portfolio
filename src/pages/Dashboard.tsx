import { motion } from "motion/react";
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  CircleDollarSign,
  Cpu,
  Database,
  Gauge,
  GitBranch,
  LineChart,
  Network,
  ShieldCheck,
  TimerReset,
  TrendingUp,
  Zap,
} from "lucide-react";

const executiveKpis = [
  { label: "ML Models Built", value: "18+", trend: "+4 this yr", note: "deployed", icon: Brain },
  { label: "Avg Accuracy", value: "94.2%", trend: "+2.1%", note: "classification avg", icon: Gauge },
  { label: "Query Speedup", value: "65%", trend: "+12%", note: "optimization gain", icon: Zap },
  { label: "Data Freshness", value: "< 1h", trend: "live", note: "pipeline latency", icon: Database },
  { label: "Projects Shipped", value: "20+", trend: "+6 this yr", note: "case studies", icon: TrendingUp },
  { label: "Automation Cover", value: "87%", trend: "+9%", note: "pipeline tasks", icon: ShieldCheck },
];

const sCurvePoints = {
  pv: "M28 234 C78 218, 110 190, 146 158 C190 118, 238 88, 314 72 C380 58, 438 54, 520 48",
  ev: "M28 238 C82 226, 116 207, 154 178 C202 142, 240 117, 306 102 C368 88, 430 80, 520 76",
  ac: "M28 240 C76 230, 108 214, 148 190 C198 158, 248 132, 316 116 C384 102, 438 92, 520 84",
};

const techProficiency = [
  { label: "Python", plan: 95, actual: 92 },
  { label: "Power BI / DAX", plan: 90, actual: 88 },
  { label: "SQL / DB Arch", plan: 88, actual: 85 },
  { label: "ML / AI", plan: 85, actual: 82 },
  { label: "MS Fabric", plan: 80, actual: 78 },
];

const milestones = [
  { label: "Fabric Lakehouse", date: "Q1 2025", state: "done" },
  { label: "P6 AI Audit", date: "Q2 2025", state: "done" },
  { label: "IsoMTO Tool", date: "Q3 2025", state: "active" },
  { label: "DS Dashboard", date: "Q4 2025", state: "watch" },
  { label: "LLM Pipeline", date: "Q1 2026", state: "risk" },
];

const workstreams = [
  { label: "Microsoft Fabric ingestion", value: 94, color: "bg-[#267365]" },
  { label: "ML model automation", value: 87, color: "bg-[#314E52]" },
  { label: "Power BI semantic layer", value: 82, color: "bg-[#D9A441]" },
  { label: "SQL query optimisation", value: 74, color: "bg-[#C06C54]" },
];

const varianceBands = [
  { label: "Python", value: 92, delta: "+4.2%", color: "#267365" },
  { label: "ML / AI", value: 84, delta: "+8.6%", color: "#314E52" },
  { label: "SQL", value: 80, delta: "+1.9%", color: "#D9A441" },
  { label: "BI / Viz", value: 76, delta: "+3.1%", color: "#C06C54" },
];

const earnedValuePulse = [
  { label: "Projects", value: "20+", percent: 86, color: "bg-[#314E52]" },
  { label: "Models", value: "18+", percent: 74, color: "bg-[#267365]" },
  { label: "Datasets", value: "30+", percent: 68, color: "bg-[#C06C54]" },
];

const reconciliation = [
  { label: "Planned", value: "24 projects", width: 92, color: "bg-[#314E52]" },
  { label: "Completed", value: "20 projects", width: 84, color: "bg-[#267365]" },
  { label: "In Progress", value: "4 projects", width: 22, color: "bg-[#C06C54]" },
  { label: "Forecast", value: "28 by EOY", width: 100, color: "bg-[#D9A441]" },
];

const githubActivity = [38, 52, 44, 68, 74, 86, 92, 78, 110, 104, 128, 116];
const modelPerf = [72, 78, 76, 84, 82, 88, 86, 90, 88, 92, 94, 94];
const commandStats = [
  ["Portfolio", "20 active projects"],
  ["Refresh", "Real-time"],
  ["Confidence", "High"],
  ["Outlook", "Q4 active"],
];

function SparkBars({ values, color = "bg-accent" }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-24 items-end gap-2 rounded-lg bg-bg/70 p-3 ring-1 ring-line/10">
      {values.map((value, index) => (
        <motion.div
          key={`${value}-${index}`}
          initial={{ height: 0 }}
          whileInView={{ height: `${(value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: index * 0.03 }}
          className={`min-h-2 flex-1 rounded-t-sm ${color}`}
        />
      ))}
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className={`rounded-lg border border-white/70 bg-white/88 shadow-[0_24px_80px_rgba(26,26,26,0.08)] ring-1 ring-line/10 backdrop-blur-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <main className="pt-24 md:pt-32 pb-16 min-h-screen bg-[#F4F0E8]">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(26,26,26,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(26,26,26,0.045)_1px,transparent_1px)] [background-size:72px_72px]" />

      {/* Hero */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-24 pb-10">
        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-8 md:gap-12 items-end">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/80 px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-bold text-accent shadow-sm ring-1 ring-line/10">
                Data Science Portfolio
              </span>
              <span className="rounded-full bg-[#172120] px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-bold text-white/70 shadow-sm">
                Live analytics view
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display leading-[0.88] tracking-tight mb-8">
              Data science <span className="text-accent">intelligence</span> control room.
            </h1>
            <p className="max-w-2xl text-muted leading-relaxed font-light">
              ML performance, tech proficiency, pipeline throughput, and project delivery visuals for decision-ready reporting.
              Built as a portfolio analytics layer for Python, Microsoft Fabric, SQL, Power BI, and AI automation work.
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              {commandStats.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/70 p-4 ring-1 ring-line/10 backdrop-blur">
                  <div className="text-[9px] uppercase tracking-widest font-bold text-muted/50">{label}</div>
                  <div className="mt-2 text-sm font-bold text-ink/80">{value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <Panel className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line/10 bg-[#172120] px-5 py-4 text-white">
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] font-bold text-white/40">Capability Stack</div>
                <div className="mt-1 text-lg font-display">KPI cockpit</div>
              </div>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C06C54]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#D9A441]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#267365]" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 md:p-6">
              {executiveKpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="rounded-lg border border-line/10 bg-[#F8F6F1] p-4 transition-colors hover:bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-muted/60">{kpi.label}</span>
                      <span className="rounded-md bg-white p-2 ring-1 ring-line/10">
                        <Icon className="w-4 h-4 text-accent shrink-0" />
                      </span>
                    </div>
                    <div className="mt-5 text-3xl font-display leading-none">{kpi.value}</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold text-[#267365]">{kpi.trend}</span>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-muted/45 text-right">{kpi.note}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </section>

      {/* Project Delivery + Skill Proficiency */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-24 py-8">
        <div className="grid xl:grid-cols-2 gap-5 md:gap-6 items-stretch">
          <Panel className="h-full overflow-hidden p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-2">Project Delivery</div>
                <h2 className="text-3xl md:text-[2.35rem] font-display leading-tight">Planned vs shipped</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-bold text-muted/60">
                <span className="flex items-center gap-2 rounded-full bg-bg px-3 py-2"><span className="w-3 h-3 rounded-full bg-[#314E52]" /> Planned</span>
                <span className="flex items-center gap-2 rounded-full bg-bg px-3 py-2"><span className="w-3 h-3 rounded-full bg-[#267365]" /> Delivered</span>
                <span className="flex items-center gap-2 rounded-full bg-bg px-3 py-2"><span className="w-3 h-3 rounded-full bg-[#C06C54]" /> In progress</span>
              </div>
            </div>

            <div className="rounded-lg bg-[#F8F6F1] p-4 ring-1 ring-line/10">
              <svg viewBox="0 0 560 260" className="w-full h-auto" role="img" aria-label="Project delivery S-curve chart">
                {[52, 100, 148, 196, 244].map((y) => (
                  <path key={y} d={`M28 ${y}H528`} stroke="rgba(26,26,26,0.08)" strokeWidth="1" />
                ))}
                {[92, 172, 252, 332, 412, 492].map((x) => (
                  <path key={x} d={`M${x} 34V252`} stroke="rgba(26,26,26,0.05)" strokeWidth="1" />
                ))}
                <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1 }} d={sCurvePoints.pv} fill="none" stroke="#314E52" strokeWidth="5" strokeLinecap="round" />
                <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.15 }} d={sCurvePoints.ev} fill="none" stroke="#267365" strokeWidth="5" strokeLinecap="round" />
                <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.3 }} d={sCurvePoints.ac} fill="none" stroke="#C06C54" strokeWidth="5" strokeLinecap="round" />
                <path d={`${sCurvePoints.ev} L520 252 L28 252Z`} fill="rgba(38,115,101,0.08)" />
                <text x="30" y="252" className="fill-muted text-[10px] uppercase tracking-widest">Jan</text>
                <text x="250" y="252" className="fill-muted text-[10px] uppercase tracking-widest">Jun</text>
                <text x="500" y="252" className="fill-muted text-[10px] uppercase tracking-widest">Dec</text>
              </svg>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
              <div className="rounded-lg bg-[#F8F6F1] p-4 ring-1 ring-line/10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-accent">
                      Portfolio Delivery Pulse
                    </div>
                    <div className="mt-1 text-xs text-muted/70">
                      Projects, models, and datasets against targets
                    </div>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink/60 ring-1 ring-line/10">
                    2025
                  </div>
                </div>
                <div className="space-y-4">
                  {earnedValuePulse.map((item) => (
                    <div key={item.label} className="grid grid-cols-[64px_1fr_72px] items-center gap-3">
                      <div className="text-xs font-bold uppercase tracking-widest text-muted">{item.label}</div>
                      <div className="h-3 rounded-full bg-white ring-1 ring-line/10">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.75 }}
                          className={`h-full rounded-full ${item.color}`}
                        />
                      </div>
                      <div className="text-right text-xs font-bold text-ink/70">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#172120] p-4 text-white ring-1 ring-line/10">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-[#F0C76A]">Accuracy</div>
                  <div className="mt-3 text-3xl font-display">94%</div>
                  <div className="mt-2 text-[10px] uppercase tracking-widest font-bold text-white/60">ml avg</div>
                </div>
                <div className="rounded-lg bg-white p-4 ring-1 ring-line/10">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-accent">F1</div>
                  <div className="mt-3 text-3xl font-display">0.91</div>
                  <div className="mt-2 text-[10px] uppercase tracking-widest font-bold text-muted/50">score avg</div>
                </div>
                <div className="col-span-2 rounded-lg bg-white p-4 ring-1 ring-line/10">
                  <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-muted/55">
                    <span>Project milestone trail</span>
                    <span>5 gates</span>
                  </div>
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 bg-line" />
                    {["P1", "P2", "P3", "P4", "P5"].map((gate, index) => (
                      <div
                        key={gate}
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold ${
                          index < 3 ? "bg-[#267365] text-white" : index === 3 ? "bg-[#D9A441] text-ink" : "bg-bg text-muted ring-1 ring-line"
                        }`}
                      >
                        {gate}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-white p-4 ring-1 ring-line/10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-accent">
                    Portfolio Progress Breakdown
                  </div>
                  <div className="mt-1 text-xs text-muted/70">
                    Planned, completed, in-progress, and forecast positions
                  </div>
                </div>
                <div className="rounded-full bg-bg px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted ring-1 ring-line/10">
                  Delta view
                </div>
              </div>
              <div className="space-y-3">
                {reconciliation.map((item, index) => (
                  <div key={item.label} className="grid grid-cols-[92px_1fr_100px] items-center gap-3">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted/60">{item.label}</div>
                    <div className="h-8 rounded-md bg-bg p-1 ring-1 ring-line/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.width}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: index * 0.06 }}
                        className={`h-full rounded ${item.color}`}
                      />
                    </div>
                    <div className="text-right text-xs font-bold text-ink/70">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="h-full overflow-hidden border-[#314E52] bg-[#0B1211] p-5 text-white md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#F0C76A] mb-2">Skill Engine</div>
                <h2 className="text-3xl font-display text-white">Proficiency status</h2>
              </div>
              <Activity className="w-5 h-5 text-[#D9A441]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-2 gap-3 mb-5">
              {[
                ["Python", "Expert"],
                ["Power BI", "Advanced"],
                ["ML / AI", "Advanced"],
                ["MS Fabric", "Advanced"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#3F5550] bg-[#172120] p-4 shadow-inner">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-[#F0C76A]">{label}</div>
                  <div className="text-xl 2xl:text-2xl font-display mt-3 text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-[#3F5550] bg-[#172120] p-4 shadow-inner">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[12px] uppercase tracking-[0.25em] font-bold text-[#F0C76A]">
                    Portfolio Readiness Index
                  </div>
                  <div className="mt-2 text-sm leading-relaxed text-white">
                    Tech coverage, model maturity, and project delivery in one control view.
                  </div>
                </div>
                <div className="rounded-full bg-[#F0C76A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0B1211]">
                  87 avg
                </div>
              </div>

              <div className="grid gap-4 min-[1400px]:grid-cols-[0.74fr_1.26fr]">
                <div className="rounded-lg bg-[#0B1211] p-4 ring-1 ring-[#3F5550]">
                  <div className="relative mx-auto h-36 w-36 min-[1400px]:h-40 min-[1400px]:w-40">
                    <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label="Readiness radial gauge">
                      <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
                      <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(192,108,84,0.55)" strokeWidth="16" strokeDasharray="56 389" />
                      <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(217,164,65,0.85)" strokeWidth="16" strokeDasharray="80 389" strokeDashoffset="-56" />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="62"
                        fill="none"
                        stroke="#267365"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray="170 389"
                        strokeDashoffset="-136"
                        initial={{ strokeDasharray: "0 389" }}
                        whileInView={{ strokeDasharray: "170 389" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <div className="text-4xl font-display leading-none text-white">87</div>
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#F0C76A]">readiness</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {["Learning", "Active", "Expert"].map((label, index) => (
                      <div key={label} className="rounded-md bg-[#172120] px-2 py-2 ring-1 ring-[#3F5550]">
                        <div className={`mx-auto mb-1 h-2 w-2 rounded-full ${index === 0 ? "bg-[#C06C54]" : index === 1 ? "bg-[#D9A441]" : "bg-[#267365]"}`} />
                        <div className="text-[8px] uppercase tracking-widest text-white">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {varianceBands.map((band) => (
                      <div key={band.label} className="rounded-lg bg-[#0B1211] p-3 ring-1 ring-[#3F5550]">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-white">{band.label}</span>
                          <span className="text-[10px] font-bold" style={{ color: band.color }}>{band.delta}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${band.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.75 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: band.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-[#0B1211] p-4 ring-1 ring-[#3F5550]">
                    <div className="mb-4 grid grid-cols-[1fr_44px_44px] gap-3 text-[9px] uppercase tracking-widest font-bold text-[#F0C76A]">
                      <span>Workstream progress</span>
                      <span className="text-right">Now</span>
                      <span className="text-right">Goal</span>
                    </div>
                    <div className="space-y-4">
                      {workstreams.map((item, index) => (
                        <div key={item.label} className="grid grid-cols-[1fr_44px_44px] gap-3 items-center">
                          <div>
                            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-white">
                              <span>{item.label}</span>
                            </div>
                            <div className="relative h-3 rounded-full bg-white/10">
                              <div className="absolute left-[85%] top-1/2 h-5 w-px -translate-y-1/2 bg-white/70" />
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.value}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.75, delay: index * 0.06 }}
                                className={`h-full rounded-full ${item.color}`}
                              />
                            </div>
                          </div>
                          <div className="text-right text-xs font-bold text-white">{item.value}%</div>
                          <div className="text-right text-xs font-bold text-[#F0C76A]">90%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      {/* Power BI Embeds */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-24 py-8">
        <Panel className="p-5 md:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-2">Live Power BI Embed</div>
              <h2 className="text-3xl md:text-5xl font-display leading-tight">EPC EVM Dashboard <span className="text-accent">— live demo</span></h2>
              <p className="mt-3 max-w-2xl text-muted text-sm leading-relaxed font-light">
                A live, interactive Power BI dashboard for a simulated AED 6 billion EPC expansion. Full Earned Value
                Management suite (PV, EV, AC, SPI, CPI, EAC, ETC, VAC, TCPI), an executive S-curve, discipline-wise progress,
                resource histogram, and forecast scenarios. Built on a tabular star schema with 28 DAX measures, Deneb (Vega-Lite)
                visuals and a custom glassmorphism theme.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Power BI", "DAX", "Deneb", "EVM", "Star Schema"].map((tag) => (
                <span key={tag} className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold text-accent ring-1 ring-line/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative w-full overflow-hidden rounded-lg ring-1 ring-line/10 bg-[#172120]" style={{ paddingTop: "62.5%" }}>
            <iframe
              title="EPC_EVM_Dashboard"
              src="https://app.powerbi.com/view?r=eyJrIjoiZjFjZTBmN2MtN2Y1OC00MGU3LTg1NDYtZDYxZDhhM2NhMTk0IiwidCI6ImYwNmE0NTJkLTMzZDAtNDYxYi1hZWFkLWE2NDI5NjI0OTY4NyIsImMiOjEwfQ%3D%3D"
              frameBorder={0}
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] uppercase tracking-widest font-bold text-muted/60">
            <span>BAC: AED 6.00 B</span>
            <span>SPI: 0.975</span>
            <span>CPI: 0.995</span>
            <span>EAC: AED 6.03 B</span>
          </div>
        </Panel>
      </section>

      <section className="px-4 sm:px-8 md:px-12 lg:px-24 py-8">
        <Panel className="p-5 md:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-2">Live Power BI Embed</div>
              <h2 className="text-3xl md:text-5xl font-display leading-tight">EPC Cash Flow & Cost Dashboard <span className="text-accent">— live demo</span></h2>
              <p className="mt-3 max-w-2xl text-muted text-sm leading-relaxed font-light">
                A live contractor cash-flow and cost-control dashboard for the same AED 6 billion EPC programme. Tracks budget
                utilisation, committed vs actual cost, monthly cash flow, an S-curve of cumulative spend, retention, net cash
                position, invoice ageing and collection rate — with cost-breakdown and forecast-at-completion by category.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Power BI", "DAX", "Cost Control", "Cash Flow", "Analytics"].map((tag) => (
                <span key={tag} className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold text-accent ring-1 ring-line/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative w-full overflow-hidden rounded-lg ring-1 ring-line/10 bg-[#172120]" style={{ paddingTop: "62.5%" }}>
            <iframe
              title="EPC_CashFlow_Dashboard"
              src="https://app.powerbi.com/view?r=eyJrIjoiNjVkMDg2ODItNzUyYS00YzMwLThlMzUtZjYwN2M5MWYyODQ4IiwidCI6ImYwNmE0NTJkLTMzZDAtNDYxYi1hZWFkLWE2NDI5NjI0OTY4NyIsImMiOjEwfQ%3D%3D"
              frameBorder={0}
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] uppercase tracking-widest font-bold text-muted/60">
            <span>Committed: 93%</span>
            <span>Cost Var: −AED 164 M</span>
            <span>Net Position: −AED 579 M</span>
            <span>Collection: 47.4%</span>
          </div>
        </Panel>
      </section>

      {/* Tech Proficiency + Skill Radar */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-24 py-8">
        <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
          <Panel className="p-5 md:p-7 lg:col-span-2">
            <div className="flex items-center justify-between mb-7">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-2">Tech Proficiency</div>
                <h2 className="text-3xl font-display">Planned vs actual mastery</h2>
              </div>
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-5">
              {techProficiency.map((row) => (
                <div key={row.label} className="grid md:grid-cols-[180px_1fr_48px] gap-3 md:gap-5 items-center">
                  <div className="text-xs uppercase tracking-widest font-bold text-muted">{row.label}</div>
                  <div className="space-y-2">
                    <div className="h-3 rounded-full bg-bg"><div className="h-full rounded-full bg-[#314E52]" style={{ width: `${row.plan}%` }} /></div>
                    <div className="h-3 rounded-full bg-bg"><div className="h-full rounded-full bg-[#D9A441]" style={{ width: `${row.actual}%` }} /></div>
                  </div>
                  <div className="text-right text-xs font-bold text-ink/70">{row.actual}%</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5 md:p-7">
            <div className="flex items-center justify-between mb-7">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-2">Focus Areas</div>
                <h2 className="text-3xl font-display">Skill distribution</h2>
              </div>
              <Cpu className="w-5 h-5 text-accent" />
            </div>
            <div className="space-y-4">
              {[
                { label: "Data Engineering", pct: 88 },
                { label: "Machine Learning", pct: 82 },
                { label: "Analytics & BI", pct: 90 },
                { label: "AI Automation", pct: 76 },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-muted/70 uppercase tracking-widest">
                    <span>{item.label}</span><span>{item.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-[10px] uppercase tracking-widest font-bold text-muted/60">
              <span>Languages: 3+</span>
              <span>Frameworks: 8+</span>
              <span>Tools: 12+</span>
              <span>Certs: 4</span>
            </div>
          </Panel>
        </div>
      </section>

      {/* GitHub Activity + Model Performance */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-24 py-8">
        <div className="grid lg:grid-cols-4 gap-5 md:gap-6">
          <Panel className="p-5 md:p-7 lg:col-span-2">
            <div className="flex items-center justify-between mb-7">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-2">GitHub Activity</div>
                <h2 className="text-3xl font-display">Monthly commit cadence</h2>
              </div>
              <LineChart className="w-5 h-5 text-accent" />
            </div>
            <SparkBars values={githubActivity} color="bg-[#267365]" />
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-bg p-4 ring-1 ring-line/10"><div className="text-[10px] uppercase tracking-widest font-bold text-muted/50">Peak month</div><div className="text-2xl font-display mt-2">128</div></div>
              <div className="rounded-lg bg-bg p-4 ring-1 ring-line/10"><div className="text-[10px] uppercase tracking-widest font-bold text-muted/50">Avg commits</div><div className="text-2xl font-display mt-2">87</div></div>
              <div className="rounded-lg bg-bg p-4 ring-1 ring-line/10"><div className="text-[10px] uppercase tracking-widest font-bold text-muted/50">Repos</div><div className="text-2xl font-display mt-2">20+</div></div>
            </div>
          </Panel>

          <Panel className="p-5 md:p-7 lg:col-span-2">
            <div className="flex items-center justify-between mb-7">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-2">ML Performance</div>
                <h2 className="text-3xl font-display">Model accuracy trend</h2>
              </div>
              <Network className="w-5 h-5 text-accent" />
            </div>
            <SparkBars values={modelPerf} color="bg-[#314E52]" />
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["SpaceX ML", "Forecast", "Anomaly", "NLP"].map((model, index) => (
                <div key={model} className="rounded-lg border border-line/10 bg-bg/70 p-4">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-muted/50">{model}</div>
                  <div className="text-2xl font-display mt-2">{[94, 91, 88, 86][index]}%</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* Project Milestone Board */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-24 py-8">
        <Panel className="p-5 md:p-8">
          <div className="grid xl:grid-cols-[0.75fr_1.25fr] gap-8">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-2">Project Intelligence</div>
              <h2 className="text-3xl md:text-5xl font-display leading-tight mb-5">Delivery milestone board.</h2>
              <p className="text-muted text-sm leading-relaxed">
                A compact control view for upcoming deliverables, in-flight builds, and AI-generated watchlist signals across the data science portfolio.
              </p>
            </div>
            <div className="grid md:grid-cols-5 gap-3">
              {milestones.map((item) => (
                <div key={item.label} className="min-h-36 rounded-lg border border-line/10 bg-bg p-4 flex flex-col justify-between transition-transform hover:-translate-y-1">
                  <Brain className={`w-5 h-5 ${item.state === "risk" ? "text-[#C06C54]" : item.state === "watch" ? "text-[#D9A441]" : item.state === "active" ? "text-[#314E52]" : "text-[#267365]"}`} />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted/50 mb-2">{item.date}</div>
                    <div className="text-sm font-bold leading-tight">{item.label}</div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted/60">
                    {item.state === "done" ? <CheckCircle2 className="w-3 h-3 text-[#267365]" /> : <GitBranch className="w-3 h-3 text-accent" />}
                    {item.state}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>
    </main>
  );
}
