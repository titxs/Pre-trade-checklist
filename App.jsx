import { useState } from "react";

const REGIMES = [
  { id: "bull", label: "Trending Bull", color: "#00E676", icon: "↗" },
  { id: "bear", label: "Trending Bear", color: "#FF3D3D", icon: "↘" },
  { id: "balanced", label: "Balanced", color: "#448AFF", icon: "↔" },
  { id: "post_trend", label: "Post-Trend", color: "#FFD600", icon: "⟲" },
  { id: "unclear", label: "Unclear", color: "#FF6D00", icon: "?" },
];

const SETUPS = [
  { id: "reversal", label: "Reversal", color: "#00E676" },
  { id: "continuation", label: "Continuation", color: "#448AFF" },
  { id: "seventy", label: "70% Rule", color: "#FFD600" },
  { id: "mean_rev", label: "Mean Rev", color: "#18FFFF" },
];

const MGMT_GUIDE = {
  reversal: {
    bull: "Counter-trend scalp — tight TP to nearest support, take profit fast, trend will resume",
    bear: "Counter-trend scalp — tight TP to nearest resistance, don't hold",
    balanced: "Fade the edge — target POC or opposite side of range",
    post_trend: "Potential trend change — can hold longer, target further, let runner ride",
    unclear: "Reduce size — no clear structure to lean on",
  },
  continuation: {
    bull: "With the trend — full size, let it run, trail stop",
    bear: "With the trend — full size, let it run, trail stop",
    balanced: "Breakout attempt — watch for failure, tighter stop, confirm with volume",
    post_trend: "New direction forming — confirm with CVD shift, moderate size",
    unclear: "Low conviction — reduce size or skip",
  },
  seventy: {
    bull: "Long only — 70% rule into bullish trend, target POC then trend continuation",
    bear: "Short only — 70% rule into bearish trend, target POC then trend continuation",
    balanced: "Highest conviction — classic value area rotation, target POC minimum",
    post_trend: "Valid if opening outside old value — transitional, moderate size",
    unclear: "Skip — need clear value area to trade this setup",
  },
  mean_rev: {
    bull: "Scalp only — fading at extreme in uptrend, very tight TP",
    bear: "Scalp only — fading at extreme in downtrend, very tight TP",
    balanced: "Standard play — fade VA extreme to POC, clean setup",
    post_trend: "Risky — value area may be shifting, reduce size",
    unclear: "Skip — can't define the range edges",
  },
};

const LEVELS = [
  { id: "yvwap", label: "Yearly VWAP", weight: 4, cat: "vwap" },
  { id: "mvwap", label: "Monthly VWAP", weight: 3, cat: "vwap" },
  { id: "wvwap", label: "Weekly VWAP", weight: 3, cat: "vwap" },
  { id: "dvwap", label: "Daily VWAP", weight: 2, cat: "vwap" },
  { id: "frvp_vah", label: "FRVP VAH", weight: 3, cat: "frvp" },
  { id: "frvp_val", label: "FRVP VAL", weight: 3, cat: "frvp" },
  { id: "frvp_poc", label: "FRVP POC", weight: 3, cat: "frvp" },
  { id: "pd_vah", label: "PD VAH", weight: 2, cat: "pd" },
  { id: "pd_val", label: "PD VAL", weight: 2, cat: "pd" },
  { id: "pd_poc", label: "PD POC", weight: 2, cat: "pd" },
  { id: "pw_vah", label: "PW VAH", weight: 2, cat: "pw" },
  { id: "npoc", label: "Naked POC", weight: 3, cat: "auction" },
  { id: "poor_h", label: "Poor High", weight: 2, cat: "auction" },
  { id: "poor_l", label: "Poor Low", weight: 2, cat: "auction" },
  { id: "comp_poc", label: "Composite POC", weight: 2, cat: "comp" },
  { id: "round", label: "Round Number", weight: 1, cat: "other" },
];

