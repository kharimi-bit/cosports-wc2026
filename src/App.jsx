import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SB = createClient(
  "https://wwokzpwpuyhzyzrilwqf.supabase.co",
  "sb_publishable_1W3qG4dISoadczV5sWKoeQ_-XXoTAwP"
);


const FOOTBALL_API_KEY = "0d22e427b4a24923b0a88cc1a809d1ed"; // football-data.org
const C = {
  green:"#2DB84B", greenDk:"#228F3A", black:"#0A0A0A",
  white:"#FFFFFF", offwhite:"#F2F2F2", gray:"#E0E0E0",
  grayDk:"#AAAAAA", card:"#F7F7F7", gold:"#F5C842", red:"#E63232",
};
const F = "system-ui,-apple-system,'Helvetica Neue',sans-serif";

function calcPts(pred, match) {
  if (!pred || match.home_score === null || match.away_score === null ||
      match.home_score === undefined || match.away_score === undefined) return null;
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

function fmtDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return `${d.getDate().toString().padStart(2,"0")}.${(d.getMonth()+1).toString().padStart(2,"0")} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}

function LogoSVG({ size=32, light=false }) {
  const fg = light ? "#2DB84B" : "#FFFFFF";
  const bg = light ? "#FFFFFF" : "#2DB84B";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill={bg}/>
      <polygon points="20,8 25,12 23,18 17,18 15,12" fill={fg} opacity="0.25"/>
      <polygon points="28,14 34,16 33,22 28,25 24,21 25,15" fill={fg} opacity="0.18"/>
      <polygon points="12,14 16,15 17,21 13,25 7,22 6,16" fill={fg} opacity="0.18"/>
      <text x="20" y="25" textAnchor="middle" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="900" fontSize="13" fill={fg} letterSpacing="-0.5">CS</text>
    </svg>
  );
}

function StatRow({ items }) {
  return (
    <div style={{display:"flex",gap:2}}>
      {items.map(([v,l,c]) => (
        <div key={l} style={{flex:1,background:C.white,padding:"10px 6px",textAlign:"center"}}>
          <div style={{fontFamily:F,fontWeight:900,fontSize:22,color:c||C.black,textTransform:"uppercase"}}>{v}</div>
          <div style={{fontFamily:F,fontSize:9,color:C.grayDk,textTransform:"uppercase",letterSpacing:.8,fontWeight:600}}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function Btn({ children, onClick, variant="green", full, sm }) {
  const base = {fontFamily:F,fontWeight:900,fontSize:sm?11:14,textTransform:"uppercase",letterSpacing:.5,border:"none",cursor:"pointer",padding:sm?"8px 12px":"13px 18px",borderRadius:0,display:"block",width:full?"100%":"auto"};
  const v = {
    green: {...base,background:C.green,color:C.white},
    black: {...base,background:C.black,color:C.white},
    white: {...base,background:C.white,color:C.black,border:`2px solid ${C.black}`},
    ghost: {...base,background:"transparent",color:C.grayDk,border:`1px solid ${C.gray}`},
  };
  return <button onClick={onClick} style={v[variant]||v.green}>{children}</button>;
}

function Scroll({ children }) {
  return <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",background:C.offwhite}}>{children}</div>;
}

function Phone({ children }) {
  return (
    <div style={{background:"#111",borderRadius:44,padding:12,maxWidth:400,margin:"20px auto",boxShadow:"0 30px 80px rgba(0,0,0,.65)"}}>
      <div style={{width:120,height:26,background:"#111",borderRadius:"0 0 16px 16px",margin:"0 auto 4px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <div style={{width:10,height:10,background:"#222",borderRadius:"50%"}}/>
        <div style={{width:60,height:5,background:"#222",borderRadius:3}}/>
      </div>
      <div style={{background:C.offwhite,borderRadius:34,overflow:"hidden",height:760,display:"flex",flexDirection:"column"}}>{children}</div>
    </div>
  );
}

function TgBar({ onBack, isAdmin }) {
  return (
    <div style={{background:C.black,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
      {onBack && <span onClick={onBack} style={{color:C.green,fontSize:24,cursor:"pointer",fontWeight:900,lineHeight:1,marginRight:2}}>‹</span>}
      <div style={{width:32,height:32,background:C.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <LogoSVG size={28} light={false}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:13,color:C.white,textTransform:"uppercase",letterSpacing:.5}}>CoSports · ЧМ 2026</div>
        <div style={{fontFamily:F,fontSize:9,color:C.green,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>{isAdmin?"● ADMIN":"● ONLINE"}</div>
      </div>
    </div>
  );
}

function Nav({ tab, setTab, isAdmin, canEditScores }) {
  const tabs = isAdmin
    ? [["home","⚽","Главная"],["matches","⚙️","Счета"],["lb","🏆","Рейтинг"],["users","👥","Люди"],["blast","📣","Рассылки"]]
    : canEditScores
    ? [["home","⚽","Главная"],["preds","✏️","Прогнозы"],["matches","⚙️","Счета"],["lb","🏆","Рейтинг"],["notifs","🔔","Уведом."]]
    : [["home","⚽","Главная"],["preds","✏️","Прогнозы"],["lb","🏆","Рейтинг"],["notifs","🔔","Уведом."]];
  return (
    <div style={{display:"flex",background:C.black,flexShrink:0}}>
      {tabs.map(([id,icon,label]) => (
        <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,border:"none",background:tab===id?C.green:"transparent",cursor:"pointer",padding:"10px 2px"}}>
          <span style={{fontSize:17}}>{icon}</span>
          <span style={{fontFamily:F,fontSize:8,fontWeight:700,color:tab===id?C.white:C.grayDk,textTransform:"uppercase",letterSpacing:.3}}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [sel, setSel] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SB.from("users").select("*").then(({ data }) => { setUsers(data||[]); setLoading(false); });
  }, []);

  const parts = users.filter(u =>
    (u.role === "participant" || u.role === "owner" || u.role === "admin") && u.id !== 98
  );

  function go() {
    const u = users.find(u => u.id === sel && u.pin === pin);
    if (u) { setErr(false); onLogin(u); }
    else { setErr(true); setPin(""); }
  }

  if (loading) return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontFamily:F,fontSize:14,fontWeight:700,color:C.grayDk,textTransform:"uppercase"}}>Загрузка...</div>
    </div>
  );

  return (
    <Scroll>
      <div style={{background:C.green,padding:"28px 20px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:44,height:44,background:C.white,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <LogoSVG size={38} light={true}/>
          </div>
          <div style={{fontFamily:F,fontWeight:900,fontSize:20,color:C.white,textTransform:"uppercase",letterSpacing:"-0.5px",lineHeight:1.1}}>
            CoSports<br/><span style={{fontSize:12,fontWeight:600,opacity:.8,letterSpacing:1}}>ЧМ 2026 · ПРОГНОЗЫ</span>
          </div>
        </div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:34,color:C.white,textTransform:"uppercase",letterSpacing:"-1.5px",lineHeight:.95}}>ВЫБЕРИ<br/>УЧАСТНИКА</div>
      </div>
      <div style={{padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,marginBottom:16}}>
          {parts.map(u => (
            <button key={u.id} onClick={()=>{setSel(u.id);setErr(false);setPin("");}} style={{
              background:sel===u.id?C.green:C.white,border:`2px solid ${sel===u.id?C.green:C.gray}`,
              borderRadius:0,padding:"11px 6px",color:sel===u.id?C.white:C.black,
              fontFamily:F,fontSize:13,fontWeight:700,cursor:"pointer",textTransform:"uppercase"
            }}>{u.name}</button>
          ))}
        </div>
        <div style={{background:C.white,padding:16}}>
          <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.grayDk,marginBottom:12}}>Пин-код</div>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:err?8:16}}>
            {[0,1,2,3].map(i => <div key={i} style={{width:16,height:16,borderRadius:"50%",background:pin.length>i?C.green:C.gray,transition:"background .15s"}}/>)}
          </div>
          {err && <div style={{fontFamily:F,fontSize:11,fontWeight:700,color:C.red,textAlign:"center",textTransform:"uppercase",marginBottom:10}}>Неверный пин-код</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,marginBottom:12}}>
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d,i) => (
              <button key={i} onClick={()=>{
                if(d==="⌫"){setPin(p=>p.slice(0,-1));setErr(false);}
                else if(d!==""&&pin.length<4){setPin(p=>p+d);setErr(false);}
              }} style={{background:d===""?"transparent":C.black,border:"none",padding:"14px 0",color:C.white,fontFamily:F,fontSize:20,fontWeight:900,cursor:d===""?"default":"pointer",visibility:d===""?"hidden":"visible"}}>
                {d}
              </button>
            ))}
          </div>
          <Btn onClick={go} variant={sel&&pin.length===4?"green":"ghost"} full>
            {sel&&pin.length===4?"Войти →":"Выбери имя + введи пин"}
          </Btn>
        </div>
      </div>
    </Scroll>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
function Home({ user, users, matches, predictions, setTab }) {
  const participants = users.filter(u =>
    (u.role==="participant"||u.role==="owner"||u.role==="admin") && u.id !== 98
  );
  const ranked = [...participants]
    .map(u => ({...u,...calcUserStats(u.id,matches,predictions)}))
    .sort((a,b)=>b.pts-a.pts||b.exact-a.exact);
  const myStats = calcUserStats(user.id, matches, predictions);
  const rank = ranked.findIndex(u=>u.id===user.id)+1;
  const played = matches.filter(m=>m.home_score!==null&&m.away_score!==null).length;
  const next = matches.find(m=>m.home_score===null||m.away_score===null);
  const myPred = next ? predictions.find(p=>p.user_id===user.id&&p.match_id===next.id) : null;
  const medals = ["🥇","🥈","🥉"];

  return (
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontSize:10,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Привет,</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:34,color:C.white,textTransform:"uppercase",letterSpacing:"-1.5px",lineHeight:.95,marginBottom:16}}>{user.name}</div>
        <StatRow items={[[myStats.pts,"Очков",C.black],[`#${rank}`,"Место",C.green],[`${played}/24`,"Матчей",C.black]]}/>
      </div>

      {next && (
        <div style={{padding:16}}>
          <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.grayDk,marginBottom:8}}>Ближайший матч</div>
          <div style={{background:C.black,padding:16}}>
            <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Группа {next.group_name} · {fmtDate(next.match_date)}</div>
            <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
              <div style={{flex:1,fontFamily:F,fontWeight:900,fontSize:16,color:C.white,textTransform:"uppercase"}}>{next.home_team}</div>
              <div style={{fontFamily:F,fontSize:11,color:C.grayDk,padding:"0 8px",fontWeight:700}}>VS</div>
              <div style={{flex:1,fontFamily:F,fontWeight:900,fontSize:16,color:C.white,textTransform:"uppercase",textAlign:"right"}}>{next.away_team}</div>
            </div>
            <div style={{fontFamily:F,fontSize:11,color:C.grayDk,marginBottom:12,textTransform:"uppercase"}}>
              Прогноз: <span style={{color:C.green,fontWeight:700}}>{myPred?.prediction||"не введён"}</span>
            </div>
            <Btn onClick={()=>setTab("preds")} full>{myPred?.prediction?"Изменить прогноз":"⚡ Ввести прогноз"}</Btn>
          </div>
        </div>
      )}

      <div style={{margin:"0 16px 16px",background:C.black,position:"relative",overflow:"hidden"}}>
        <div style={{padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:18}}>🏆</span>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.grayDk,textTransform:"uppercase",letterSpacing:1}}>Партнёр турнира</div>
            <div style={{fontFamily:F,fontSize:13,fontWeight:900,color:C.green,textTransform:"uppercase"}}>ВАША РЕКЛАМА</div>
          </div>
          <div style={{fontFamily:F,fontSize:9,color:C.grayDk,textTransform:"uppercase"}}>cosports.uz</div>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:C.green}}/>
      </div>

      <div style={{padding:"0 16px 16px"}}>
        <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.grayDk,marginBottom:8}}>Топ участников</div>
        {ranked.slice(0,5).map((u,i) => {
          const me = u.id === user.id;
          return (
            <div key={u.id} style={{display:"flex",alignItems:"center",padding:"11px 14px",background:me?C.green:C.white,marginBottom:3}}>
              <div style={{fontFamily:F,fontWeight:900,fontSize:13,width:26,color:me?C.white:i===0?C.gold:C.grayDk}}>{medals[i]||i+1}</div>
              <div style={{flex:1,fontFamily:F,fontWeight:700,fontSize:14,color:me?C.white:C.black,textTransform:"uppercase"}}>{u.name}{me?" ←":""}</div>
              <div style={{fontFamily:F,fontWeight:900,fontSize:18,color:me?C.white:C.green}}>{u.pts}<span style={{fontSize:10,marginLeft:2,opacity:.7}}>pts</span></div>
            </div>
          );
        })}
        <div style={{marginTop:4}}><Btn onClick={()=>setTab("lb")} variant="white" full sm>Полный рейтинг →</Btn></div>
      </div>
      <div style={{padding:"0 16px 16px"}}>
        <a href="https://t.me/kimftbl" target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"12px",background:C.black,color:C.green,fontFamily:F,fontWeight:700,fontSize:12,textDecoration:"none",textTransform:"uppercase",letterSpacing:1}}>
          📱 Наш Telegram-чат
        </a>
      </div>
    </Scroll>
  );
}

