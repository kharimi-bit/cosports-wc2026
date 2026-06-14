import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SB = createClient(
  "https://wwokzpwpuyhzyzrilwqf.supabase.co",
  "sb_publishable_1W3qG4dISoadczV5sWKoeQ_-XXoTAwP"
);

const C = {
  green:"#2DB84B", greenDk:"#228F3A", black:"#0A0A0A",
  white:"#FFFFFF", offwhite:"#F2F2F2", gray:"#E0E0E0",
  grayDk:"#AAAAAA", card:"#F7F7F7", gold:"#F5C842", red:"#E63232",
};
const F = "system-ui,-apple-system,'Helvetica Neue',sans-serif";

// ── SCORING ────────────────────────────────────────────────────────────────
function calcPts(pred, match) {
  if (!pred || match.home_score === null || match.away_score === null) return null;
  const [ph, pa] = pred.split(":").map(Number);
  const rh = match.home_score, ra = match.away_score;
  if (ph === rh && pa === ra) return 5;
  if (Math.sign(ph - pa) !== Math.sign(rh - ra)) return 0;
  if ((ph - pa) === (rh - ra)) return 3;
  return 1;
}

function calcUserStats(userId, matches, predictions) {
  let pts = 0, exact = 0;
  for (const m of matches) {
    const pred = predictions.find(p => p.user_id === userId && p.match_id === m.id);
    const p = calcPts(pred?.prediction, m);
    if (p !== null) { pts += p; if (p === 5) exact++; }
  }
  return { pts, exact };
}