const CONFLUENCE = [
  { id: "aggression", label: "Aggression Into Level", weight: 5, cat: "primary" },
  { id: "cvd_div", label: "CVD Divergence", weight: 4, cat: "primary" },
  { id: "spot_perp", label: "Spot/Perps Diverge", weight: 4, cat: "primary" },
  { id: "absorption_30m", label: "30m Absorption", weight: 5, cat: "primary" },
  { id: "exhaustion_30m", label: "30m Exhaustion", weight: 4, cat: "primary" },
  { id: "bubble_absorbed", label: "Bubble Absorbed", weight: 4, cat: "primary" },
  { id: "oi_rising", label: "OI Rising (traps)", weight: 3, cat: "secondary" },
  { id: "oi_dropping", label: "OI Dropping (forced)", weight: 3, cat: "secondary" },
  { id: "wall_holding", label: "Wall Holding", weight: 2, cat: "secondary" },
  { id: "wall_pulled", label: "Wall Pulled (spoof)", weight: 2, cat: "secondary" },
  { id: "stacking", label: "Levels Stacking", weight: 4, cat: "secondary" },
  { id: "tpo_shape", label: "TPO Shape Confirms", weight: 2, cat: "secondary" },
  { id: "tail_quality", label: "Tail Quality", weight: 2, cat: "secondary" },
  { id: "funding", label: "Funding Extreme", weight: 2, cat: "secondary" },
  { id: "net_pos", label: "Net Pos Extreme", weight: 2, cat: "secondary" },
  { id: "backtest", label: "Backtest Confirmed", weight: 3, cat: "secondary" },
  { id: "mtf_vwap", label: "Multi-TF VWAP Align", weight: 3, cat: "secondary" },
];

const THREE_Q = [
  { id: "q1", label: "Who am I trading against?", short: "Trapped traders identified" },
  { id: "q2", label: "Why will they pay me?", short: "Forced closures clear" },
  { id: "q3", label: "Has it been priced in?", short: "Aggressive move, not slow grind" },
];