// ─── PREDS ───────────────────────────────────────────────────────────────────
function Preds({ user, matches, predictions, onSave }) {
  const [editing, setEditing] = useState(null);
  const [localPreds, setLocalPreds] = useState({});

  if (editing !== null) {
    const m = matches.find(x => x.id === editing);
    const existing = localPreds[m.id] || predictions.find(p=>p.user_id===user.id&&p.match_id===m.id)?.prediction || "0:0";
    const [h, a] = existing.split(":").map(Number);
    const hint = h>a?`Победа ${m.home_team}`:a>h?`Победа ${m.away_team}`:"Ничья";
    const icon = h>a?"🏠":a>h?"✈️":"🤝";

    function chg(side, d) {
      const parts = existing.split(":").map(Number);
      parts[side] = Math.max(0, Math.min(15, parts[side]+d));
      setLocalPreds(s => ({...s,[m.id]:parts.join(":")}));
    }

    async function save() {
      const pred = localPreds[m.id] || existing;
      await SB.from("predictions").upsert({user_id:user.id,match_id:m.id,prediction:pred},{onConflict:"user_id,match_id"});
      onSave();
      setEditing(null);
    }

    return (
      <Scroll>
        <div style={{background:C.green,padding:"20px 20px 0"}}>
          <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Группа {m.group_name} · {fmtDate(m.match_date)}</div>
          <div style={{fontFamily:F,fontWeight:900,fontSize:22,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",lineHeight:1,marginBottom:16}}>{m.home_team} VS {m.away_team}</div>
        </div>
        <div style={{padding:20}}>
          <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.grayDk,textAlign:"center",marginBottom:20}}>Твой прогноз</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:24}}>
            {[0,1].map(side => {
              const val = side===0?h:a;
              return (
                <div key={side} style={{textAlign:"center"}}>
                  <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.grayDk,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>{side===0?m.home_team:m.away_team}</div>
                  <button onClick={()=>chg(side,1)} style={{display:"block",width:60,background:C.black,border:"none",padding:"10px 0",color:C.white,fontSize:16,cursor:"pointer",fontWeight:900,margin:"0 auto"}}>▲</button>
                  <div style={{width:60,height:60,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:900,color:C.white,fontFamily:F,margin:"0 auto"}}>{val}</div>
                  <button onClick={()=>chg(side,-1)} style={{display:"block",width:60,background:C.black,border:"none",padding:"10px 0",color:C.white,fontSize:16,cursor:"pointer",fontWeight:900,margin:"0 auto"}}>▼</button>
                </div>
              );
            })}
            <div style={{fontFamily:F,fontSize:44,fontWeight:900,color:C.black,marginTop:8}}>:</div>
          </div>
          <div style={{background:C.black,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{icon}</span>
            <span style={{fontFamily:F,fontSize:13,fontWeight:700,color:C.white,textTransform:"uppercase"}}>{hint}</span>
          </div>
          <Btn full onClick={save}>💾 Сохранить прогноз</Btn>
          <div style={{marginTop:4}}><Btn full variant="ghost" onClick={()=>setEditing(null)}>Назад</Btn></div>
        </div>
      </Scroll>
    );
  }

  return (
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Нажми для изменения</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Мои прогнозы</div>
      </div>
      {matches.map((m,i) => {
        const pred = localPreds[m.id] || predictions.find(p=>p.user_id===user.id&&p.match_id===m.id)?.prediction;
        const pts = calcPts(pred, m);
        const played = m.home_score!==null&&m.away_score!==null;
        const can = !played;
        return (
          <div key={m.id}>
            <div onClick={()=>can&&setEditing(m.id)} style={{display:"flex",alignItems:"center",padding:"13px 20px",background:C.white,cursor:can?"pointer":"default"}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:F,fontWeight:700,fontSize:14,color:C.black,textTransform:"uppercase"}}>{m.home_team} — {m.away_team}</div>
                <div style={{fontFamily:F,fontSize:10,fontWeight:600,color:C.grayDk,textTransform:"uppercase",letterSpacing:.5,marginTop:2}}>Группа {m.group_name} · {fmtDate(m.match_date)}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {played && <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:C.grayDk}}>{m.home_score}:{m.away_score}</span>}
                {pts!==null && <span style={{fontFamily:F,fontSize:11,fontWeight:900,padding:"2px 7px",background:pts===5?C.gold:pts>=1?"rgba(45,184,75,.15)":"rgba(230,50,50,.12)",color:pts===5?C.black:pts>=1?C.green:C.red}}>{pts}pts</span>}
                <div style={{fontFamily:F,fontWeight:900,fontSize:14,padding:"5px 10px",background:pred?(played?C.green:C.black):"rgba(230,50,50,.1)",color:pred?C.white:C.red,textTransform:"uppercase"}}>{pred||(can?"Ввести":"—")}</div>
              </div>
            </div>
            {i<matches.length-1&&<div style={{height:1,background:C.gray}}/>}
          </div>
        );
      })}
    </Scroll>
  );
}

