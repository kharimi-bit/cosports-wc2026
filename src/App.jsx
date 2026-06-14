import { useState } from "react";

// SVG Logo — football with "CS" initials
function LogoSVG({size=32,light=false}){
  const fg = light ? "#2DB84B" : "#FFFFFF";
  const bg = light ? "#FFFFFF" : "#2DB84B";
  return(
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill={bg}/>
      <polygon points="20,8 25,12 23,18 17,18 15,12" fill={fg} opacity="0.25"/>
      <polygon points="28,14 34,16 33,22 28,25 24,21 25,15" fill={fg} opacity="0.18"/>
      <polygon points="12,14 16,15 17,21 13,25 7,22 6,16" fill={fg} opacity="0.18"/>
      <text x="20" y="25" textAnchor="middle" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="900" fontSize="13" fill={fg} letterSpacing="-0.5">CS</text>
    </svg>
  );
}



const C = {
  green:"#2DB84B", greenDk:"#228F3A", black:"#0A0A0A",
  white:"#FFFFFF",  offwhite:"#F2F2F2", gray:"#E0E0E0",
  grayDk:"#AAAAAA", card:"#F7F7F7", gold:"#F5C842", red:"#E63232",
};
const F = "system-ui,-apple-system,'Helvetica Neue',sans-serif";

const USERS = [
  {id:1, name:"Арсений", pin:"2805",role:"participant",pts:6, exact:1},
  {id:2, name:"Евгений", pin:"0000",role:"participant",pts:6, exact:1},
  {id:3, name:"Талгат",  pin:"0000",role:"participant",pts:10,exact:2},
  {id:4, name:"Масрур",  pin:"0000",role:"participant",pts:10,exact:2},
  {id:5, name:"Василий", pin:"0000",role:"participant",pts:10,exact:2},
  {id:6, name:"Джа",     pin:"0000",role:"participant",pts:15,exact:3},
  {id:7, name:"Саша К",  pin:"1903",role:"owner",pts:8, exact:0},
  {id:8, name:"Дарий",   pin:"0000",role:"participant",pts:8, exact:0},
  {id:9, name:"Олег",    pin:"0000",role:"participant",pts:10,exact:2},
  {id:10,name:"Игорь",   pin:"0000",role:"participant",pts:6, exact:1},
  {id:11,name:"Саша С",  pin:"0000",role:"participant",pts:0, exact:0},
  {id:12,name:"Марат",   pin:"0000",role:"participant",pts:1, exact:0},
  {id:13,name:"Саша Л",  pin:"0000",role:"participant",pts:2, exact:0},
  {id:98,name:"Админ",   pin:"0000",role:"admin",      pts:0, exact:0},
];

const MATCHES = [
  {id:1,group:"A",date:"11.06 22:00",home:"Мексика",  away:"ЮАР",       real:[2,0],preds:{1:"2:1",3:"2:0",4:"2:0",5:"2:0",6:"2:0",7:"3:1",8:"3:1",9:"2:0",10:"2:1",11:"1:1",12:"3:0",13:"1:0"}},
  {id:2,group:"A",date:"12.06 05:00",home:"Ю. Корея", away:"Чехия",     real:null, preds:{1:"0:0",3:"1:3",4:"1:1",5:"1:1",6:"2:1",7:"2:0",8:"2:0",9:"0:0",10:"1:2",11:"0:1",12:"1:1",13:"0:0"}},
  {id:3,group:"B",date:"12.06 22:00",home:"Канада",   away:"Босния",    real:null, preds:{1:"1:0",3:"3:0",4:"1:1",5:"2:1",6:"2:0",7:"1:0",8:"2:2",9:"2:0",10:"3:0",11:"2:1",12:"3:1",13:"1:0"}},
  {id:4,group:"D",date:"13.06 04:00",home:"США",      away:"Парагвай",  real:null, preds:{1:"1:1",3:"1:0",4:"1:0",5:"2:1",6:"1:1",7:"3:1",8:"2:2",9:"1:1",10:"3:1",11:"1:0",12:"2:1",13:"2:1"}},
  {id:5,group:"B",date:"13.06 22:00",home:"Катар",    away:"Швейцария", real:null, preds:{1:"1:3",3:"0:4",5:"0:2",6:"0:2",7:"1:1",8:"0:3",9:"0:3",10:"0:3",11:"0:3"}},
  {id:6,group:"C",date:"14.06 01:00",home:"Бразилия", away:"Марокко",   real:null, preds:{1:"2:0",3:"4:0",5:"2:1",6:"2:0",7:"0:0",8:"4:1",9:"1:1",10:"3:1",11:"2:1"}},
  {id:7,group:"E",date:"14.06 20:00",home:"Германия", away:"Кюрасао",   real:null, preds:{1:"5:0",3:"6:0",5:"3:0",6:"3:0",7:"2:0",8:"6:0",9:"2:0",10:"4:0",11:"7:1"}},
  {id:8,group:"H",date:"15.06 19:00",home:"Испания",  away:"Кабо-Верде",real:null, preds:{1:"4:0",3:"3:0",5:"3:0",6:"3:0",7:"5:0",8:"5:0",10:"4:0",11:"2:0"}},
];

