import { useState } from "react";

// ─── Dados ────────────────────────────────────────────────
const BARBERS = ["Victor", "Marcos"];

const SERVICES = [
  { id: "corte", label: "✂️ Corte",           price: "R$ 40", duration: "~30min" },
  { id: "barba", label: "🧔 Barba",            price: "R$ 30", duration: "~20min" },
  { id: "combo", label: "✂️🧔 Corte + Barba", price: "R$ 60", duration: "~50min" },
];

const DAYS = [
  { label: "Hoje",   sub: "Seg 09/05" },
  { label: "Amanhã", sub: "Ter 10/05" },
  { label: "Qua",    sub: "11/05" },
  { label: "Qui",    sub: "12/05" },
  { label: "Sex",    sub: "13/05" },
];

const AGENDA = {
  "Victor|Hoje":   ["09:30","11:00","14:30"],
  "Marcos|Hoje":   ["10:00","14:00","16:30"],
  "Victor|Amanhã": ["09:00","10:30","15:00"],
  "Marcos|Amanhã": ["09:30","14:30","17:00"],
  "Victor|Qua":    ["11:00","14:00"],
  "Marcos|Qua":    ["09:00","15:30"],
  "Victor|Qui":    [],
  "Marcos|Qui":    ["10:00","16:00"],
  "Victor|Sex":    ["09:00","14:30"],
  "Marcos|Sex":    [],
};

const ALL_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "14:00","14:30","15:00","15:30","16:00","16:30","17:00",
];

const MOCK_BOOKINGS = [
  { id: 1, service: "✂️ Corte",           barber: "Victor", day: "Amanhã", sub: "Ter 10/05", slot: "09:00", price: "R$ 40" },
  { id: 2, service: "🧔 Barba",            barber: "Marcos", day: "Qua",    sub: "11/05",     slot: "09:00", price: "R$ 30" },
];

let rrIndex = 0;
function nextBarber() {
  const b = BARBERS[rrIndex % BARBERS.length];
  rrIndex++;
  return b;
}

function slotsForBarber(barber, dayLabel) {
  const taken = AGENDA[`${barber}|${dayLabel}`] || [];
  return ALL_SLOTS.map(s => ({ slot: s, taken: taken.includes(s) }));
}

// ─── UI Atoms ─────────────────────────────────────────────
function Bubble({ from, children }) {
  const isBot = from === "bot";
  return (
    <div style={{ display:"flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom:8 }}>
      {isBot && (
        <div style={{
          width:32, height:32, borderRadius:"50%", background:"#25d366",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16, marginRight:8, flexShrink:0, alignSelf:"flex-end",
        }}>🪒</div>
      )}
      <div style={{
        maxWidth:"80%",
        background: isBot ? "#fff" : "#dcf8c6",
        borderRadius: isBot ? "0 12px 12px 12px" : "12px 0 12px 12px",
        padding:"10px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.1)",
        fontSize:13.5, lineHeight:1.55, color:"#1a1a1a", whiteSpace:"pre-wrap",
      }}>
        {children}
      </div>
    </div>
  );
}

function Btn({ onClick, children, variant = "white", disabled }) {
  const styles = {
    white:  { bg:"#fff",         color:"#1a1a1a", border:"1.5px solid #ddd" },
    green:  { bg:"#25d366",      color:"#fff",    border:"none" },
    red:    { bg:"#ff5252",      color:"#fff",    border:"none" },
    orange: { bg:"#ff9800",      color:"#fff",    border:"none" },
  };
  const s = styles[variant] || styles.white;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#f5f5f5" : s.bg,
      color: disabled ? "#bbb" : s.color,
      border: s.border, borderRadius:10,
      padding:"9px 14px", fontSize:13,
      cursor: disabled ? "default" : "pointer",
      width:"100%", marginBottom:6, textAlign:"left",
      transition:"opacity 0.15s",
    }}>
      {children}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background:"none", border:"none", color:"#888",
      fontSize:12, cursor:"pointer", marginBottom:8,
      display:"flex", alignItems:"center", gap:4, padding:"4px 0",
    }}>← Voltar</button>
  );
}