// ── SVG LOGO ───────────────────────────────────────────────────────────────
function LogoSVG({ size = 32, onGreen = true }) {
  const c = onGreen ? "#FFFFFF" : "#2DB84B";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="15" stroke={c} strokeWidth="2.5" fill="none"/>
      <polygon points="20,8 23.5,11 22,15.5 18,15.5 16.5,11" fill={c}/>
      <polygon points="20,32 23.5,29 22,24.5 18,24.5 16.5,29" fill={c}/>
      <polygon points="7,19.5 10,15.5 14.5,17 14.5,23 10,24.5" fill={c}/>
      <polygon points="33,19.5 30,15.5 25.5,17 25.5,23 30,24.5" fill={c}/>
      <line x1="16.5" y1="11" x2="10" y2="15.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="23.5" y1="11" x2="30" y2="15.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14.5" y1="17" x2="18" y2="15.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="25.5" y1="17" x2="22" y2="15.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14.5" y1="23" x2="16.5" y2="29" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="25.5" y1="23" x2="23.5" y2="29" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── UI PRIMITIVES ──────────────────────────────────────────────────────────
function GreenHero({ title, sub, dark }) {
  return (
    <div style={{ background: dark ? C.black : C.green, padding: "20px 20px 0" }}>
      {sub && <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: dark ? C.green : "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{sub}</div>}
      <div style={{ fontFamily: F, fontWeight: 900, fontSize: 30, color: C.white, textTransform: "uppercase", letterSpacing: "-1px", lineHeight: 1, marginBottom: 16 }}>{title}</div>
    </div>
  );
}

function StatRow({ items }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {items.map(([v, l, c]) => (
        <div key={l} style={{ flex: 1, background: C.white, padding: "10px 6px", textAlign: "center" }}>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 22, color: c || C.black, textTransform: "uppercase" }}>{v}</div>
          <div style={{ fontFamily: F, fontSize: 9, color: C.grayDk, textTransform: "uppercase", letterSpacing: .8, fontWeight: 600 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function Btn({ children, onClick, variant = "green", full, sm, disabled }) {
  const base = { fontFamily: F, fontWeight: 900, fontSize: sm ? 11 : 14, textTransform: "uppercase", letterSpacing: .5, border: "none", cursor: disabled ? "default" : "pointer", padding: sm ? "8px 12px" : "13px 18px", borderRadius: 0, display: "block", width: full ? "100%" : "auto", opacity: disabled ? .5 : 1 };
  const v = {
    green: { ...base, background: C.green, color: C.white },
    black: { ...base, background: C.black, color: C.white },
    white: { ...base, background: C.white, color: C.black, border: `2px solid ${C.black}` },
    ghost: { ...base, background: "transparent", color: C.grayDk, border: `1px solid ${C.gray}` },
    red:   { ...base, background: C.red, color: C.white },
  };
  return <button onClick={disabled ? undefined : onClick} style={v[variant]}>{children}</button>;
}

function Scroll({ children }) {
  return <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", background: C.offwhite }}>{children}</div>;
}

function Loading() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.offwhite }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚽</div>
        <div style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: C.grayDk, textTransform: "uppercase", letterSpacing: 1 }}>Загрузка...</div>
      </div>
    </div>
  );
}

// ── PHONE FRAME ────────────────────────────────────────────────────────────
function Phone({ children }) {
  return (
    <div style={{ background: "#111", borderRadius: 44, padding: 12, maxWidth: 400, margin: "20px auto", boxShadow: "0 30px 80px rgba(0,0,0,.65)" }}>
      <div style={{ width: 120, height: 26, background: "#111", borderRadius: "0 0 16px 16px", margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ width: 10, height: 10, background: "#222", borderRadius: "50%" }} />
        <div style={{ width: 60, height: 5, background: "#222", borderRadius: 3 }} />
      </div>
      <div style={{ background: C.offwhite, borderRadius: 34, overflow: "hidden", height: 760, display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

function TgBar({ onBack, isAdmin }) {
  return (
    <div style={{ background: C.black, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      {onBack && <span onClick={onBack} style={{ color: C.green, fontSize: 24, cursor: "pointer", fontWeight: 900, lineHeight: 1, marginRight: 2 }}>‹</span>}
      <div style={{ width: 32, height: 32, background: C.green, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <LogoSVG size={24} onGreen={true} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 13, color: C.white, textTransform: "uppercase", letterSpacing: .5 }}>CoSports · ЧМ 2026</div>
        <div style={{ fontFamily: F, fontSize: 9, color: C.green, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{isAdmin ? "● ADMIN" : "● ONLINE"}</div>
      </div>
    </div>
  );
}

function Nav({ tab, setTab, isAdmin }) {
  const tabs = isAdmin
    ? [["home", "⚽", "Главная"], ["matches", "⚙️", "Счета"], ["lb", "🏆", "Рейтинг"], ["users", "👥", "Люди"], ["blast", "📣", "Рассылки"]]
    : [["home", "⚽", "Главная"], ["preds", "✏️", "Прогнозы"], ["lb", "🏆", "Рейтинг"], ["notifs", "🔔", "Уведом."]];
  return (
    <div style={{ display: "flex", background: C.black, flexShrink: 0 }}>
      {tabs.map(([id, icon, label]) => (
        <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: "none", background: tab === id ? C.green : "transparent", cursor: "pointer", padding: "10px 2px" }}>
          <span style={{ fontSize: 17 }}>{icon}</span>
          <span style={{ fontFamily: F, fontSize: 8, fontWeight: 700, color: tab === id ? C.white : C.grayDk, textTransform: "uppercase", letterSpacing: .3 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── LOGIN + REGISTRATION ───────────────────────────────────────────────────
function Login({ onLogin, users }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [sel, setSel] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  // Register state
  const [regName, setRegName] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [newPin, setNewPin] = useState(null);
  const [newUser, setNewUser] = useState(null);

  const parts = users.filter(u => u.role === "participant" || u.role === "owner");

  async function doLogin() {
    const u = parts.find(u => u.id === sel && u.pin === pin);
    if (u) { setErr(""); onLogin(u); }
    else {
      // also check admin
      const a = users.find(u => u.id === sel && u.pin === pin && u.role === "admin");
      if (a) { setErr(""); onLogin(a); }
      else { setErr("Неверный пин-код"); setPin(""); }
    }
  }

  async function doRegister() {
    if (!regName.trim()) return;
    setRegLoading(true);
    const generatedPin = String(Math.floor(1000 + Math.random() * 9000));
    const nextId = Math.max(0, ...users.map(u => u.id)) + 1;
    const { data, error } = await SB.from("users").insert({ id: nextId, name: regName.trim(), pin: generatedPin, role: "participant" }).select().single();
    if (error) { setErr("Ошибка: " + error.message); setRegLoading(false); return; }
    setNewPin(generatedPin);
    setNewUser(data);
    setRegLoading(false);
  }

  if (mode === "register") {
    if (newPin) {
      return (
        <Scroll>
          <div style={{ background: C.green, padding: "40px 20px 20px" }}>
            <div style={{ fontFamily: F, fontWeight: 900, fontSize: 30, color: C.white, textTransform: "uppercase", letterSpacing: "-1px", lineHeight: 1, marginBottom: 8 }}>Готово!</div>
            <div style={{ fontFamily: F, fontSize: 13, color: "rgba(255,255,255,.85)", lineHeight: 1.5 }}>Ты зарегистрирован как участник</div>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ background: C.black, padding: 20, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontFamily: F, fontSize: 11, color: C.grayDk, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Твой пин-код</div>
              <div style={{ fontFamily: F, fontWeight: 900, fontSize: 48, color: C.green, letterSpacing: 8 }}>{newPin}</div>
              <div style={{ fontFamily: F, fontSize: 10, color: C.grayDk, marginTop: 8, textTransform: "uppercase" }}>Сохрани — он нужен для входа!</div>
            </div>
            <div style={{ fontFamily: F, fontSize: 13, color: C.black, marginBottom: 20, lineHeight: 1.6 }}>
              Имя: <strong>{newUser.name}</strong><br/>
              Теперь можешь войти и ставить прогнозы.
            </div>
            <Btn full onClick={() => onLogin(newUser)}>Войти →</Btn>
          </div>
        </Scroll>
      );
    }
    return (
      <Scroll>
        <div style={{ background: C.green, padding: "28px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, background: C.white, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogoSVG size={34} onGreen={false} />
            </div>
            <div style={{ fontFamily: F, fontWeight: 900, fontSize: 20, color: C.white, textTransform: "uppercase", letterSpacing: "-0.5px", lineHeight: 1.1 }}>CoSports<br /><span style={{ fontSize: 12, fontWeight: 600, opacity: .8, letterSpacing: 1 }}>ЧМ 2026 · ПРОГНОЗЫ</span></div>
          </div>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 34, color: C.white, textTransform: "uppercase", letterSpacing: "-1.5px", lineHeight: .95 }}>РЕГИСТРАЦИЯ</div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ background: C.white, padding: 20 }}>
            <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.grayDk, marginBottom: 10 }}>Твоё имя</div>
            <input
              value={regName}
              onChange={e => setRegName(e.target.value)}
              placeholder="Например: Никита"
              maxLength={20}
              style={{ width: "100%", background: C.black, border: `2px solid ${C.green}`, padding: "12px 14px", color: C.white, fontSize: 16, outline: "none", fontFamily: F, boxSizing: "border-box", marginBottom: 16 }}
            />
            {err && <div style={{ fontFamily: F, fontSize: 11, color: C.red, marginBottom: 10, fontWeight: 700, textTransform: "uppercase" }}>{err}</div>}
            <Btn full onClick={doRegister} disabled={regLoading || !regName.trim()}>
              {regLoading ? "Создаём..." : "Создать аккаунт →"}
            </Btn>
          </div>
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button onClick={() => setMode("login")} style={{ fontFamily: F, fontSize: 11, color: C.grayDk, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textTransform: "uppercase" }}>
              Уже есть аккаунт? Войти
            </button>
          </div>
        </div>
      </Scroll>
    );
  }

  // LOGIN MODE
  const allLoginUsers = users.filter(u => u.role !== "guest");
  return (
    <Scroll>
      <div style={{ background: C.green, padding: "28px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, background: C.white, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogoSVG size={34} onGreen={false} />
          </div>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 20, color: C.white, textTransform: "uppercase", letterSpacing: "-0.5px", lineHeight: 1.1 }}>CoSports<br /><span style={{ fontSize: 12, fontWeight: 600, opacity: .8, letterSpacing: 1 }}>ЧМ 2026 · ПРОГНОЗЫ</span></div>
        </div>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 34, color: C.white, textTransform: "uppercase", letterSpacing: "-1.5px", lineHeight: .95 }}>ВЫБЕРИ<br />УЧАСТНИКА</div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 16 }}>
          {parts.map(u => (
            <button key={u.id} onClick={() => { setSel(u.id); setErr(""); }} style={{ background: sel === u.id ? C.green : C.white, border: `2px solid ${sel === u.id ? C.green : C.gray}`, borderRadius: 0, padding: "11px 6px", color: sel === u.id ? C.white : C.black, fontFamily: F, fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>{u.name}</button>
          ))}
        </div>
        <div style={{ background: C.white, padding: 16 }}>
          <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.grayDk, marginBottom: 12 }}>Пин-код</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 12 }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: pin.length > i ? C.green : C.gray, transition: "background .15s" }} />)}
          </div>
          {err && <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: C.red, textAlign: "center", textTransform: "uppercase", marginBottom: 10 }}>{err}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, marginBottom: 12 }}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((d, i) => (
              <button key={i} onClick={() => { if (d === "⌫") { setPin(p => p.slice(0, -1)); setErr(""); } else if (d !== "" && pin.length < 4) { setPin(p => p + d); setErr(""); } }}
                style={{ background: d === "" ? "transparent" : C.black, border: "none", padding: "14px 0", color: C.white, fontFamily: F, fontSize: 20, fontWeight: 900, cursor: d === "" ? "default" : "pointer", visibility: d === "" ? "hidden" : "visible" }}>
                {d}
              </button>
            ))}
          </div>
          <Btn onClick={doLogin} variant={sel && pin.length === 4 ? "green" : "ghost"} full>
            {sel && pin.length === 4 ? "Войти →" : "Выбери имя + введи пин"}
          </Btn>
        </div>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button onClick={() => setMode("register")} style={{ fontFamily: F, fontSize: 11, color: C.green, background: "none", border: "none", cursor: "pointer", fontWeight: 700, textTransform: "uppercase", textDecoration: "underline" }}>
            + Присоединиться к игре
          </button>
        </div>
      </div>
    </Scroll>
  );
}