function calcPts(pred,real){
  if(!pred||!real)return null;
  const[ph,pa]=pred.split(":").map(Number);const[rh,ra]=real;
  if(ph===rh&&pa===ra)return 5;
  if(Math.sign(ph-pa)!==Math.sign(rh-ra))return 0;
  if((ph-pa)===(rh-ra))return 3;return 1;
}

// SHARED
function GreenHero({title,sub,dark}){
  return(
    <div style={{background:dark?C.black:C.green,padding:"20px 20px 0"}}>
      {sub&&<div style={{fontFamily:F,fontSize:10,fontWeight:700,color:dark?C.green:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{sub}</div>}
      <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",lineHeight:1,marginBottom:16}}>{title}</div>
    </div>
  );
}
function StatRow({items}){
  return(
    <div style={{display:"flex",gap:2,marginTop:-0}}>
      {items.map(([v,l,c])=>(
        <div key={l} style={{flex:1,background:C.white,padding:"10px 6px",textAlign:"center"}}>
          <div style={{fontFamily:F,fontWeight:900,fontSize:22,color:c||C.black,textTransform:"uppercase"}}>{v}</div>
          <div style={{fontFamily:F,fontSize:9,color:C.grayDk,textTransform:"uppercase",letterSpacing:.8,fontWeight:600}}>{l}</div>
        </div>
      ))}
    </div>
  );
}
function Btn({children,onClick,variant="green",full,sm}){
  const s={fontFamily:F,fontWeight:900,fontSize:sm?11:14,textTransform:"uppercase",letterSpacing:.5,border:"none",cursor:"pointer",padding:sm?"8px 12px":"13px 18px",borderRadius:0,display:"block",width:full?"100%":"auto",transition:"opacity .15s"};
  const v={green:{...s,background:C.green,color:C.white},black:{...s,background:C.black,color:C.white},white:{...s,background:C.white,color:C.black,border:`2px solid ${C.black}`},ghost:{...s,background:"transparent",color:C.grayDk,border:`1px solid ${C.gray}`}};
  return <button onClick={onClick} style={v[variant]}>{children}</button>;
}
function Scroll({children}){return <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",background:C.offwhite}}>{children}</div>;}

// PHONE
function Phone({children}){
  return(
    <div style={{background:"#111",borderRadius:44,padding:12,maxWidth:400,margin:"20px auto",boxShadow:"0 30px 80px rgba(0,0,0,.65)"}}>
      <div style={{width:120,height:26,background:"#111",borderRadius:"0 0 16px 16px",margin:"0 auto 4px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
        <div style={{width:10,height:10,background:"#222",borderRadius:"50%"}}/><div style={{width:60,height:5,background:"#222",borderRadius:3}}/>
      </div>
      <div style={{background:C.offwhite,borderRadius:34,overflow:"hidden",height:760,display:"flex",flexDirection:"column"}}>{children}</div>
    </div>
  );
}
function TgBar({onBack,isAdmin}){
  return(
    <div style={{background:C.black,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
      {onBack&&<span onClick={onBack} style={{color:C.green,fontSize:24,cursor:"pointer",fontWeight:900,lineHeight:1,marginRight:2}}>‹</span>}
      <div style={{width:32,height:32,background:C.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:900,color:C.white,fontSize:14,fontFamily:F}}><LogoSVG size={28} light={false}/></div>
      <div style={{flex:1}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:13,color:C.white,textTransform:"uppercase",letterSpacing:.5}}>CoSports · ЧМ 2026</div>
        <div style={{fontFamily:F,fontSize:9,color:C.green,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>{isAdmin?"● ADMIN":"● ONLINE"}</div>
      </div>
    </div>
  );
}
function Nav({tab,setTab,isAdmin}){
  const tabs=isAdmin
    ?[["home","⚽","Главная"],["matches","⚙️","Счета"],["lb","🏆","Рейтинг"],["users","👥","Люди"],["blast","📣","Рассылки"]]
    :[["home","⚽","Главная"],["preds","✏️","Прогнозы"],["lb","🏆","Рейтинг"],["notifs","🔔","Уведом."]];
  return(
    <div style={{display:"flex",background:C.black,flexShrink:0}}>
      {tabs.map(([id,icon,label])=>(
        <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,border:"none",background:tab===id?C.green:"transparent",cursor:"pointer",padding:"10px 2px"}}>
          <span style={{fontSize:17}}>{icon}</span>
          <span style={{fontFamily:F,fontSize:8,fontWeight:700,color:tab===id?C.white:C.grayDk,textTransform:"uppercase",letterSpacing:.3}}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// LOGIN
function Login({onLogin}){
  const[sel,setSel]=useState(null);
  const[pin,setPin]=useState("");
  const[err,setErr]=useState(false);
  const parts=USERS.filter(u=>u.role==="participant");
  function go(){const u=USERS.find(u=>u.id===sel&&u.pin===pin);if(u){setErr(false);onLogin(u);}else{setErr(true);setPin("");}}
  return(
    <Scroll>
      <div style={{background:C.green,padding:"28px 20px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:44,height:44,background:C.white,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontWeight:900,fontSize:16,color:C.green}}><LogoSVG size={38} light={true}/></div>
          <div style={{fontFamily:F,fontWeight:900,fontSize:20,color:C.white,textTransform:"uppercase",letterSpacing:"-0.5px",lineHeight:1.1}}>CoSports<br/><span style={{fontSize:12,fontWeight:600,opacity:.8,letterSpacing:1}}>ЧМ 2026 · ПРОГНОЗЫ</span></div>
        </div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:34,color:C.white,textTransform:"uppercase",letterSpacing:"-1.5px",lineHeight:.95}}>ВЫБЕРИ<br/>УЧАСТНИКА</div>
      </div>

      <div style={{padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,marginBottom:16}}>
          {parts.map(u=>(
            <button key={u.id} onClick={()=>{setSel(u.id);setErr(false);}} style={{
              background:sel===u.id?C.green:C.white, border:`2px solid ${sel===u.id?C.green:C.gray}`,
              borderRadius:0, padding:"11px 6px", color:sel===u.id?C.white:C.black,
              fontFamily:F, fontSize:13, fontWeight:700, cursor:"pointer", textTransform:"uppercase"
            }}>{u.name}</button>
          ))}
        </div>

        <div style={{background:C.white,padding:16}}>
          <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.grayDk,marginBottom:12}}>Пин-код</div>
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:err?8:16}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:16,height:16,borderRadius:"50%",background:pin.length>i?C.green:C.gray,transition:"background .15s"}}/>)}
          </div>
          {err&&<div style={{fontFamily:F,fontSize:11,fontWeight:700,color:C.red,textAlign:"center",textTransform:"uppercase",marginBottom:10}}>Неверный пин-код</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,marginBottom:12}}>
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d,i)=>(
              <button key={i} onClick={()=>{if(d==="⌫"){setPin(p=>p.slice(0,-1));setErr(false);}else if(d!=""&&pin.length<4){setPin(p=>p+d);setErr(false);}}}
                style={{background:d===""?"transparent":C.black,border:"none",padding:"14px 0",color:C.white,fontFamily:F,fontSize:20,fontWeight:900,cursor:d===""?"default":"pointer",visibility:d===""?"hidden":"visible"}}>
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

// PARTICIPANT HOME
function Home({user,setTab}){
  const sorted=[...USERS.filter(u=>u.role==="participant")].sort((a,b)=>b.pts-a.pts);
  const rank=sorted.findIndex(u=>u.id===user.id)+1;
  const next=MATCHES.find(m=>!m.real);
  const medals=["🥇","🥈","🥉"];
  return(
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontSize:10,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Привет,</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:34,color:C.white,textTransform:"uppercase",letterSpacing:"-1.5px",lineHeight:.95,marginBottom:16}}>{user.name}</div>
        <StatRow items={[[user.pts,"Очков",C.black],[`#${rank}`,"Место",C.green],["2/24","Матчей",C.black]]}/>
      </div>

      {next&&(
        <div style={{padding:16}}>
          <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.grayDk,marginBottom:8}}>Ближайший матч</div>
          <div style={{background:C.black,padding:16}}>
            <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Группа {next.group} · {next.date}</div>
            <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
              <div style={{flex:1,fontFamily:F,fontWeight:900,fontSize:16,color:C.white,textTransform:"uppercase"}}>{next.home}</div>
              <div style={{fontFamily:F,fontSize:11,color:C.grayDk,padding:"0 8px",fontWeight:700}}>VS</div>
              <div style={{flex:1,fontFamily:F,fontWeight:900,fontSize:16,color:C.white,textTransform:"uppercase",textAlign:"right"}}>{next.away}</div>
            </div>
            <div style={{fontFamily:F,fontSize:11,color:C.grayDk,marginBottom:12,textTransform:"uppercase"}}>
              Прогноз: <span style={{color:C.green,fontWeight:700}}>{next.preds[user.id]||"не введён"}</span>
            </div>
            <Btn onClick={()=>setTab("preds")} full>{next.preds[user.id]?"Изменить прогноз":"⚡ Ввести прогноз"}</Btn>
          </div>
        </div>
      )}


      {/* БАННЕР */}
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
        {sorted.slice(0,5).map((u,i)=>{
          const me=u.id===user.id;
          return(
            <div key={u.id} style={{display:"flex",alignItems:"center",padding:"11px 14px",background:me?C.green:C.white,marginBottom:3}}>
              <div style={{fontFamily:F,fontWeight:900,fontSize:13,width:26,color:me?C.white:i===0?C.gold:C.grayDk}}>{medals[i]||i+1}</div>
              <div style={{flex:1,fontFamily:F,fontWeight:700,fontSize:14,color:me?C.white:C.black,textTransform:"uppercase"}}>{u.name}{me?" ←":""}</div>
              <div style={{fontFamily:F,fontWeight:900,fontSize:18,color:me?C.white:C.green}}>{u.pts}<span style={{fontSize:10,marginLeft:2,opacity:.7}}>pts</span></div>
            </div>
          );
        })}
        <div style={{marginTop:4}}><Btn onClick={()=>setTab("lb")} variant="white" full sm>Полный рейтинг →</Btn></div>
      </div>
    </Scroll>
  );
}

// PREDICTIONS
function Preds({user}){
  const[editing,setEditing]=useState(null);
  const[my,setMy]=useState({});

  if(editing!==null){
    const m=MATCHES.find(x=>x.id===editing);
    const cur=my[m.id]||m.preds[user.id]||"0:0";
    const[h,a]=cur.split(":").map(Number);
    const hint=h>a?`Победа ${m.home}`:a>h?`Победа ${m.away}`:"Ничья";
    const icon=h>a?"🏠":a>h?"✈️":"🤝";
    function chg(side,d){const p=cur.split(":").map(Number);p[side]=Math.max(0,Math.min(15,p[side]+d));setMy(s=>({...s,[m.id]:p.join(":")}));}
    return(
      <Scroll>
        <div style={{background:C.green,padding:"20px 20px 0"}}>
          <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Группа {m.group} · {m.date}</div>
          <div style={{fontFamily:F,fontWeight:900,fontSize:22,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",lineHeight:1,marginBottom:16}}>{m.home} VS {m.away}</div>
        </div>
        <div style={{padding:20}}>
          <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.grayDk,textAlign:"center",marginBottom:20}}>Твой прогноз</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:24}}>
            {[0,1].map(side=>{
              const val=side===0?h:a;
              return(
                <div key={side} style={{textAlign:"center"}}>
                  <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.grayDk,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>{side===0?m.home:m.away}</div>
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
          <Btn full onClick={()=>setEditing(null)}>💾 Сохранить прогноз</Btn>
          <div style={{marginTop:4}}><Btn full variant="ghost" onClick={()=>setEditing(null)}>Назад</Btn></div>
        </div>
      </Scroll>
    );
  }

  return(
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Нажми для изменения</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Мои прогнозы</div>
      </div>
      {MATCHES.map((m,i)=>{
        const pred=my[m.id]||m.preds[user.id];
        const pts=calcPts(pred,m.real);
        const can=!m.real;
        return(
          <div key={m.id}>
            <div onClick={()=>can&&setEditing(m.id)} style={{display:"flex",alignItems:"center",padding:"13px 20px",background:C.white,cursor:can?"pointer":"default"}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:F,fontWeight:700,fontSize:14,color:C.black,textTransform:"uppercase"}}>{m.home} — {m.away}</div>
                <div style={{fontFamily:F,fontSize:10,fontWeight:600,color:C.grayDk,textTransform:"uppercase",letterSpacing:.5,marginTop:2}}>Группа {m.group} · {m.date}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {pts!==null&&<span style={{fontFamily:F,fontSize:11,fontWeight:900,padding:"2px 7px",background:pts===5?C.gold:pts>=1?"rgba(45,184,75,.15)":"rgba(230,50,50,.12)",color:pts===5?C.black:pts>=1?C.green:C.red}}>{pts}pts</span>}
                <div style={{fontFamily:F,fontWeight:900,fontSize:14,padding:"5px 10px",background:pred?(m.real?C.green:C.black):"rgba(230,50,50,.1)",color:pred?C.white:C.red,textTransform:"uppercase"}}>{pred||(can?"Ввести":"—")}</div>
              </div>
            </div>
            {i<MATCHES.length-1&&<div style={{height:1,background:C.gray}}/>}
          </div>
        );
      })}
    </Scroll>
  );
}

// LEADERBOARD
function LB({user}){
  const sorted=[...USERS.filter(u=>u.role==="participant")].sort((a,b)=>b.pts-a.pts||b.exact-a.exact);
  const medals=["🥇","🥈","🥉"];
  return(
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{sorted.length} участников · 1 матч сыгран</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Рейтинг</div>
      </div>
      {sorted.map((u,i)=>{
        const me=u.id===user.id;
        return(
          <div key={u.id} style={{display:"flex",alignItems:"center",padding:"13px 20px",background:me?C.green:i<3?"#F0FFF4":C.white,borderBottom:`1px solid ${C.gray}`}}>
            <div style={{fontFamily:F,fontWeight:900,fontSize:16,width:30,color:me?C.white:i<3?C.gold:C.grayDk}}>{medals[i]||i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:F,fontWeight:700,fontSize:15,color:me?C.white:C.black,textTransform:"uppercase"}}>{u.name}{me?" ←":""}</div>
              <div style={{fontFamily:F,fontSize:10,color:me?"rgba(255,255,255,.6)":C.grayDk,textTransform:"uppercase"}}>⭐ {u.exact} точных</div>
            </div>
            <div style={{fontFamily:F,fontWeight:900,fontSize:22,color:me?C.white:C.green}}>{u.pts}<span style={{fontSize:11,marginLeft:2,opacity:.7}}>pts</span></div>
          </div>
        );
      })}
    </Scroll>
  );
}

// NOTIFICATIONS
function Notifs({user}){
  const sorted=[...USERS.filter(u=>u.role==="participant")].sort((a,b)=>b.pts-a.pts);
  const medals=["🥇","🥈","🥉"];
  const DIFFS=["+5","+5","+5","+5","+5","+3","+3","+1","+1","+1","+1","+0","+0"];
  return(
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Уведомления</div>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:6}}>
        {/* NEW */}
        <div style={{background:C.white,borderLeft:`4px solid ${C.green}`}}>
          <div style={{background:C.green,padding:"4px 14px"}}><span style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.white,textTransform:"uppercase",letterSpacing:1}}>Новое уведомление</span></div>
          <div style={{padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontFamily:F,fontWeight:900,fontSize:13,color:C.black,textTransform:"uppercase"}}>⏰ Поставь прогноз!</div>
              <div style={{fontFamily:F,fontSize:10,color:C.grayDk}}>20:00</div>
            </div>
            <div style={{fontFamily:F,fontSize:12,color:C.grayDk,marginBottom:10,lineHeight:1.5}}>Через 2 часа стартует Германия — Кюрасао (Группа E). Ты ещё не ввёл счёт.</div>
            <Btn sm>Поставить прогноз →</Btn>
          </div>
        </div>
        {/* CONFIRM */}
        <div style={{background:C.white,borderLeft:`4px solid ${C.gray}`}}>
          <div style={{padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontFamily:F,fontWeight:900,fontSize:13,color:C.black,textTransform:"uppercase"}}>✅ Прогноз принят</div>
              <div style={{fontFamily:F,fontSize:10,color:C.grayDk}}>04:20</div>
            </div>
            <div style={{fontFamily:F,fontSize:12,color:C.grayDk,lineHeight:1.5}}>Мексика — ЮАР: твой прогноз <b>2:1</b> зафиксирован. Матч в 22:00.</div>
          </div>
        </div>
        {/* RESULTS */}
        <div style={{background:C.white,borderLeft:`4px solid ${C.gray}`}}>
          <div style={{padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontFamily:F,fontWeight:900,fontSize:13,color:C.black,textTransform:"uppercase"}}>🏁 Итоги: Мексика 2:0 ЮАР</div>
              <div style={{fontFamily:F,fontSize:10,color:C.grayDk}}>Вчера</div>
            </div>
            <div style={{border:`1px solid ${C.gray}`,marginBottom:10}}>
              <div style={{background:C.black,padding:"6px 12px"}}>
                <span style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:1}}>Полный рейтинг</span>
              </div>
              {sorted.map((p,i)=>{
                const me=p.id===user.id;
                return(
                  <div key={p.id} style={{display:"flex",alignItems:"center",padding:"6px 12px",background:me?C.green:"transparent",borderBottom:`1px solid ${C.gray}`}}>
                    <div style={{fontFamily:F,fontWeight:900,fontSize:11,width:20,color:me?C.white:i<3?C.gold:C.grayDk}}>{medals[i]||i+1}</div>
                    <div style={{flex:1,fontFamily:F,fontSize:12,fontWeight:700,color:me?C.white:C.black,textTransform:"uppercase"}}>{p.name}{me?" ←":""}</div>
                    <div style={{fontFamily:F,fontSize:10,fontWeight:700,color:me?C.white:C.green,marginRight:8}}>{DIFFS[i]||"+0"}</div>
                    <div style={{fontFamily:F,fontWeight:900,fontSize:12,color:me?C.white:C.black}}>{p.pts}pts</div>
                  </div>
                );
              })}
            </div>
            <Btn sm variant="black">Смотреть рейтинг →</Btn>
          </div>
        </div>
      </div>
    </Scroll>
  );
}