const STEP_LABELS = ["Serviço","Barbeiro","Dia","Horário","Confirmar"];
function StepsBar({ current }) {
  return (
    <div style={{ display:"flex", padding:"10px 16px 0" }}>
      {STEP_LABELS.map((s,i) => (
        <div key={s} style={{ flex:1, textAlign:"center" }}>
          <div style={{
            height:3, background: i <= current ? "#25d366" : "#e0e0e0",
            transition:"background 0.3s", marginBottom:3,
          }}/>
          <div style={{
            fontSize:9, color: i <= current ? "#25d366" : "#ccc",
            fontWeight: i === current ? "bold" : "normal",
          }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]               = useState("menu");
  const [step,   setStep]                 = useState(0);
  const [service, setService]             = useState(null);
  const [barber,  setBarber]              = useState(null);
  const [resolvedBarber, setResolvedBarber] = useState(null);
  const [day,     setDay]                 = useState(null);
  const [slot,    setSlot]                = useState(null);
  const [doneMsg, setDoneMsg]             = useState("");
  const [bookings, setBookings]           = useState(MOCK_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const go   = (s) => setStep(s);

  const reset = () => {
    setScreen("menu"); setStep(0);
    setService(null); setBarber(null); setResolvedBarber(null);
    setDay(null); setSlot(null); setSelectedBooking(null);
  };

  const chooseBarber = (b) => {
    if (b === "auto") {
      const rb = nextBarber();
      setBarber("auto");
      setResolvedBarber(rb);
    } else {
      setBarber(b);
      setResolvedBarber(b);
    }
    go(2);
  };

  const confirmBooking = () => {
    setDoneMsg(
      `✅ Agendado!\n\n` +
      `📋 ${service.label}\n` +
      `💈 ${resolvedBarber}${barber === "auto" ? " (distribuição automática)" : ""}\n` +
      `📅 ${day.label}, ${day.sub}\n` +
      `⏰ ${slot}\n` +
      `💰 ${service.price}\n\n` +
      `Vamos te lembrar um dia antes. Até lá! ✌️`
    );
    setScreen("done");
  };

  const confirmCancel = () => {
    setBookings(bs => bs.filter(b => b.id !== selectedBooking.id));
    setDoneMsg(
      `❌ Agendamento cancelado.\n\n` +
      `📋 ${selectedBooking.service}\n` +
      `💈 ${selectedBooking.barber}\n` +
      `📅 ${selectedBooking.day}, ${selectedBooking.sub} às ${selectedBooking.slot}\n\n` +
      `A vaga foi liberada. Até a próxima! 👋`
    );
    setScreen("done");
  };

  const startRemarcar = () => {
    const svc = SERVICES.find(s => s.label === selectedBooking.service) || SERVICES[0];
    setService(svc);
    setScreen("agendar");
    setStep(1);
  };

  const slots = resolvedBarber && day ? slotsForBarber(resolvedBarber, day.label) : [];

  // ── Renders ──────────────────────────────────────────────

  const renderMenu = () => (
    <>
      <Bubble from="bot">{"Olá! 👋 Bem-vindo à *Barbearia do Zé*.\n\nO que posso fazer por você?"}</Bubble>
      <div style={{ paddingLeft:40 }}>
        <Btn onClick={() => { setScreen("agendar"); setStep(0); }} variant="green">📅 Agendar horário</Btn>
        <Btn onClick={() => { if (bookings.length) setScreen("remarcar"); }} variant="orange" disabled={bookings.length === 0}>
          🔄 Remarcar agendamento{bookings.length === 0 ? " (nenhum)" : ""}
        </Btn>
        <Btn onClick={() => { if (bookings.length) setScreen("cancelar"); }} variant="red" disabled={bookings.length === 0}>
          ❌ Cancelar agendamento{bookings.length === 0 ? " (nenhum)" : ""}
        </Btn>
      </div>
    </>
  );

  const renderAgendar = () => (
    <>
      <StepsBar current={step} />
      <div style={{ padding:"12px 12px 8px" }}>

        {step === 0 && (
          <>
            <Bubble from="bot">{"Qual serviço você quer hoje?"}</Bubble>
            <div style={{ paddingLeft:40 }}>
              {SERVICES.map(s => (
                <Btn key={s.id} onClick={() => { setService(s); go(1); }}>
                  {s.label}
                  <span style={{ float:"right", fontSize:11, color:"#888" }}>{s.price} · {s.duration}</span>
                </Btn>
              ))}
              <BackBtn onClick={reset} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            {service && <Bubble from="user">{service.label} — {service.price}</Bubble>}
            <Bubble from="bot">{"Com qual barbeiro prefere?"}</Bubble>
            <div style={{ paddingLeft:40 }}>
              {BARBERS.map(b => (
                <Btn key={b} onClick={() => chooseBarber(b)}>💈 {b}</Btn>
              ))}
              <Btn onClick={() => chooseBarber("auto")} variant="green">
                ⚡ Qualquer um disponível
                <span style={{ float:"right", fontSize:10, color:"#e8ffe8" }}>distribuição automática</span>
              </Btn>
              <BackBtn onClick={() => go(0)} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {barber === "auto"
              ? <Bubble from="user">⚡ Qualquer um disponível</Bubble>
              : <Bubble from="user">💈 {barber}</Bubble>}
            {barber === "auto" && resolvedBarber && (
              <Bubble from="bot">{`🤖 Atribuído automaticamente: ${resolvedBarber}\n(distribuição intercalada entre os barbeiros)`}</Bubble>
            )}
            <Bubble from="bot">{"Qual dia você prefere?"}</Bubble>
            <div style={{ paddingLeft:40 }}>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                {DAYS.map(d => (
                  <button key={d.label} onClick={() => { setDay(d); go(3); }} style={{
                    background:"#fff", border:"1.5px solid #ddd", borderRadius:10,
                    padding:"8px 12px", cursor:"pointer", textAlign:"center", fontSize:13,
                  }}>
                    <div style={{ fontWeight:"bold" }}>{d.label}</div>
                    <div style={{ fontSize:10, color:"#888" }}>{d.sub}</div>
                  </button>
                ))}
              </div>
              <BackBtn onClick={() => { setBarber(null); setResolvedBarber(null); go(1); }} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Bubble from="user">{day.label} · {day.sub}</Bubble>
            <Bubble from="bot">{`Horários com ${resolvedBarber} em ${day.label}:`}</Bubble>
            <div style={{ paddingLeft:40 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:8 }}>
                {slots.map(({ slot: s, taken }) => (
                  <button key={s} disabled={taken} onClick={() => { setSlot(s); go(4); }} style={{
                    background: taken ? "#f5f5f5" : "#fff",
                    color: taken ? "#bbb" : "#1a1a1a",
                    border: `1.5px solid ${taken ? "#eee" : "#ddd"}`,
                    borderRadius:8, padding:"8px 4px", fontSize:12,
                    cursor: taken ? "default" : "pointer",
                    textDecoration: taken ? "line-through" : "none",
                  }}>{s}</button>
                ))}
              </div>
              <div style={{ fontSize:10, color:"#aaa", marginBottom:8 }}>🔴 Riscado = ocupado</div>
              <BackBtn onClick={() => { setDay(null); go(2); }} />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <Bubble from="user">⏰ {slot}</Bubble>
            <Bubble from="bot">
              {`Confirma o agendamento?\n\n` +
               `📋 ${service.label}\n` +
               `💈 ${resolvedBarber}${barber==="auto" ? " (auto)" : ""}\n` +
               `📅 ${day.label}, ${day.sub}\n` +
               `⏰ ${slot}\n` +
               `💰 ${service.price}`}
            </Bubble>
            <div style={{ paddingLeft:40 }}>
              <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                <button onClick={() => { setSlot(null); go(3); }} style={{
                  flex:1, background:"#fff", border:"1.5px solid #ddd",
                  borderRadius:10, padding:"9px", fontSize:13, cursor:"pointer",
                }}>✏️ Corrigir</button>
                <button onClick={confirmBooking} style={{
                  flex:2, background:"#25d366", border:"none",
                  borderRadius:10, padding:"9px", fontSize:13,
                  cursor:"pointer", color:"#fff", fontWeight:"bold",
                }}>✅ Confirmar!</button>
              </div>
              <BackBtn onClick={() => { setSlot(null); go(3); }} />
            </div>
          </>
        )}
      </div>
    </>
  );

  const renderCancelarRemarcar = (mode) => (
    <div style={{ padding:"12px" }}>
      {!selectedBooking ? (
        <>
          <Bubble from="bot">
            {mode === "cancelar" ? "Qual agendamento quer cancelar?" : "Qual agendamento quer remarcar?"}
          </Bubble>
          <div style={{ paddingLeft:40 }}>
            {bookings.map(b => (
              <Btn key={b.id} onClick={() => setSelectedBooking(b)}>
                <div style={{ fontWeight:"bold" }}>{b.service}</div>
                <div style={{ fontSize:11, color:"#888", marginTop:2 }}>
                  💈 {b.barber} · 📅 {b.day} {b.sub} · ⏰ {b.slot} · {b.price}
                </div>
              </Btn>
            ))}
            <BackBtn onClick={reset} />
          </div>
        </>
      ) : (
        <>
          <Bubble from="user">
            {`${selectedBooking.service} — ${selectedBooking.day} ${selectedBooking.sub} às ${selectedBooking.slot}`}
          </Bubble>
          {mode === "cancelar" ? (
            <>
              <Bubble from="bot">
                {`⚠️ Confirma o cancelamento?\n\n` +
                 `📋 ${selectedBooking.service}\n` +
                 `💈 ${selectedBooking.barber}\n` +
                 `📅 ${selectedBooking.day}, ${selectedBooking.sub}\n` +
                 `⏰ ${selectedBooking.slot}`}
              </Bubble>
              <div style={{ paddingLeft:40 }}>
                <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                  <button onClick={() => setSelectedBooking(null)} style={{
                    flex:1, background:"#fff", border:"1.5px solid #ddd",
                    borderRadius:10, padding:"9px", fontSize:13, cursor:"pointer",
                  }}>← Voltar</button>
                  <button onClick={confirmCancel} style={{
                    flex:2, background:"#ff5252", border:"none",
                    borderRadius:10, padding:"9px", fontSize:13,
                    cursor:"pointer", color:"#fff", fontWeight:"bold",
                  }}>❌ Confirmar cancelamento</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Bubble from="bot">
                {`Vou te ajudar a remarcar.\nServiço ${selectedBooking.service} será mantido.\n\nCom qual barbeiro prefere?`}
              </Bubble>
              <div style={{ paddingLeft:40 }}>
                {BARBERS.map(b => (
                  <Btn key={b} onClick={() => { setBarber(b); setResolvedBarber(b); startRemarcar(); }}>💈 {b}</Btn>
                ))}
                <Btn onClick={() => { const rb = nextBarber(); setBarber("auto"); setResolvedBarber(rb); startRemarcar(); }} variant="green">
                  ⚡ Qualquer um disponível
                </Btn>
                <BackBtn onClick={() => setSelectedBooking(null)} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  const renderDone = () => (
    <div style={{ padding:"12px" }}>
      <Bubble from="bot">{doneMsg}</Bubble>
      {!doneMsg.includes("cancelado") && (
        <div style={{ paddingLeft:40 }}>
          <div style={{
            background:"#e8f5e9", borderRadius:10, padding:"10px 14px",
            fontSize:12, color:"#2e7d32", marginBottom:12,
          }}>
            📅 Evento criado no Google Agenda<br/>
            🔔 Lembrete programado para D-1
          </div>
        </div>
      )}
      <div style={{ paddingLeft:40 }}>
        <Btn onClick={reset} variant="green">🏠 Voltar ao menu principal</Btn>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh", background:"#ece5dd",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:16,
      fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{
          background:"#fff", borderRadius:20, overflow:"hidden",
          boxShadow:"0 8px 40px rgba(0,0,0,0.18)",
        }}>
          {/* Header */}
          <div style={{
            background:"#075e54", padding:"12px 16px",
            display:"flex", alignItems:"center", gap:12,
          }}>
            <div style={{
              width:40, height:40, borderRadius:"50%", background:"#25d366",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            }}>🪒</div>
            <div style={{ flex:1 }}>
              <div style={{ color:"#fff", fontWeight:"bold", fontSize:15 }}>Barbearia do Zé</div>
              <div style={{ color:"#b2dfdb", fontSize:11 }}>🟢 Victor e Marcos disponíveis</div>
            </div>
            <button onClick={reset} style={{
              background:"rgba(255,255,255,0.15)", border:"none",
              borderRadius:8, color:"#fff", fontSize:11,
              padding:"4px 10px", cursor:"pointer",
            }}>🏠 Menu</button>
          </div>

          {/* Chat */}
          <div style={{
            background:"#ece5dd", minHeight:440, maxHeight:540,
            overflowY:"auto", padding:"12px",
          }}>
            {screen === "menu"     && renderMenu()}
            {screen === "agendar"  && renderAgendar()}
            {screen === "cancelar" && renderCancelarRemarcar("cancelar")}
            {screen === "remarcar" && renderCancelarRemarcar("remarcar")}
            {screen === "done"     && renderDone()}
          </div>

          {/* Input bar */}
          <div style={{
            background:"#f0f0f0", padding:"10px 12px",
            display:"flex", alignItems:"center", gap:8,
          }}>
            <div style={{
              flex:1, background:"#fff", borderRadius:24,
              padding:"8px 16px", fontSize:12, color:"#aaa",
            }}>Toque em uma opção acima...</div>
            <div style={{
              width:38, height:38, borderRadius:"50%",
              background:"#25d366", display:"flex",
              alignItems:"center", justifyContent:"center", fontSize:17,
            }}>🎤</div>
          </div>
        </div>

        {/* Rodapé informativo */}
        <div style={{
          marginTop:14, background:"rgba(0,0,0,0.07)",
          borderRadius:12, padding:"12px 16px", fontSize:11, color:"#555",
        }}>
          <strong>⚡ Round-robin:</strong> "Qualquer um disponível" distribui
          automaticamente entre Victor e Marcos de forma intercalada,
          sem favorecer nenhum dos dois.
        </div>
      </div>
    </div>
  );
}