// ─── USER PREDS (view another user's predictions) ─────────────────────────────
function UserPreds({ viewUser, matches, predictions, onBack }) {
  const { pts, exact } = calcUserStats(viewUser.id, matches, predictions);
  const played = matches.filter(m=>m.home_score!==null&&m.away_score!==null).length;
  const medals = ["🥇","🥈","🥉"];

  return (
    <Scroll>
      <div style={{background:C.black,padding:"20px 20px 0"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.green,fontFamily:F,fontWeight:700,fontSize:12,textTransform:"uppercase",cursor:"pointer",marginBottom:8,padding:0}}>‹ Рейтинг</button>
        <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.grayDk,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Прогнозы участника</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",lineHeight:1,marginBottom:16}}>{viewUser.name}</div>
        <StatRow items={[[pts,"Очков",C.green],[`⭐${exact}`,"Точных",C.gold],[`${played}/24`,"Сыграно",C.white]]}/>
      </div>
      {matches.map((m,i) => {
        const pred = predictions.find(p=>p.user_id===viewUser.id&&p.match_id===m.id)?.prediction;
        const pts = calcPts(pred, m);
        const played = m.home_score!==null&&m.away_score!==null;
        return (
          <div key={m.id}>
            <div style={{display:"flex",alignItems:"center",padding:"13px 20px",background:C.white}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:F,fontWeight:700,fontSize:14,color:C.black,textTransform:"uppercase"}}>{m.home_team} — {m.away_team}</div>
                <div style={{fontFamily:F,fontSize:10,color:C.grayDk,textTransform:"uppercase",marginTop:2}}>Группа {m.group_name} · {fmtDate(m.match_date)}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {played && <span style={{fontFamily:F,fontSize:11,fontWeight:700,color:C.grayDk}}>{m.home_score}:{m.away_score}</span>}
                {pts!==null && <span style={{fontFamily:F,fontSize:11,fontWeight:900,padding:"2px 7px",background:pts===5?C.gold:pts>=1?"rgba(45,184,75,.15)":"rgba(230,50,50,.12)",color:pts===5?C.black:pts>=1?C.green:C.red}}>{pts}pts</span>}
                <div style={{fontFamily:F,fontWeight:900,fontSize:14,padding:"5px 10px",background:pred?(played?C.green:C.black):"rgba(230,50,50,.1)",color:pred?C.white:C.red,textTransform:"uppercase"}}>{pred||"—"}</div>
              </div>
            </div>
            {i<matches.length-1&&<div style={{height:1,background:C.gray}}/>}
          </div>
        );
      })}
    </Scroll>
  );
}