// ADMIN HOME
function AdminHome({setTab}){
  const played=MATCHES.filter(m=>m.real).length;
  return(
    <Scroll>
      <div style={{background:C.black,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>CoSports · ЧМ 2026</div>
        <div style={{fontFamily:F,fontWeight:900,fontSize:32,color:C.white,textTransform:"uppercase",letterSpacing:"-1.5px",lineHeight:.95,marginBottom:16}}>ПАНЕЛЬ<br/>АДМИНА</div>
        <StatRow items={[[played,"Сыграно",C.green],[MATCHES.length-played,"Осталось",C.white],[USERS.filter(u=>u.role==="participant").length,"Участников",C.white]]}/>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:4}}>
        {[["⚙️","Ввести счета","Результаты матчей","matches"],["🏆","Рейтинг","Общая таблица","lb"],["👥","Участники","Управление людьми","users"],["📣","Рассылки","Уведомления и напоминания","blast"]].map(([icon,t,d,tab])=>(
          <button key={tab} onClick={()=>setTab(tab)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:tab==="matches"?C.green:C.white,border:`1px solid ${C.gray}`,cursor:"pointer",fontFamily:F,textAlign:"left"}}>
            <span style={{fontSize:22}}>{icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:900,fontSize:14,color:tab==="matches"?C.white:C.black,textTransform:"uppercase"}}>{t}</div>
              <div style={{fontSize:10,color:tab==="matches"?"rgba(255,255,255,.7)":C.grayDk,textTransform:"uppercase"}}>{d}</div>
            </div>
            <span style={{color:tab==="matches"?C.white:C.green,fontSize:18,fontWeight:900}}>›</span>
          </button>
        ))}
      </div>
    </Scroll>
  );
}