// ── HOME ───────────────────────────────────────────────────────────────────
function Home({ user, setTab, matches, predictions, users }) {
  const participants = users.filter(u => u.role === "participant" || u.role === "owner");
  const withStats = participants.map(u => ({ ...u, ...calcUserStats(u.id, matches, predictions) }));
  const sorted = [...withStats].sort((a, b) => b.pts - a.pts);
  const me = withStats.find(u => u.id === user.id) || { pts: 0, exact: 0 };
  const rank = sorted.findIndex(u => u.id === user.id) + 1;
  const next = matches.find(m => m.home_score === null);
  const myPredNext = next ? predictions.find(p => p.user_id === user.id && p.match_id === next.id) : null;
  const played = matches.filter(m => m.home_score !== null).length;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Scroll>
      <div style={{ background: C.green, padding: "20px 20px 0" }}>
        <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Привет,</div>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 34, color: C.white, textTransform: "uppercase", letterSpacing: "-1.5px", lineHeight: .95, marginBottom: 16 }}>{user.name}</div>
        <StatRow items={[[me.pts, "Очков", C.black], [`#${rank || "—"}`, "Место", C.green], [`${played}/${matches.length}`, "Матчей", C.black]]} />
      </div>
      {next && (
        <div style={{ padding: 16 }}>
          <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.grayDk, marginBottom: 8 }}>Ближайший матч</div>
          <div style={{ background: C.black, padding: 16 }}>
            <div style={{ fontFamily: F, fontSize: 9, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Группа {next.group_name} · {next.match_date}</div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <div style={{ flex: 1, fontFamily: F, fontWeight: 900, fontSize: 16, color: C.white, textTransform: "uppercase" }}>{next.home_team}</div>
              <div style={{ fontFamily: F, fontSize: 11, color: C.grayDk, padding: "0 8px", fontWeight: 700 }}>VS</div>
              <div style={{ flex: 1, fontFamily: F, fontWeight: 900, fontSize: 16, color: C.white, textTransform: "uppercase", textAlign: "right" }}>{next.away_team}</div>
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: C.grayDk, marginBottom: 12, textTransform: "uppercase" }}>
              Прогноз: <span style={{ color: C.green, fontWeight: 700 }}>{myPredNext?.prediction || "не введён"}</span>
            </div>
            <Btn onClick={() => setTab("preds")} full>{myPredNext ? "Изменить прогноз" : "⚡ Ввести прогноз"}</Btn>
          </div>
        </div>
      )}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.grayDk, marginBottom: 8 }}>Топ участников</div>
        {sorted.slice(0, 5).map((u, i) => {
          const isMe = u.id === user.id;
          return (
            <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "11px 14px", background: isMe ? C.green : C.white, marginBottom: 3 }}>
              <div style={{ fontFamily: F, fontWeight: 900, fontSize: 13, width: 26, color: isMe ? C.white : i === 0 ? C.gold : C.grayDk }}>{medals[i] || i + 1}</div>
              <div style={{ flex: 1, fontFamily: F, fontWeight: 700, fontSize: 14, color: isMe ? C.white : C.black, textTransform: "uppercase" }}>{u.name}{isMe ? " ←" : ""}</div>
              <div style={{ fontFamily: F, fontWeight: 900, fontSize: 18, color: isMe ? C.white : C.green }}>{u.pts}<span style={{ fontSize: 10, marginLeft: 2, opacity: .7 }}>pts</span></div>
            </div>
          );
        })}
        <div style={{ marginTop: 4 }}><Btn onClick={() => setTab("lb")} variant="white" full sm>Полный рейтинг →</Btn></div>
      </div>
    </Scroll>
  );
}