// ─── ALL PREDS (all participants by match) ────────────────────────────────────
function AllPreds({ user, users, matches, predictions }) {
  const participants = users.filter(u =>
    (u.role==="participant"||u.role==="owner"||u.role==="admin") && u.id !== 98
  );
  const ranked = [...participants]
    .map(u => ({...u,...calcUserStats(u.id,matches,predictions)}))
    .sort((a,b)=>b.pts-a.pts||b.exact-a.exact);

  return (
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 16px"}}>
        <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Все участники · все матчи</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px"}}>Все прогнозы</div>
      </div>
      {matches.map(m => {
        const played = m.home_score!==null&&m.away_score!==null;
        return (
          <div key={m.id} style={{marginBottom:4}}>
            <div style={{background:C.black,padding:"10px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontFamily:F,fontWeight:900,fontSize:13,color:C.white,textTransform:"uppercase"}}>{m.home_team} — {m.away_team}</div>
                  <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.grayDk,textTransform:"uppercase",marginTop:2}}>Группа {m.group_name} · {fmtDate(m.match_date)}</div>
                </div>
                {played
                  ? <div style={{fontFamily:F,fontWeight:900,fontSize:20,color:C.green}}>{m.home_score}:{m.away_score}</div>
                  : <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.gold,textTransform:"uppercase"}}>Ожидается</div>
                }
              </div>
            </div>
            {ranked.map((u,ri) => {
              const pred = predictions.find(p=>p.user_id===u.id&&p.match_id===m.id)?.prediction;
              const pts = calcPts(pred, m);
              const me = u.id === user.id;
              return (
                <div key={u.id} style={{display:"flex",alignItems:"center",padding:"9px 16px",background:me?"#E8FAE8":ri%2===0?C.white:C.offwhite,borderBottom:`1px solid ${C.gray}`}}>
                  <div style={{fontFamily:F,fontSize:11,fontWeight:700,width:22,color:C.grayDk}}>#{ri+1}</div>
                  <div style={{flex:1,fontFamily:F,fontWeight:700,fontSize:13,color:C.black,textTransform:"uppercase"}}>{u.name}{me?" ←":""}</div>
                  {pts!==null && <span style={{fontFamily:F,fontSize:10,fontWeight:900,padding:"2px 6px",marginRight:6,background:pts===5?C.gold:pts>=1?"rgba(45,184,75,.15)":"rgba(230,50,50,.12)",color:pts===5?C.black:pts>=1?C.green:C.red}}>{pts}pts</span>}
                  <div style={{fontFamily:F,fontWeight:900,fontSize:13,padding:"4px 9px",background:pred?(played?C.green:C.black):"rgba(230,50,50,.1)",color:pred?C.white:C.red,textTransform:"uppercase",minWidth:40,textAlign:"center"}}>{pred||"—"}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </Scroll>
  );
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function LB({ user, users, matches, predictions }) {
  const [viewUser, setViewUser] = useState(null);
  const [mode, setMode] = useState("lb");

  const participants = users.filter(u =>
    (u.role==="participant"||u.role==="owner"||u.role==="admin") && u.id !== 98
  );
  const ranked = [...participants]
    .map(u => ({...u,...calcUserStats(u.id,matches,predictions)}))
    .sort((a,b)=>b.pts-a.pts||b.exact-a.exact);
  const played = matches.filter(m=>m.home_score!==null&&m.away_score!==null).length;
  const medals = ["🥇","🥈","🥉"];

  if (viewUser) {
    return <UserPreds viewUser={viewUser} matches={matches} predictions={predictions} onBack={()=>setViewUser(null)}/>;
  }

  const Toggle = () => (
    <div style={{background:C.black,padding:"8px 12px",display:"flex",gap:4,flexShrink:0}}>
      <button onClick={()=>setMode("lb")} style={{flex:1,padding:"8px 0",background:mode==="lb"?C.green:C.offwhite,border:"none",fontFamily:F,fontWeight:700,fontSize:11,textTransform:"uppercase",cursor:"pointer",color:mode==="lb"?C.white:C.black}}>🏆 Рейтинг</button>
      <button onClick={()=>setMode("all")} style={{flex:1,padding:"8px 0",background:mode==="all"?C.green:C.offwhite,border:"none",fontFamily:F,fontWeight:700,fontSize:11,textTransform:"uppercase",cursor:"pointer",color:mode==="all"?C.white:C.black}}>📋 Все прогнозы</button>
    </div>
  );

  if (mode === "all") {
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <Toggle/>
        <AllPreds user={user} users={users} matches={matches} predictions={predictions}/>
      </div>
    );
  }

  return (
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{ranked.length} участников · {played} матчей сыграно</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Рейтинг</div>
      </div>
      <Toggle/>
      <div style={{fontFamily:F,fontSize:9,color:C.grayDk,textTransform:"uppercase",textAlign:"center",letterSpacing:.8,padding:"6px 0 4px"}}>Нажми на участника чтобы посмотреть его прогнозы</div>
      {ranked.map((u,i) => {
        const me = u.id === user.id;
        return (
          <div key={u.id} onClick={()=>setViewUser(u)} style={{display:"flex",alignItems:"center",padding:"13px 20px",background:me?C.green:i<3?"#F0FFF4":C.white,borderBottom:`1px solid ${C.gray}`,cursor:"pointer"}}>
            <div style={{fontFamily:F,fontWeight:900,fontSize:16,width:30,color:me?C.white:i<3?C.gold:C.grayDk}}>{medals[i]||i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:F,fontWeight:700,fontSize:15,color:me?C.white:C.black,textTransform:"uppercase"}}>{u.name}{me?" ←":""}</div>
              <div style={{fontFamily:F,fontSize:10,color:me?"rgba(255,255,255,.6)":C.grayDk,textTransform:"uppercase"}}>⭐ {u.exact} точных</div>
            </div>
            <div style={{fontFamily:F,fontWeight:900,fontSize:22,color:me?C.white:C.green}}>{u.pts}<span style={{fontSize:11,marginLeft:2,opacity:.7}}>pts</span></div>
            <span style={{color:me?C.white:C.grayDk,fontSize:16,marginLeft:8,fontWeight:900}}>›</span>
          </div>
        );
      })}
    </Scroll>
  );
}

// ─── NOTIFS ──────────────────────────────────────────────────────────────────
function Notifs({ user, users, matches, predictions }) {
  const participants = users.filter(u=>
    (u.role==="participant"||u.role==="owner"||u.role==="admin") && u.id !== 98
  );
  const ranked = [...participants]
    .map(u=>({...u,...calcUserStats(u.id,matches,predictions)}))
    .sort((a,b)=>b.pts-a.pts||b.exact-a.exact);
  const myStats = calcUserStats(user.id, matches, predictions);
  const lastPlayed = [...matches].reverse().find(m=>m.home_score!==null&&m.away_score!==null);
  const next = matches.find(m=>m.home_score===null||m.away_score===null);
  const myNextPred = next ? predictions.find(p=>p.user_id===user.id&&p.match_id===next.id) : null;
  const medals = ["🥇","🥈","🥉"];

  return (
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Уведомления</div>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:6}}>
        {next && !myNextPred && (
          <div style={{background:C.white,borderLeft:`4px solid ${C.green}`}}>
            <div style={{background:C.green,padding:"4px 14px"}}><span style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.white,textTransform:"uppercase",letterSpacing:1}}>Новое</span></div>
            <div style={{padding:"12px 14px"}}>
              <div style={{fontFamily:F,fontWeight:900,fontSize:13,color:C.black,textTransform:"uppercase",marginBottom:6}}>⏰ Поставь прогноз!</div>
              <div style={{fontFamily:F,fontSize:12,color:C.grayDk,lineHeight:1.5}}>Ближайший матч: {next.home_team} — {next.away_team}. Прогноз ещё не введён.</div>
            </div>
          </div>
        )}
        {lastPlayed && (
          <div style={{background:C.white,borderLeft:`4px solid ${C.gray}`}}>
            <div style={{padding:"12px 14px"}}>
              <div style={{fontFamily:F,fontWeight:900,fontSize:13,color:C.black,textTransform:"uppercase",marginBottom:6}}>🏁 Итоги: {lastPlayed.home_team} {lastPlayed.home_score}:{lastPlayed.away_score} {lastPlayed.away_team}</div>
              <div style={{border:`1px solid ${C.gray}`,marginBottom:10}}>
                <div style={{background:C.black,padding:"6px 12px"}}><span style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:1}}>Рейтинг</span></div>
                {ranked.slice(0,5).map((p,i) => {
                  const me = p.id === user.id;
                  return (
                    <div key={p.id} style={{display:"flex",alignItems:"center",padding:"6px 12px",background:me?C.green:"transparent",borderBottom:`1px solid ${C.gray}`}}>
                      <div style={{fontFamily:F,fontWeight:900,fontSize:11,width:20,color:me?C.white:i<3?C.gold:C.grayDk}}>{medals[i]||i+1}</div>
                      <div style={{flex:1,fontFamily:F,fontSize:12,fontWeight:700,color:me?C.white:C.black,textTransform:"uppercase"}}>{p.name}{me?" ←":""}</div>
                      <div style={{fontFamily:F,fontWeight:900,fontSize:12,color:me?C.white:C.black}}>{p.pts}pts</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div style={{background:C.white,borderLeft:`4px solid ${C.gray}`,padding:"12px 14px"}}>
          <div style={{fontFamily:F,fontWeight:900,fontSize:13,color:C.black,textTransform:"uppercase",marginBottom:4}}>📊 Мои очки</div>
          <div style={{fontFamily:F,fontSize:12,color:C.grayDk,lineHeight:1.5}}>Всего: <b style={{color:C.black}}>{myStats.pts} очков</b> · Точных: <b style={{color:C.gold}}>⭐ {myStats.exact}</b></div>
        </div>
      </div>
    </Scroll>
  );
}

// ─── ADMIN HOME ───────────────────────────────────────────────────────────────
function AdminHome({ setTab, matches, users }) {
  const played = matches.filter(m=>m.home_score!==null&&m.away_score!==null).length;
  const participants = users.filter(u=>(u.role==="participant"||u.role==="owner"||u.role==="admin")&&u.id!==98);
  return (
    <Scroll>
      <div style={{background:C.black,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>CoSports · ЧМ 2026</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:32,color:C.white,textTransform:"uppercase",letterSpacing:"-1.5px",lineHeight:.95,marginBottom:16}}>ПАНЕЛЬ<br/>АДМИНА</div>
        <StatRow items={[[played,"Сыграно",C.green],[matches.length-played,"Осталось",C.white],[participants.length,"Участников",C.white]]}/>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:4}}>
        {[["⚙️","Ввести счета","Результаты матчей","matches"],["🏆","Рейтинг","Общая таблица","lb"],["👥","Участники","Управление людьми","users"],["📣","Рассылки","Уведомления и напоминания","blast"]].map(([icon,t,d,id]) => (
          <button key={id} onClick={()=>setTab(id)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:id==="matches"?C.green:C.white,border:`1px solid ${C.gray}`,cursor:"pointer",fontFamily:F,textAlign:"left"}}>
            <span style={{fontSize:22}}>{icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:900,fontSize:14,color:id==="matches"?C.white:C.black,textTransform:"uppercase"}}>{t}</div>
              <div style={{fontSize:10,color:id==="matches"?"rgba(255,255,255,.7)":C.grayDk,textTransform:"uppercase"}}>{d}</div>
            </div>
            <span style={{color:id==="matches"?C.white:C.green,fontSize:18,fontWeight:900}}>›</span>
          </button>
        ))}
      </div>
    </Scroll>
  );
}

// ─── ADMIN MATCHES ────────────────────────────────────────────────────────────
function AdminMatches({ matches, onUpdateScore }) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  async function autoSync() {
    if (!FOOTBALL_API_KEY) { setSyncMsg("⚠️ API ключ не задан. Вставьте ключ с football-data.org в код."); return; }
    setSyncing(true); setSyncMsg("Синхронизация...");
    try {
      const r = await fetch("https://api.football-data.org/v4/competitions/2000/matches?status=FINISHED", {headers:{"X-Auth-Token":FOOTBALL_API_KEY}});
      const data = await r.json();
      let updated = 0;
      for (const apiMatch of data.matches||[]) {
        const ht = apiMatch.homeTeam?.name; const at = apiMatch.awayTeam?.name;
        const hs = apiMatch.score?.fullTime?.home; const as = apiMatch.score?.fullTime?.away;
        if (hs===null||hs===undefined||as===null||as===undefined) continue;
        const local = matches.find(m => {
          const mh = m.home_team?.toLowerCase()||""; const ma = m.away_team?.toLowerCase()||"";
          const ah = ht?.toLowerCase()||""; const aa = at?.toLowerCase()||"";
          return (mh.includes(ah.split(" ")[0])||ah.includes(mh.split(" ")[0])) &&
                 (ma.includes(aa.split(" ")[0])||aa.includes(ma.split(" ")[0]));
        });
        if (local && (local.home_score!==hs||local.away_score!==as)) {
          await SB.from("matches").update({home_score:hs,away_score:as}).eq("id",local.id);
          updated++;
        }
      }
      setSyncMsg(`✅ Готово. Обновлено: ${updated} матчей.`);
      onUpdateScore();
    } catch(e) { setSyncMsg("❌ Ошибка: "+e.message); }
    setSyncing(false);
  }

  return (
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Счета матчей</div>
      </div>
      <div style={{padding:"12px 12px 4px"}}>
        <Btn full onClick={autoSync} variant="black">{syncing?"⏳ Синхронизация...":"🔄 Авто-синк football-data.org"}</Btn>
        {syncMsg && <div style={{fontFamily:F,fontSize:11,color:C.grayDk,textTransform:"uppercase",padding:"6px 0",textAlign:"center"}}>{syncMsg}</div>}
      </div>
      <div style={{padding:"4px 12px",display:"flex",flexDirection:"column",gap:4}}>
        {matches.map(m => {
          const played = m.home_score!==null&&m.away_score!==null;
          return (
            <div key={m.id} style={{background:C.white}}>
              <div style={{background:C.black,padding:"6px 14px",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.grayDk,textTransform:"uppercase"}}>Группа {m.group_name} · {fmtDate(m.match_date)}</span>
                <span style={{fontFamily:F,fontSize:9,fontWeight:700,color:played?C.green:C.gold,textTransform:"uppercase"}}>{played?"✓ Завершён":"Ожидается"}</span>
              </div>
              <div style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,fontFamily:F,fontWeight:700,fontSize:12,color:C.black,textTransform:"uppercase"}}>{m.home_team}</div>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  {[0,1].map(side => (
                    <div key={side} style={{display:"flex",alignItems:"center",gap:3}}>
                      <input type="number" min="0" max="20"
                        defaultValue={side===0?m.home_score??"":(m.away_score??"")}
                        placeholder="—"
                        style={{width:42,height:38,background:played?C.green:C.black,border:"none",color:C.white,fontSize:20,fontWeight:900,textAlign:"center",outline:"none",fontFamily:F}}
                        onChange={async e => {
                          const v = parseInt(e.target.value);
                          if (isNaN(v)) return;
                          const upd = side===0?{home_score:v}:{away_score:v};
                          await SB.from("matches").update(upd).eq("id",m.id);
                          onUpdateScore();
                        }}/>
                      {side===0 && <span style={{fontFamily:F,fontSize:18,fontWeight:900,color:C.grayDk}}>:</span>}
                    </div>
                  ))}
                </div>
                <div style={{flex:1,fontFamily:F,fontWeight:700,fontSize:12,color:C.black,textTransform:"uppercase",textAlign:"right"}}>{m.away_team}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Scroll>
  );
}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
function AdminUsers({ users, onRefresh }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const participants = users.filter(u=>(u.role==="participant"||u.role==="owner"||u.role==="admin")&&u.id!==98);

  async function addUser() {
    if (!newName.trim()) return;
    const pin = Math.floor(1000+Math.random()*9000).toString();
    const newId = Math.max(0,...users.map(u=>u.id))+1;
    await SB.from("users").insert({id:newId,name:newName.trim(),pin,role:"participant"});
    setNewName(""); setAdding(false); onRefresh();
  }

  async function resetPin(u) {
    const pin = Math.floor(1000+Math.random()*9000).toString();
    await SB.from("users").update({pin}).eq("id",u.id);
    alert(`Новый пин для ${u.name}: ${pin}`);
    onRefresh();
  }

  return (
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Участники</div>
      </div>
      <div style={{padding:16}}>
        <Btn full onClick={()=>setAdding(!adding)}>+ Добавить участника</Btn>
        {adding && (
          <div style={{background:C.black,padding:14,marginTop:4}}>
            <div style={{fontFamily:F,fontSize:10,fontWeight:700,color:C.grayDk,textTransform:"uppercase",marginBottom:8}}>Имя участника</div>
            <div style={{display:"flex",gap:4}}>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Например: Никита"
                style={{flex:1,background:"#1a1a1a",border:`2px solid ${C.green}`,padding:"10px 12px",color:C.white,fontSize:14,outline:"none",fontFamily:F}}/>
              <Btn onClick={addUser}>✓</Btn>
            </div>
            <div style={{fontFamily:F,fontSize:9,color:C.grayDk,marginTop:6,textTransform:"uppercase"}}>Пин генерируется автоматически</div>
          </div>
        )}
        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:3}}>
          {participants.map(u => (
            <div key={u.id} style={{display:"flex",alignItems:"center",padding:"11px 14px",background:C.white}}>
              <div style={{width:36,height:36,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontWeight:900,fontSize:16,color:C.white,marginRight:12,flexShrink:0}}>{u.name[0]}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:F,fontWeight:700,fontSize:14,color:C.black,textTransform:"uppercase"}}>{u.name}</div>
                <div style={{fontFamily:F,fontSize:10,color:C.grayDk}}>пин: {u.pin} · роль: {u.role}</div>
              </div>
              <Btn sm variant="white" onClick={()=>resetPin(u)}>Пин</Btn>
            </div>
          ))}
        </div>
      </div>
    </Scroll>
  );
}