// ADMIN MATCHES
function AdminMatches(){
  const[sc,setSc]=useState({1:[2,0]});
  return(
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Счета матчей</div>
      </div>
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:4}}>
        {MATCHES.map(m=>{
          const r=sc[m.id];
          return(
            <div key={m.id} style={{background:C.white}}>
              <div style={{background:C.black,padding:"6px 14px",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:F,fontSize:9,fontWeight:700,color:C.grayDk,textTransform:"uppercase"}}>Группа {m.group} · {m.date}</span>
                <span style={{fontFamily:F,fontSize:9,fontWeight:700,color:r?C.green:C.gold,textTransform:"uppercase"}}>{r?"✓ Завершён":"Ожидается"}</span>
              </div>
              <div style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,fontFamily:F,fontWeight:700,fontSize:12,color:C.black,textTransform:"uppercase"}}>{m.home}</div>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  {[0,1].map(side=>(
                    <div key={side} style={{display:"flex",alignItems:"center",gap:3}}>
                      <input type="number" min="0" max="20" defaultValue={sc[m.id]?.[side]??""} placeholder="—"
                        style={{width:42,height:38,background:r?C.green:C.black,border:"none",color:C.white,fontSize:20,fontWeight:900,textAlign:"center",outline:"none",fontFamily:F}}
                        onChange={e=>{const v=parseInt(e.target.value);if(!isNaN(v))setSc(s=>({...s,[m.id]:side===0?[v,s[m.id]?.[1]??0]:[s[m.id]?.[0]??0,v]}));}}/>
                      {side===0&&<span style={{fontFamily:F,fontSize:18,fontWeight:900,color:C.grayDk}}>:</span>}
                    </div>
                  ))}
                </div>
                <div style={{flex:1,fontFamily:F,fontWeight:700,fontSize:12,color:C.black,textTransform:"uppercase",textAlign:"right"}}>{m.away}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Scroll>
  );
}