// ── PREDICTIONS ────────────────────────────────────────────────────────────
function Preds({ user, matches, predictions, onSavePred }) {
  const [editing, setEditing] = useState(null);
  const [localScore, setLocalScore] = useState("0:0");
  const [saving, setSaving] = useState(false);

  function openEdit(match) {
    const pred = predictions.find(p => p.user_id === user.id && p.match_id === match.id);
    setLocalScore(pred?.prediction || "0:0");
    setEditing(match);
  }

  async function savePred() {
    setSaving(true);
    await onSavePred(editing.id, localScore);
    setSaving(false);
    setEditing(null);
  }

  if (editing) {
    const [h, a] = localScore.split(":").map(Number);
    const hint = h > a ? `Победа ${editing.home_team}` : a > h ? `Победа ${editing.away_team}` : "Ничья";
    const icon = h > a ? "🏠" : a > h ? "✈️" : "🤝";
    function chg(side, d) {
      const p = localScore.split(":").map(Number);
      p[side] = Math.max(0, Math.min(15, p[side] + d));
      setLocalScore(p.join(":"));
    }
    return (
      <Scroll>
        <div style={{ background: C.green, padding: "20px 20px 0" }}>
          <div style={{ fontFamily: F, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Группа {editing.group_name} · {editing.match_date}</div>
          <div style={{ fontFamily: F, fontWeight: 900, fontSize: 22, color: C.white, textTransform: "uppercase", letterSpacing: "-1px", lineHeight: 1, marginBottom: 16 }}>{editing.home_team} VS {editing.away_team}</div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.grayDk, textAlign: "center", marginBottom: 20 }}>Твой прогноз</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 24 }}>
            {[0, 1].map(side => {
              const val = side === 0 ? h : a;
              return (
                <div key={side} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: F, fontSize: 9, fontWeight: 700, color: C.grayDk, textTransform: "uppercase", letterSpacing: .8, marginBottom: 6 }}>{side === 0 ? editing.home_team : editing.away_team}</div>
                  <button onClick={() => chg(side, 1)} style={{ display: "block", width: 60, background: C.black, border: "none", padding: "10px 0", color: C.white, fontSize: 16, cursor: "pointer", fontWeight: 900, margin: "0 auto" }}>▲</button>
                  <div style={{ width: 60, height: 60, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: C.white, fontFamily: F, margin: "0 auto" }}>{val}</div>
                  <button onClick={() => chg(side, -1)} style={{ display: "block", width: 60, background: C.black, border: "none", padding: "10px 0", color: C.white, fontSize: 16, cursor: "pointer", fontWeight: 900, margin: "0 auto" }}>▼</button>
                </div>
              );
            })}
            <div style={{ fontFamily: F, fontSize: 44, fontWeight: 900, color: C.black, marginTop: 8 }}>:</div>
          </div>
          <div style={{ background: C.black, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: C.white, textTransform: "uppercase" }}>{hint}</span>
          </div>
          <Btn full onClick={savePred} disabled={saving}>{saving ? "Сохраняем..." : "💾 Сохранить прогноз"}</Btn>
          <div style={{ marginTop: 4 }}><Btn full variant="ghost" onClick={() => setEditing(null)}>Назад</Btn></div>
        </div>
      </Scroll>
    );
  }

  return (
    <Scroll>
      <GreenHero title="Мои прогнозы" sub="Нажми для изменения" />
      {matches.map((m, i) => {
        const pred = predictions.find(p => p.user_id === user.id && p.match_id === m.id);
        const pts = calcPts(pred?.prediction, m);
        const canEdit = m.home_score === null;
        return (
          <div key={m.id}>
            <div onClick={() => canEdit && openEdit(m)} style={{ display: "flex", alignItems: "center", padding: "13px 20px", background: C.white, cursor: canEdit ? "pointer" : "default" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F, fontWeight: 700, fontSize: 14, color: C.black, textTransform: "uppercase" }}>{m.home_team} — {m.away_team}</div>
                <div style={{ fontFamily: F, fontSize: 10, fontWeight: 600, color: C.grayDk, textTransform: "uppercase", letterSpacing: .5, marginTop: 2 }}>Группа {m.group_name} · {m.match_date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {pts !== null && <span style={{ fontFamily: F, fontSize: 11, fontWeight: 900, padding: "2px 7px", background: pts === 5 ? C.gold : pts >= 1 ? "rgba(45,184,75,.15)" : "rgba(230,50,50,.12)", color: pts === 5 ? C.black : pts >= 1 ? C.green : C.red }}>{pts}pts</span>}
                <div style={{ fontFamily: F, fontWeight: 900, fontSize: 14, padding: "5px 10px", background: pred ? (m.home_score !== null ? C.green : C.black) : "rgba(230,50,50,.1)", color: pred ? C.white : C.red, textTransform: "uppercase" }}>{pred?.prediction || (canEdit ? "Ввести" : "—")}</div>
              </div>
            </div>
            {i < matches.length - 1 && <div style={{ height: 1, background: C.gray }} />}
          </div>
        );
      })}
    </Scroll>
  );
}