export default function TradeScorer() {
  const [step, setStep] = useState(0);
  const [regime, setRegime] = useState(null);
  const [setup, setSetup] = useState(null);
  const [levels, setLevels] = useState([]);
  const [confluence, setConfluence] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [rr, setRr] = useState("");

  const reset = () => {
    setStep(0); setRegime(null); setSetup(null);
    setLevels([]); setConfluence([]); setQuestions([]); setRr("");
  };

  const togLevel = (id) => setLevels(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const togConf = (id) => setConfluence(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const togQ = (id) => setQuestions(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // Scoring
  const calcScore = () => {
    let score = 0;
    let max = 0;
    let warnings = [];
    let bonuses = [];
    let mgmt = "";

    // Regime-setup management guidance (no penalty, just guidance)
    if (regime && setup) {
      mgmt = MGMT_GUIDE[setup]?.[regime] || "";
    }
    
    // Regime awareness
    if (regime === "unclear") {
      score -= 5;
      warnings.push("Unclear regime — reduce size or sit out");
    }

    // Levels (max 15)
    const levelScore = levels.reduce((sum, id) => {
      const l = LEVELS.find(x => x.id === id);
      return sum + (l?.weight || 0);
    }, 0);
    score += Math.min(levelScore, 15);
    max += 15;
    if (levels.length >= 3) bonuses.push(`${levels.length} levels stacking — highest conviction`);
    else if (levels.length >= 2) bonuses.push(`${levels.length} levels stacking`);
    if (levels.length === 0) warnings.push("No key level selected");

    // Confluence (max 25)
    const confScore = confluence.reduce((sum, id) => {
      const c2 = CONFLUENCE.find(x => x.id === id);
      return sum + (c2?.weight || 0);
    }, 0);
    score += Math.min(confScore, 25);
    max += 25;

    const hasAggression = confluence.includes("aggression");
    if (hasAggression) bonuses.push("Aggression into level confirmed");
    
    const has30m = confluence.includes("absorption_30m") || confluence.includes("exhaustion_30m");
    if (has30m) bonuses.push("30m confirmation present");
    if (!has30m) warnings.push("No 30m confirmation");

    const hasPrimary = confluence.some(id => CONFLUENCE.find(c2 => c2.id === id)?.cat === "primary");
    if (!hasPrimary) warnings.push("No primary orderflow confirmation");

    // Three questions (max 15)
    const qScore = questions.length * 5;
    score += qScore;
    max += 15;
    if (questions.length < 3) warnings.push(`Only ${questions.length}/3 questions answered`);
    if (questions.length === 3) bonuses.push("All 3 questions clear");

    // R:R (max 10)
    const rrNum = parseFloat(rr);
    if (rrNum >= 3) { score += 10; bonuses.push(`${rr}:1 R:R — excellent`); }
    else if (rrNum >= 2) { score += 7; bonuses.push(`${rr}:1 R:R`); }
    else if (rrNum >= 1.5) { score += 3; warnings.push("R:R below 2:1 — consider skipping"); }
    else if (rr) { warnings.push("R:R below minimum"); }
    else { warnings.push("No R:R entered"); }
    max += 10;

    const pct = Math.max(0, Math.min(100, Math.round((score / max) * 100)));
    
    // Letter grade system
    let grade, gradeColor, gradeBg, verdict;
    if (pct >= 90) { grade = "A+"; gradeColor = "#00E676"; gradeBg = "#00E67615"; verdict = "ELITE SETUP — FULL SIZE"; }
    else if (pct >= 80) { grade = "A"; gradeColor = "#00E676"; gradeBg = "#00E67612"; verdict = "STRONG — TAKE THE TRADE"; }
    else if (pct >= 70) { grade = "B+"; gradeColor = "#4CAF50"; gradeBg = "#4CAF5012"; verdict = "GOOD — STANDARD SIZE"; }
    else if (pct >= 60) { grade = "B"; gradeColor = "#FFD600"; gradeBg = "#FFD60012"; verdict = "DECENT — REDUCE SIZE"; }
    else if (pct >= 50) { grade = "C+"; gradeColor = "#FF9800"; gradeBg = "#FF980012"; verdict = "WEAK — HALF SIZE MAX"; }
    else if (pct >= 40) { grade = "C"; gradeColor = "#FF6D00"; gradeBg = "#FF6D0012"; verdict = "MARGINAL — LIKELY SKIP"; }
    else { grade = "F"; gradeColor = "#FF3D3D"; gradeBg = "#FF3D3D12"; verdict = "NO EDGE — SKIP"; }

    return { score, max, pct, grade, gradeColor, gradeBg, verdict, warnings, bonuses, mgmt };
  };

  const F = "'Azeret Mono', 'JetBrains Mono', monospace";
  const bg = "#06060A";
  const bg2 = "#0C0C12";
  const b1 = "#1A1A24";
  const b2 = "#24243A";
  const w = "#EEEEF2";
  const gr = "#5A5A72";
  const gd = "#36364A";

  const stepTitles = ["REGIME", "SETUP", "LEVELS", "CONFLUENCE", "3 QUESTIONS", "R:R", "SCORE"];

  return (
    <div style={{
      minHeight: "100vh", background: bg, color: w,
      fontFamily: F, padding: "0 0 32px 0",
      maxWidth: 480, margin: "0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        button { -webkit-tap-highlight-color: transparent; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes scoreReveal { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .su { animation: slideUp 0.35s ease both; }
        .sr { animation: scoreReveal 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "14px 16px", borderBottom: `1px solid ${b1}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: bg2, position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "linear-gradient(135deg, #00E676, #18FFFF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: bg,
          }}>⚡</div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>TRADE SCORER</div>
        </div>
        {step > 0 && (
          <button onClick={reset} style={{
            padding: "5px 12px", borderRadius: 6, border: `1px solid ${b2}`,
            background: "transparent", color: gr, fontSize: 10, fontFamily: F,
            cursor: "pointer", fontWeight: 600,
          }}>RESET</button>
        )}
      </div>

      {/* Progress */}
      <div style={{ padding: "10px 16px 6px", display: "flex", gap: 3 }}>
        {stepTitles.map((t, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              height: 3, borderRadius: 2, marginBottom: 4,
              background: i <= step ? (i === step ? "#00E676" : "#00E67666") : b1,
              transition: "background 0.3s",
            }} />
            <div style={{
              fontSize: 7, fontWeight: 600, letterSpacing: "0.06em",
              color: i <= step ? "#00E676" : gd,
            }}>{t}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px" }}>

        {/* STEP 0: REGIME */}
        {step === 0 && (
          <div className="su">
            <div style={{ fontSize: 11, color: gr, marginBottom: 12, fontWeight: 600 }}>What regime is the market in right now?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {REGIMES.map(r => (
                <button key={r.id} onClick={() => { setRegime(r.id); setStep(1); }} style={{
                  padding: "14px 16px", borderRadius: 10, border: `1px solid ${b2}`,
                  background: bg2, cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 12,
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${r.color}15`, border: `1px solid ${r.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: r.color,
                  }}>{r.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.color, fontFamily: F }}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: SETUP */}
        {step === 1 && (
          <div className="su">
            <div style={{ fontSize: 11, color: gr, marginBottom: 12, fontWeight: 600 }}>Which setup are you hunting?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SETUPS.map(s => {
                const guide = MGMT_GUIDE[s.id]?.[regime] || "";
                return (
                  <button key={s.id} onClick={() => { setSetup(s.id); setStep(2); }} style={{
                    padding: "14px 16px", borderRadius: 10,
                    border: `1px solid ${s.color}44`,
                    background: `${s.color}08`,
                    cursor: "pointer", textAlign: "left",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: F }}>{s.label}</div>
                    {guide && <div style={{ fontSize: 9, color: gr, marginTop: 4, lineHeight: 1.4 }}>{guide}</div>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep(0)} style={{
              marginTop: 10, padding: "8px", width: "100%", borderRadius: 8,
              border: `1px solid ${b1}`, background: "transparent",
              color: gr, fontSize: 10, fontFamily: F, cursor: "pointer",
            }}>← Back</button>
          </div>
        )}

        {/* STEP 2: LEVELS */}
        {step === 2 && (
          <div className="su">
            <div style={{ fontSize: 11, color: gr, marginBottom: 4, fontWeight: 600 }}>What levels are at this price?</div>
            <div style={{ fontSize: 9, color: gd, marginBottom: 12 }}>Tap all that stack — more = stronger</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {LEVELS.map(l => {
                const sel = levels.includes(l.id);
                return (
                  <button key={l.id} onClick={() => togLevel(l.id)} style={{
                    padding: "8px 12px", borderRadius: 20,
                    border: `1px solid ${sel ? "#448AFF" : b2}`,
                    background: sel ? "#448AFF15" : "transparent",
                    color: sel ? "#448AFF" : gr,
                    fontSize: 11, fontFamily: F, fontWeight: 600, cursor: "pointer",
                  }}>{l.label}</button>
                );
              })}
            </div>
            {levels.length > 0 && (
              <div style={{
                marginTop: 12, padding: "8px 12px", borderRadius: 8,
                background: levels.length >= 2 ? "#00E67612" : "#FFD60012",
                border: `1px solid ${levels.length >= 2 ? "#00E67633" : "#FFD60033"}`,
                fontSize: 11, fontWeight: 600,
                color: levels.length >= 2 ? "#00E676" : "#FFD600",
              }}>
                {levels.length} level{levels.length !== 1 ? "s" : ""} stacking
                {levels.length >= 2 && " → HIGH CONVICTION"}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${b1}`,
                background: "transparent", color: gr, fontSize: 10, fontFamily: F, cursor: "pointer",
              }}>← Back</button>
              <button onClick={() => setStep(3)} style={{
                flex: 2, padding: "10px", borderRadius: 8, border: "none",
                background: levels.length > 0 ? "linear-gradient(135deg, #448AFF, #18FFFF)" : gd,
                color: levels.length > 0 ? bg : gr,
                fontSize: 11, fontFamily: F, fontWeight: 700, cursor: "pointer",
              }}>Next →</button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFLUENCE */}
        {step === 3 && (
          <div className="su">
            <div style={{ fontSize: 11, color: gr, marginBottom: 4, fontWeight: 600 }}>What orderflow do you see?</div>
            <div style={{ fontSize: 9, color: gd, marginBottom: 8 }}>PRIMARY — carry the thesis</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
              {CONFLUENCE.filter(c => c.cat === "primary").map(c => {
                const sel = confluence.includes(c.id);
                return (
                  <button key={c.id} onClick={() => togConf(c.id)} style={{
                    padding: "8px 12px", borderRadius: 20,
                    border: `1px solid ${sel ? "#00E676" : b2}`,
                    background: sel ? "#00E67615" : "transparent",
                    color: sel ? "#00E676" : gr,
                    fontSize: 11, fontFamily: F, fontWeight: 600, cursor: "pointer",
                  }}>{c.label}</button>
                );
              })}
            </div>
            <div style={{ fontSize: 9, color: gd, marginBottom: 8 }}>SECONDARY — add confluence</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {CONFLUENCE.filter(c => c.cat === "secondary").map(c => {
                const sel = confluence.includes(c.id);
                return (
                  <button key={c.id} onClick={() => togConf(c.id)} style={{
                    padding: "8px 12px", borderRadius: 20,
                    border: `1px solid ${sel ? "#18FFFF" : b2}`,
                    background: sel ? "#18FFFF12" : "transparent",
                    color: sel ? "#18FFFF" : gr,
                    fontSize: 11, fontFamily: F, fontWeight: 600, cursor: "pointer",
                  }}>{c.label}</button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${b1}`,
                background: "transparent", color: gr, fontSize: 10, fontFamily: F, cursor: "pointer",
              }}>← Back</button>
              <button onClick={() => setStep(4)} style={{
                flex: 2, padding: "10px", borderRadius: 8, border: "none",
                background: confluence.length > 0 ? "linear-gradient(135deg, #00E676, #18FFFF)" : gd,
                color: confluence.length > 0 ? bg : gr,
                fontSize: 11, fontFamily: F, fontWeight: 700, cursor: "pointer",
              }}>Next →</button>
            </div>
          </div>
        )}

        {/* STEP 4: THREE QUESTIONS */}
        {step === 4 && (
          <div className="su">
            <div style={{ fontSize: 11, color: gr, marginBottom: 12, fontWeight: 600 }}>Can you answer all three clearly?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {THREE_Q.map(q => {
                const sel = questions.includes(q.id);
                return (
                  <button key={q.id} onClick={() => togQ(q.id)} style={{
                    padding: "14px 16px", borderRadius: 10,
                    border: `1px solid ${sel ? "#00E676" : b2}`,
                    background: sel ? "#00E67610" : bg2,
                    cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      border: `2px solid ${sel ? "#00E676" : gd}`,
                      background: sel ? "#00E676" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: sel ? bg : "transparent", fontWeight: 700,
                      transition: "all 0.2s",
                    }}>{sel ? "✓" : ""}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: sel ? "#00E676" : w, fontFamily: F }}>{q.label}</div>
                      <div style={{ fontSize: 9, color: gr, marginTop: 2 }}>{q.short}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {questions.length < 3 && (
              <div style={{
                marginTop: 10, padding: "8px 12px", borderRadius: 8,
                background: "#FF3D3D12", border: "1px solid #FF3D3D33",
                fontSize: 10, color: "#FF3D3D", fontWeight: 600,
              }}>
                {3 - questions.length} unanswered — this is a vibe, not a hypothesis
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => setStep(3)} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${b1}`,
                background: "transparent", color: gr, fontSize: 10, fontFamily: F, cursor: "pointer",
              }}>← Back</button>
              <button onClick={() => setStep(5)} style={{
                flex: 2, padding: "10px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg, #00E676, #18FFFF)",
                color: bg, fontSize: 11, fontFamily: F, fontWeight: 700, cursor: "pointer",
              }}>Next →</button>
            </div>
          </div>
        )}

        {/* STEP 5: R:R */}
        {step === 5 && (
          <div className="su">
            <div style={{ fontSize: 11, color: gr, marginBottom: 12, fontWeight: 600 }}>What's your R:R to TP1?</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["1.5", "2", "2.5", "3", "4", "5+"].map(v => (
                <button key={v} onClick={() => setRr(v)} style={{
                  flex: 1, padding: "14px 0", borderRadius: 10,
                  border: `1px solid ${rr === v ? "#00E676" : b2}`,
                  background: rr === v ? "#00E67615" : bg2,
                  color: rr === v ? "#00E676" : gr,
                  fontSize: 14, fontFamily: F, fontWeight: 700, cursor: "pointer",
                }}>{v}</button>
              ))}
            </div>
            {rr && parseFloat(rr) < 2 && (
              <div style={{
                padding: "8px 12px", borderRadius: 8, marginBottom: 10,
                background: "#FF3D3D12", border: "1px solid #FF3D3D33",
                fontSize: 10, color: "#FF3D3D", fontWeight: 600,
              }}>Below 2:1 minimum — consider skipping</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(4)} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${b1}`,
                background: "transparent", color: gr, fontSize: 10, fontFamily: F, cursor: "pointer",
              }}>← Back</button>
              <button onClick={() => setStep(6)} style={{
                flex: 2, padding: "12px", borderRadius: 8, border: "none",
                background: rr ? "linear-gradient(135deg, #00E676, #18FFFF)" : gd,
                color: rr ? bg : gr,
                fontSize: 12, fontFamily: F, fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.04em",
              }}>GET SCORE →</button>
            </div>
          </div>
        )}

        {/* STEP 6: SCORE */}
        {step === 6 && (() => {
          const result = calcScore();
          return (
            <div className="sr">
              {/* Grade circle */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{
                  width: 130, height: 130, borderRadius: "50%",
                  border: `4px solid ${result.gradeColor}`,
                  background: result.gradeBg,
                  display: "inline-flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 50px ${result.gradeColor}25`,
                }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: result.gradeColor, fontFamily: F }}>{result.grade}</div>
                  <div style={{ fontSize: 9, color: gr, fontWeight: 600, letterSpacing: "0.08em" }}>{result.pct}/100</div>
                </div>
              </div>

              {/* Verdict */}
              <div style={{
                textAlign: "center", padding: "14px", borderRadius: 10,
                background: result.gradeBg,
                border: `1px solid ${result.gradeColor}33`,
                marginBottom: 12,
              }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: result.gradeColor,
                  fontFamily: F, letterSpacing: "0.06em",
                }}>{result.verdict}</div>
              </div>

              {/* Management guidance */}
              {result.mgmt && (
                <div style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "#FFD60008", border: "1px solid #FFD60025",
                  marginBottom: 12,
                }}>
                  <div style={{ fontSize: 9, color: "#FFD600", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>TRADE MANAGEMENT</div>
                  <div style={{ fontSize: 11, color: "#FFD600", lineHeight: 1.5 }}>{result.mgmt}</div>
                </div>
              )}

              {/* Summary */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 12,
              }}>
                {[
                  { l: "Regime", v: REGIMES.find(r2 => r2.id === regime)?.label || "—", c: REGIMES.find(r2 => r2.id === regime)?.color },
                  { l: "Setup", v: SETUPS.find(s2 => s2.id === setup)?.label || "—", c: SETUPS.find(s2 => s2.id === setup)?.color },
                  { l: "Levels", v: levels.length, c: levels.length >= 2 ? "#00E676" : "#FFD600" },
                  { l: "R:R", v: rr ? `${rr}:1` : "—", c: parseFloat(rr) >= 2 ? "#00E676" : "#FF3D3D" },
                ].map(s2 => (
                  <div key={s2.l} style={{
                    background: bg2, border: `1px solid ${b1}`, borderRadius: 8,
                    padding: "10px 8px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s2.c, fontFamily: F }}>{s2.v}</div>
                    <div style={{ fontSize: 8, color: gr, marginTop: 2, fontWeight: 600, letterSpacing: "0.06em" }}>{s2.l}</div>
                  </div>
                ))}
              </div>

              {/* Bonuses */}
              {result.bonuses.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  {result.bonuses.map((b2, i) => (
                    <div key={i} style={{
                      padding: "6px 10px", marginBottom: 3, borderRadius: 6,
                      background: "#00E67608", fontSize: 10, color: "#00E676",
                      fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <span style={{ fontSize: 12 }}>✓</span> {b2}
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {result.warnings.map((w2, i) => (
                    <div key={i} style={{
                      padding: "6px 10px", marginBottom: 3, borderRadius: 6,
                      background: "#FF3D3D08", fontSize: 10, color: "#FF3D3D",
                      fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <span style={{ fontSize: 12 }}>⚠</span> {w2}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <button onClick={reset} style={{
                width: "100%", padding: "14px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #00E676, #18FFFF)",
                color: bg, fontSize: 12, fontFamily: F, fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.04em",
              }}>NEW TRADE</button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