// ADMIN USERS
function AdminUsers(){
  const[adding,setAdding]=useState(false);
  return(
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Участники</div>
      </div>
      <div style={{padding:16}}>
        <Btn full onClick={()=>setAdding(!adding)}>+ Добавить участника</Btn>
        {adding&&(
          <div style={{background:C.black,padding:14,marginTop:4}}>
            <div style={{fontFamily:F,fontSize:10,fontWeight:700,color:C.grayDk,textTransform:"uppercase",marginBottom:8}}>Имя участника</div>
            <div style={{display:"flex",gap:4}}>
              <input placeholder="Например: Никита" style={{flex:1,background:"#1a1a1a",border:`2px solid ${C.green}`,padding:"10px 12px",color:C.white,fontSize:14,outline:"none",fontFamily:F}}/>
              <Btn>✓</Btn>
            </div>
            <div style={{fontFamily:F,fontSize:9,color:C.grayDk,marginTop:6,textTransform:"uppercase"}}>Пин генерируется автоматически</div>
          </div>
        )}
        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:3}}>
          {USERS.filter(u=>u.role==="participant").map(u=>(
            <div key={u.id} style={{display:"flex",alignItems:"center",padding:"11px 14px",background:C.white}}>
              <div style={{width:36,height:36,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,fontWeight:900,fontSize:16,color:C.white,marginRight:12,flexShrink:0}}>{u.name[0]}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:F,fontWeight:700,fontSize:14,color:C.black,textTransform:"uppercase"}}>{u.name}</div>
                <div style={{fontFamily:F,fontSize:10,color:C.grayDk}}>пин: {u.pin} · {u.pts} pts</div>
              </div>
              <div style={{display:"flex",gap:3}}>
                <Btn sm variant="white">Пин</Btn>
                <Btn sm variant="black">✕</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Scroll>
  );
}