// ─── ADMIN BLAST ──────────────────────────────────────────────────────────────
function AdminBlast() {
  const [sent, setSent] = useState({});
  const OPT = [
    {id:"r1",icon:"⏰",t:"Напомнить — прогноз не поставлен",d:"Только те, кто не ввёл счёт",to:"3 участника",
      p:"⏰ Ты ещё не поставил прогноз на сегодняшний матч ЧМ 2026.\nУспей → cosports.vercel.app"},
    {id:"r2",icon:"📣",t:"Объявление — сегодня игра",d:"Всем участникам",to:"Все 13",
      p:"⚽ Сегодня играем! ЧМ 2026 в разгаре.\nСтавь прогноз → cosports.vercel.app\n🏆 Точный счёт = 5 очков!"},
    {id:"r3",icon:"🏁",t:"Итоги тура — обновление рейтинга",d:"Каждому очки + полный рейтинг",to:"Все 13",
      p:"🏁 Матч сыгран! Очки начислены.\nПроверь рейтинг → cosports.vercel.app\n🏆 Кто угадал точный счёт — молодец!"},
    {id:"r4",icon:"🎯",t:"Запросить прогноз",d:"Всем кто не поставил",to:"Не поставившие",
      p:"🎯 ЧМ 2026 в разгаре!\nНе забудь поставить прогноз на следующий матч.\n→ cosports.vercel.app"},
    {id:"r5",icon:"🏆",t:"Итоги турнира",d:"После всех матчей",to:"Все 13",
      p:"🏆 ЧМ 2026 завершён!\nПобедитель нашего конкурса прогнозов объявлен.\nСмотри финальный рейтинг → cosports.vercel.app"},
  ];
  return (
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Рассылки</div>
      </div>
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:4}}>
        {OPT.map(o => (
          <div key={o.id} style={{background:C.white}}>
            <div style={{background:C.black,padding:"8px 14px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>{o.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:F,fontWeight:900,fontSize:12,color:C.white,textTransform:"uppercase"}}>{o.t}</div>
                <div style={{fontFamily:F,fontSize:9,color:"rgba(255,255,255,.5)",textTransform:"uppercase"}}>{o.d}</div>
              </div>
            </div>
            <div style={{padding:"10px 14px"}}>
              <div style={{background:C.offwhite,padding:"8px 12px",borderLeft:`3px solid ${C.green}`,marginBottom:10}}>
                <div style={{fontFamily:F,fontSize:9,color:C.grayDk,textTransform:"uppercase",marginBottom:2}}>Текст сообщения:</div>
                <div style={{fontFamily:F,fontSize:11,color:C.black,lineHeight:1.5,whiteSpace:"pre-line"}}>{o.p}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontFamily:F,fontSize:10,color:C.grayDk,textTransform:"uppercase"}}>📩 {o.to}</div>
                <Btn sm onClick={()=>setSent(s=>({...s,[o.id]:true}))} variant={sent[o.id]?"ghost":"green"}>{sent[o.id]?"✓ Скопировано":"Копировать"}</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Scroll>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);

  async function loadData() {
    const [u, m, p] = await Promise.all([
      SB.from("users").select("*"),
      SB.from("matches").select("*").order("match_date"),
      SB.from("predictions").select("*"),
    ]);
    setUsers(u.data||[]);
    setMatches(m.data||[]);
    setPredictions(p.data||[]);
  }

  useEffect(() => { loadData(); }, []);

  const isAdmin = user?.role === "admin";
  const canEditScores = user?.role === "owner";

  function screen() {
    if (!user) return <Login onLogin={u=>{setUser(u);setTab("home");}}/>;
    if (tab==="home")    return isAdmin
      ? <AdminHome setTab={setTab} matches={matches} users={users}/>
      : <Home user={user} users={users} matches={matches} predictions={predictions} setTab={setTab}/>;
    if (tab==="preds")   return <Preds user={user} matches={matches} predictions={predictions} onSave={loadData}/>;
    if (tab==="lb")      return <LB user={user} users={users} matches={matches} predictions={predictions}/>;
    if (tab==="notifs")  return <Notifs user={user} users={users} matches={matches} predictions={predictions}/>;
    if (tab==="matches") return (isAdmin||canEditScores) ? <AdminMatches matches={matches} onUpdateScore={loadData}/> : null;
    if (tab==="users")   return <AdminUsers users={users} onRefresh={loadData}/>;
    if (tab==="blast")   return <AdminBlast/>;
  }

  return (
    <div style={{background:"#0A0A0A",minHeight:"100vh",padding:"0 10px 20px"}}>
      <Phone>
        <TgBar onBack={tab!=="home"&&user?()=>setTab("home"):null} isAdmin={isAdmin}/>
        {screen()}
        {user && <Nav tab={tab} setTab={setTab} isAdmin={isAdmin} canEditScores={canEditScores}/>}
      </Phone>
    </div>
  );
}