// ── LEADERBOARD ────────────────────────────────────────────────────────────
function LB({ user, users, matches, predictions }) {
  const participants = users.filter(u => u.role === "participant" || u.role === "owner");
  const withStats = participants.map(u => ({ ...u, ...calcUserStats(u.id, matches, predictions) }));
  const sorted = [...withStats].sort((a, b) => b.pts - a.pts || b.exact - a.exact);
  const played = matches.filter(m => m.home_score !== null).length;
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <Scroll>
      <div style={{ background: C.green, padding: "20px 20px 0" }}>
        <div style={{ fontFamily: F, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{sorted.length} участников · {played} матч(ей) сыграно</div>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 30, color: C.white, textTransform: "uppercase", letterSpacing: "-1px", marginBottom: 16 }}>Рейтинг</div>
      </div>
      {sorted.map((u, i) => {
        const isMe = u.id === user.id;
        return (
          <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "13px 20px", background: isMe ? C.green : i < 3 ? "#F0FFF4" : C.white, borderBottom: `1px solid ${C.gray}` }}>
            <div style={{ fontFamily: F, fontWeight: 900, fontSize: 16, width: 30, color: isMe ? C.white : i < 3 ? C.gold : C.grayDk }}>{medals[i] || i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F, fontWeight: 700, fontSize: 15, color: isMe ? C.white : C.black, textTransform: "uppercase" }}>{u.name}{isMe ? " ←" : ""}</div>
              <div style={{ fontFamily: F, fontSize: 10, color: isMe ? "rgba(255,255,255,.6)" : C.grayDk, textTransform: "uppercase" }}>⭐ {u.exact} точных</div>
            </div>
            <div style={{ fontFamily: F, fontWeight: 900, fontSize: 22, color: isMe ? C.white : C.green }}>{u.pts}<span style={{ fontSize: 11, marginLeft: 2, opacity: .7 }}>pts</span></div>
          </div>
        );
      })}
    </Scroll>
  );
}