// ADMIN BLAST
function AdminBlast(){
  const[sent,setSent]=useState({});
  const OPT=[
    {id:"r1",icon:"⏰",t:"Напомнить — прогноз не поставлен",d:"Только те, кто не ввёл счёт",to:"3 участника",p:"⏰ Через 2 часа Германия — Кюрасао! Ты ещё не поставил прогноз. Открыть →"},
    {id:"r2",icon:"📣",t:"Рассылка всем участникам",d:"Независимо от статуса прогноза",to:"Все 13",p:"⚽ Сегодня тур ЧМ 2026! Ставь прогнозы пока не поздно →"},
    {id:"r3",icon:"🏁",t:"Разослать итоги тура",d:"Каждому очки + полный рейтинг",to:"Все 13",p:"🏁 Мексика 2:0 ЮАР. Ты заработал +5 очков! Рейтинг обновлён →"},
    {id:"r4",icon:"🎯",t:"Запросить прогноз у всех",d:"Бот напишет каждому лично",to:"Все кто не поставил",p:"🎯 Привет! Какой счёт ставишь на Бразилия — Марокко? Ответь сюда →"},
  ];
  const LOG=[{t:"11.06 21:48",tx:"Напоминание перед матчем",to:"3 уч.",i:"⏰"},{t:"11.06 23:59",tx:"Итоги: Мексика 2:0 ЮАР",to:"13 уч.",i:"🏁"},{t:"12.06 03:00",tx:"Напомнил: Ю.Корея — Чехия",to:"5 уч.",i:"⏰"}];
  return(
    <Scroll>
      <div style={{background:C.green,padding:"20px 20px 0"}}>
        <div style={{fontFamily:F,fontWeight:900,fontSize:30,color:C.white,textTransform:"uppercase",letterSpacing:"-1px",marginBottom:16}}>Рассылки</div>
      </div>
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:4}}>
        {OPT.map(o=>(
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
                <div style={{fontFamily:F,fontSize:11,color:C.black,lineHeight:1.5}}>{o.p}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontFamily:F,fontSize:10,color:C.grayDk,textTransform:"uppercase"}}>📩 {o.to}</div>
                <Btn sm onClick={()=>setSent(s=>({...s,[o.id]:true}))} variant={sent[o.id]?"ghost":"green"}>{sent[o.id]?"✓ Отправлено":"Отправить"}</Btn>
              </div>
            </div>
          </div>
        ))}
        <div style={{fontFamily:F,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:C.grayDk,padding:"4px 0 4px"}}>История</div>
        {LOG.map((l,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.white}}>
            <span style={{fontSize:14}}>{l.i}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:F,fontSize:12,fontWeight:700,color:C.black,textTransform:"uppercase"}}>{l.tx}</div>
              <div style={{fontFamily:F,fontSize:9,color:C.grayDk}}>{l.t} · {l.to}</div>
            </div>
            <span style={{fontFamily:F,fontSize:10,fontWeight:700,color:C.green}}>✓</span>
          </div>
        ))}
      </div>
    </Scroll>
  );
}