// ── NOTIFICATIONS (static for now) ────────────────────────────────────────
function Notifs({ user, users, matches, predictions }) {
  const participants = users.filter(u => u.role === "participant" || u.role === "owner");
  const withStats = participants.map(u => ({ ...u, ...calcUserStats(u.id, matches, predictions) }));
  const sorted = [...withStats].sort((a, b) => b.pts - a.pts);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <Scroll>
      <GreenHero title="Уведомления" />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ background: C.white, borderLeft: `4px solid ${C.green}` }}>
          <div style={{ background: C.green, padding: "4px 14px" }}><span style={{ fontFamily: F, fontSize: 9, fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: 1 }}>Новое</span></div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontFamily: F, fontWeight: 900, fontSize: 13, color: C.black, textTransform: "uppercase", marginBottom: 6 }}>⚽ ЧМ 2026 в разгаре!</div>
            <div style={{ fontFamily: F, fontSize: 12, color: C.grayDk, lineHeight: 1.5 }}>Ставь прогнозы до начала матчей. Уведомления появятся здесь.</div>
          </div>
        </div>
        {sorted.length > 0 && (
          <div style={{ background: C.white, borderLeft: `4px solid ${C.gray}` }}>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontFamily: F, fontWeight: 900, fontSize: 13, color: C.black, textTransform: "uppercase", marginBottom: 8 }}>🏆 Текущий рейтинг</div>
              {sorted.slice(0, 5).map((u, i) => {
                const isMe = u.id === user.id;
                return (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.gray}` }}>
                    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 11, width: 24, color: i < 3 ? C.gold : C.grayDk }}>{medals[i] || i + 1}</div>
                    <div style={{ flex: 1, fontFamily: F, fontSize: 12, fontWeight: isMe ? 900 : 600, color: isMe ? C.green : C.black, textTransform: "uppercase" }}>{u.name}</div>
                    <div style={{ fontFamily: F, fontWeight: 900, fontSize: 12, color: C.black }}>{u.pts} pts</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Scroll>
  );
}

// ── ADMIN HOME ─────────────────────────────────────────────────────────────
function AdminHome({ setTab, matches, users }) {
  const played = matches.filter(m => m.home_score !== null).length;
  const participants = users.filter(u => u.role === "participant" || u.role === "owner");
  return (
    <Scroll>
      <div style={{ background: C.black, padding: "20px 20px 0" }}>
        <div style={{ fontFamily: F, fontSize: 9, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>CoSports · ЧМ 2026</div>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 32, color: C.white, textTransform: "uppercase", letterSpacing: "-1.5px", lineHeight: .95, marginBottom: 16 }}>ПАНЕЛЬ<br />АДМИНА</div>
        <StatRow items={[[played, "Сыграно", C.green], [matches.length - played, "Осталось", C.white], [participants.length, "Участников", C.white]]} />
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
        {[["⚙️", "Ввести счета", "Результаты матчей", "matches"], ["🏆", "Рейтинг", "Общая таблица", "lb"], ["👥", "Участники", "Управление людьми", "users"], ["📣", "Рассылки", "Уведомления", "blast"]].map(([icon, t, d, id]) => (
          <button key={id} onClick={() => setTab(id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: id === "matches" ? C.green : C.white, border: `1px solid ${C.gray}`, cursor: "pointer", fontFamily: F, textAlign: "left" }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: id === "matches" ? C.white : C.black, textTransform: "uppercase" }}>{t}</div>
              <div style={{ fontSize: 10, color: id === "matches" ? "rgba(255,255,255,.7)" : C.grayDk, textTransform: "uppercase" }}>{d}</div>
            </div>
            <span style={{ color: id === "matches" ? C.white : C.green, fontSize: 18, fontWeight: 900 }}>›</span>
          </button>
        ))}
      </div>
    </Scroll>
  );
}

// ── ADMIN MATCHES ──────────────────────────────────────────────────────────
function AdminMatches({ matches, onUpdateScore }) {
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState({});

  async function save(matchId) {
    const sc = scores[matchId];
    if (!sc || sc[0] === "" || sc[1] === "") return;
    setSaving(s => ({ ...s, [matchId]: true }));
    await onUpdateScore(matchId, parseInt(sc[0]), parseInt(sc[1]));
    setSaving(s => ({ ...s, [matchId]: false }));
  }

  return (
    <Scroll>
      <GreenHero title="Счета матчей" />
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        {matches.map(m => {
          const sc = scores[m.id];
          const hasResult = m.home_score !== null;
          const h = sc?.[0] ?? (hasResult ? String(m.home_score) : "");
          const a = sc?.[1] ?? (hasResult ? String(m.away_score) : "");
          return (
            <div key={m.id} style={{ background: C.white }}>
              <div style={{ background: C.black, padding: "6px 14px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: F, fontSize: 9, fontWeight: 700, color: C.grayDk, textTransform: "uppercase" }}>Группа {m.group_name} · {m.match_date}</span>
                <span style={{ fontFamily: F, fontSize: 9, fontWeight: 700, color: hasResult ? C.green : C.gold, textTransform: "uppercase" }}>{hasResult ? "✓ Завершён" : "Ожидается"}</span>
              </div>
              <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, fontFamily: F, fontWeight: 700, fontSize: 12, color: C.black, textTransform: "uppercase" }}>{m.home_team}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {[0, 1].map(side => (
                    <div key={side} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" min="0" max="20" value={side === 0 ? h : a} placeholder="—"
                        onChange={e => setScores(s => ({ ...s, [m.id]: side === 0 ? [e.target.value, s[m.id]?.[1] ?? a] : [s[m.id]?.[0] ?? h, e.target.value] }))}
                        style={{ width: 42, height: 38, background: hasResult ? C.green : C.black, border: "none", color: C.white, fontSize: 20, fontWeight: 900, textAlign: "center", outline: "none", fontFamily: F }} />
                      {side === 0 && <span style={{ fontFamily: F, fontSize: 18, fontWeight: 900, color: C.grayDk }}>:</span>}
                    </div>
                  ))}
                  <button onClick={() => save(m.id)} disabled={saving[m.id]} style={{ background: C.green, border: "none", color: C.white, fontFamily: F, fontWeight: 900, fontSize: 11, padding: "8px 10px", cursor: "pointer", textTransform: "uppercase" }}>
                    {saving[m.id] ? "..." : "✓"}
                  </button>
                </div>
                <div style={{ flex: 1, fontFamily: F, fontWeight: 700, fontSize: 12, color: C.black, textTransform: "uppercase", textAlign: "right" }}>{m.away_team}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Scroll>
  );
}

// ── ADMIN USERS ────────────────────────────────────────────────────────────
function AdminUsers({ users, onAddUser, onDeleteUser }) {
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPin, setNewPin] = useState(null);

  async function addUser() {
    if (!name.trim()) return;
    setLoading(true);
    const pin = await onAddUser(name.trim());
    setNewPin(pin);
    setName("");
    setLoading(false);
  }

  const participants = users.filter(u => u.role === "participant" || u.role === "owner");
  return (
    <Scroll>
      <GreenHero title="Участники" />
      <div style={{ padding: 16 }}>
        <Btn full onClick={() => { setAdding(!adding); setNewPin(null); }}>+ Добавить участника</Btn>
        {adding && (
          <div style={{ background: C.black, padding: 14, marginTop: 4 }}>
            <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: C.grayDk, textTransform: "uppercase", marginBottom: 8 }}>Имя участника</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Например: Никита"
                style={{ flex: 1, background: "#1a1a1a", border: `2px solid ${C.green}`, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none", fontFamily: F }} />
              <Btn onClick={addUser} disabled={loading || !name.trim()}>{loading ? "..." : "✓"}</Btn>
            </div>
            {newPin && (
              <div style={{ background: "#1a1a1a", padding: 12, textAlign: "center" }}>
                <div style={{ fontFamily: F, fontSize: 10, color: C.grayDk, textTransform: "uppercase", marginBottom: 4 }}>Пин-код добавлен:</div>
                <div style={{ fontFamily: F, fontWeight: 900, fontSize: 28, color: C.green, letterSpacing: 6 }}>{newPin}</div>
                <div style={{ fontFamily: F, fontSize: 9, color: C.grayDk, marginTop: 4, textTransform: "uppercase" }}>Передай участнику!</div>
              </div>
            )}
            <div style={{ fontFamily: F, fontSize: 9, color: C.grayDk, textTransform: "uppercase" }}>Пин генерируется автоматически</div>
          </div>
        )}
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
          {participants.map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "11px 14px", background: C.white }}>
              <div style={{ width: 36, height: 36, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 900, fontSize: 16, color: C.white, marginRight: 12, flexShrink: 0 }}>{u.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F, fontWeight: 700, fontSize: 14, color: C.black, textTransform: "uppercase" }}>{u.name}</div>
                <div style={{ fontFamily: F, fontSize: 10, color: C.grayDk }}>пин: {u.pin}</div>
              </div>
              <Btn sm variant="black" onClick={() => onDeleteUser(u.id)}>✕</Btn>
            </div>
          ))}
        </div>
      </div>
    </Scroll>
  );
}

// ── ADMIN BLAST (static) ───────────────────────────────────────────────────
function AdminBlast() {
  const [sent, setSent] = useState({});
  const OPT = [
    { id: "r1", icon: "⏰", t: "Напомнить — прогноз не поставлен", d: "Только те, кто не ввёл счёт", to: "Участники", p: "⏰ Матч скоро! Поставь прогноз →" },
    { id: "r2", icon: "📣", t: "Рассылка всем участникам", d: "Независимо от статуса", to: "Все", p: "⚽ Сегодня тур ЧМ 2026! Ставь прогнозы →" },
    { id: "r3", icon: "🏁", t: "Разослать итоги тура", d: "Каждому очки + рейтинг", to: "Все", p: "🏁 Итоги матча! Рейтинг обновлён →" },
    { id: "r4", icon: "🎯", t: "Запросить прогноз у всех", d: "Бот напишет каждому лично", to: "Кто не поставил", p: "🎯 Привет! Какой счёт ставишь?" },
  ];
  return (
    <Scroll>
      <GreenHero title="Рассылки" />
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        {OPT.map(o => (
          <div key={o.id} style={{ background: C.white }}>
            <div style={{ background: C.black, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>{o.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F, fontWeight: 900, fontSize: 12, color: C.white, textTransform: "uppercase" }}>{o.t}</div>
                <div style={{ fontFamily: F, fontSize: 9, color: "rgba(255,255,255,.5)", textTransform: "uppercase" }}>{o.d}</div>
              </div>
            </div>
            <div style={{ padding: "10px 14px" }}>
              <div style={{ background: C.offwhite, padding: "8px 12px", borderLeft: `3px solid ${C.green}`, marginBottom: 10 }}>
                <div style={{ fontFamily: F, fontSize: 11, color: C.black, lineHeight: 1.5 }}>{o.p}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: F, fontSize: 10, color: C.grayDk, textTransform: "uppercase" }}>📩 {o.to}</div>
                <Btn sm onClick={() => setSent(s => ({ ...s, [o.id]: true }))} variant={sent[o.id] ? "ghost" : "green"}>{sent[o.id] ? "✓ Отправлено" : "Отправить"}</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Scroll>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [{ data: u }, { data: m }, { data: p }] = await Promise.all([
      SB.from("users").select("*").order("id"),
      SB.from("matches").select("*").order("id"),
      SB.from("predictions").select("*"),
    ]);
    setUsers(u || []);
    setMatches(m || []);
    setPredictions(p || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function onSavePred(matchId, prediction) {
    if (!user) return;
    await SB.from("predictions").upsert({ user_id: user.id, match_id: matchId, prediction }, { onConflict: "user_id,match_id" });
    const { data } = await SB.from("predictions").select("*");
    setPredictions(data || []);
  }

  async function onUpdateScore(matchId, homeScore, awayScore) {
    await SB.from("matches").update({ home_score: homeScore, away_score: awayScore }).eq("id", matchId);
    const { data } = await SB.from("matches").select("*").order("id");
    setMatches(data || []);
  }

  async function onAddUser(name) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const nextId2 = Math.max(0, ...users.map(u => u.id)) + 1;
    await SB.from("users").insert({ id: nextId2, name, pin, role: "participant" });
    const { data } = await SB.from("users").select("*").order("id");
    setUsers(data || []);
    return pin;
  }

  async function onDeleteUser(userId) {
    await SB.from("predictions").delete().eq("user_id", userId);
    await SB.from("users").delete().eq("id", userId);
    const { data } = await SB.from("users").select("*").order("id");
    setUsers(data || []);
  }

  const isAdmin = user?.role === "admin";

  function screen() {
    if (loading) return <Loading />;
    if (!user) return <Login onLogin={u => { setUser(u); setTab("home"); }} users={users} />;
    if (tab === "home") return isAdmin ? <AdminHome setTab={setTab} matches={matches} users={users} /> : <Home user={user} setTab={setTab} matches={matches} predictions={predictions} users={users} />;
    if (tab === "preds") return <Preds user={user} matches={matches} predictions={predictions} onSavePred={onSavePred} />;
    if (tab === "lb") return <LB user={user} users={users} matches={matches} predictions={predictions} />;
    if (tab === "notifs") return <Notifs user={user} users={users} matches={matches} predictions={predictions} />;
    if (tab === "matches") return <AdminMatches matches={matches} onUpdateScore={onUpdateScore} />;
    if (tab === "users") return <AdminUsers users={users} onAddUser={onAddUser} onDeleteUser={onDeleteUser} />;
    if (tab === "blast") return <AdminBlast />;
  }

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", padding: "0 10px 20px" }}>
      <Phone>
        <TgBar onBack={tab !== "home" && user ? () => setTab("home") : null} isAdmin={isAdmin} />
        {screen()}
        {user && !loading && <Nav tab={tab} setTab={setTab} isAdmin={isAdmin} />}
      </Phone>
    </div>
  );
}