// ROOT
export default function App(){
  const[user,setUser]=useState(null);
  const[tab,setTab]=useState("home");
  const isAdmin=user?.role==="admin";
  function screen(){
    if(!user)return <Login onLogin={u=>{setUser(u);setTab("home");}}/>;
    if(tab==="home")   return isAdmin?<AdminHome setTab={setTab}/>:<Home user={user} setTab={setTab}/>;
    if(tab==="preds")  return <Preds user={user}/>;
    if(tab==="lb")     return <LB user={user}/>;
    if(tab==="notifs") return <Notifs user={user}/>;
    if(tab==="matches")return <AdminMatches/>;
    if(tab==="users")  return <AdminUsers/>;
    if(tab==="blast")  return <AdminBlast/>;
  }
  return(
    <div style={{background:"#0A0A0A",minHeight:"100vh",padding:"0 10px 20px"}}>
      <Phone>
        <TgBar onBack={tab!=="home"&&user?()=>setTab("home"):null} isAdmin={isAdmin}/>
        {screen()}
        {user&&<Nav tab={tab} setTab={setTab} isAdmin={isAdmin}/>}
      </Phone>
      <div style={{maxWidth:400,margin:"10px auto 0",display:"flex",gap:3}}>
        {[["👥 Участник","Прогнозы · Рейтинг · Уведомления",C.green],["👑 Админ","Счета · Люди · Рассылки",C.gold]].map(([t,d,c])=>(
          <div key={t} style={{flex:1,background:"#1a1a1a",borderTop:`3px solid ${c}`,padding:"10px 12px"}}>
            <div style={{fontFamily:F,fontWeight:900,fontSize:11,color:c,textTransform:"uppercase",marginBottom:2}}>{t}</div>
            <div style={{fontFamily:F,fontSize:9,color:C.grayDk,textTransform:"uppercase"}}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
