import { useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const EVENT_COLORS = [
  { hex: "#E2EF80", label: "Lime" },
  { hex: "#DA624A", label: "Terra" },
  { hex: "#9BDEFF", label: "Sky" },
  { hex: "#0960BD", label: "Navy" },
  { hex: "#878ECD", label: "Lavender" },
  { hex: "#F5D97E", label: "Straw" },
  { hex: "#512153", label: "Plum" },
  { hex: "#DD8288", label: "Rose" },
  { hex: "#1B6055", label: "Forest" },
  { hex: "#5A988E", label: "Teal" },
];

function textOnColor(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (0.299*r + 0.587*g + 0.114*b)/255 > 0.55 ? "#1a1714" : "#ffffff";
}

const SAMPLE_EVENTS = {
  "2026-3-5":  [{ id:1, title:"Team Sync",         time:"9:00 AM",  slot:"am", color:"#878ECD", status:"busy",  desc:"Weekly team check-in." }],
  "2026-3-10": [{ id:2, title:"Design Review",      time:"2:00 PM",  slot:"pm", color:"#DA624A", status:"busy",  desc:"Review latest mockups." }],
  "2026-3-15": [
    { id:3, title:"Sprint Planning", time:"10:00 AM", slot:"am", color:"#9BDEFF", status:"busy",  desc:"Plan next two-week sprint." },
    { id:4, title:"Lunch w/ Sarah",  time:"12:30 PM", slot:"pm", color:"#F5D97E", status:"free",  desc:"Catch up over lunch." }
  ],
  "2026-3-18": [{ id:5, title:"Doctor Appt",        time:"3:00 PM",  slot:"pm", color:"#1B6055", status:"busy",  desc:"Annual checkup." }],
  "2026-3-22": [{ id:6, title:"Stand-up",            time:"9:15 AM",  slot:"am", color:"#E2EF80", status:"free",  desc:"Daily async stand-up." }],
  "2026-3-27": [{ id:7, title:"Quarterly Review",   time:"11:00 AM", slot:"am", color:"#DD8288", status:"busy",  desc:"Q1 results presentation." }],
};

function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function getFirstDay(y,m){ return new Date(y,m,1).getDay(); }
function eKey(y,m,d){ return `${y}-${m+1}-${d}`; }

// ─────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#f7f6f3;--surface:#fff;--surface-2:#f0ede8;--border:#e5e0d8;
    --text-primary:#1a1714;--text-secondary:#7c756e;--text-muted:#b0a99f;
    --accent:#0960BD;--accent-light:#e8f1fb;
    --today-bg:#1a1714;--today-text:#fff;
    --shadow-sm:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
    --shadow-md:0 4px 16px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05);
    --shadow-lg:0 12px 40px rgba(0,0,0,.14),0 4px 12px rgba(0,0,0,.08);
    --radius:12px;--radius-sm:8px;
  }
  .cal-root{font-family:'DM Sans',sans-serif;background:var(--bg);min-height:100vh;
    display:flex;justify-content:center;align-items:flex-start;padding:40px 24px;}
  .cal-container{width:100%;max-width:980px;display:grid;
    grid-template-columns:1fr 290px;gap:20px;align-items:start;}

  .cal-main{background:var(--surface);border-radius:20px;border:1px solid var(--border);
    box-shadow:var(--shadow-md);overflow:hidden;}
  .cal-header{display:flex;align-items:center;justify-content:space-between;
    padding:28px 32px 20px;border-bottom:1px solid var(--border);}
  .cal-month-year{display:flex;flex-direction:column;gap:2px;}
  .cal-month{font-family:'DM Serif Display',serif;font-size:28px;font-style:italic;
    color:var(--text-primary);line-height:1;}
  .cal-year{font-size:13px;color:var(--text-muted);letter-spacing:.05em;}
  .cal-nav{display:flex;align-items:center;gap:4px;}
  .cal-nav-btn{width:36px;height:36px;border:1px solid var(--border);background:var(--surface);
    border-radius:var(--radius-sm);cursor:pointer;display:flex;align-items:center;
    justify-content:center;color:var(--text-secondary);font-size:16px;transition:all .15s;outline:none;}
  .cal-nav-btn:hover{background:var(--surface-2);border-color:var(--text-muted);color:var(--text-primary);}
  .cal-today-btn{padding:0 14px;height:36px;border:1px solid var(--border);background:var(--surface);
    border-radius:var(--radius-sm);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;
    font-weight:500;color:var(--text-secondary);transition:all .15s;outline:none;margin-right:8px;}
  .cal-today-btn:hover{background:var(--surface-2);color:var(--text-primary);}

  .cal-grid{padding:16px 20px 20px;}
  .cal-weekdays{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;}
  .cal-weekday{text-align:center;font-size:11px;font-weight:600;letter-spacing:.08em;
    text-transform:uppercase;color:var(--text-muted);padding:6px 0;}
  .cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}

  /* DAY CELL */
  .cal-day{display:flex;flex-direction:column;border-radius:var(--radius-sm);
    cursor:pointer;transition:background .12s;position:relative;min-height:76px;overflow:hidden;}
  .cal-day:hover:not(.cal-day--other-month){background:var(--surface-2);}
  .cal-day--other-month{cursor:default;opacity:.28;}
  .cal-day--selected:not(.cal-day--today){background:var(--accent-light);}
  .cal-day-header{display:flex;justify-content:center;padding:5px 4px 2px;flex-shrink:0;}
  .cal-day-num{width:26px;height:26px;display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:500;color:var(--text-secondary);border-radius:50%;}
  .cal-day--today .cal-day-num{background:var(--today-bg);color:var(--today-text);font-weight:600;}
  .cal-day--selected:not(.cal-day--today) .cal-day-num{color:var(--accent);font-weight:600;}
  .cal-day--other-month .cal-day-num{color:var(--text-muted);}

  .cal-day-am,.cal-day-pm{flex:1;display:flex;flex-wrap:wrap;gap:2px;padding:1px 3px;align-content:flex-start;}
  .cal-day-divider{height:1px;background:var(--border);margin:0 3px;flex-shrink:0;opacity:.5;}

  .cal-chip{display:flex;align-items:center;gap:2px;border-radius:3px;padding:1px 4px;
    font-size:9px;font-weight:600;line-height:1.4;cursor:default;
    max-width:100%;overflow:hidden;white-space:nowrap;transition:opacity .12s;flex-shrink:0;}
  .cal-chip-dot{width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.6;flex-shrink:0;}
  .cal-chip-move{display:none;background:none;border:none;cursor:pointer;
    font-size:10px;padding:0 1px;line-height:1;opacity:.7;font-family:inherit;}
  .cal-chip:hover .cal-chip-move{display:inline;}
  .cal-chip-move:hover{opacity:1;}

  /* SIDEBAR */
  .cal-sidebar{display:flex;flex-direction:column;gap:16px;}
  .cal-sidebar-card{background:var(--surface);border-radius:16px;border:1px solid var(--border);
    box-shadow:var(--shadow-sm);padding:22px;}
  .cal-sidebar-title{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
    color:var(--text-muted);margin-bottom:14px;}
  .cal-selected-date{font-family:'DM Serif Display',serif;font-size:42px;line-height:1;
    color:var(--text-primary);margin-bottom:4px;}
  .cal-selected-weekday{font-size:14px;color:var(--text-secondary);}
  .cal-events-list{display:flex;flex-direction:column;gap:8px;margin-top:16px;}
  .cal-event-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;
    border-radius:var(--radius-sm);background:var(--surface-2);border:1px solid var(--border);
    transition:all .12s;}
  .cal-event-item:hover{border-color:var(--text-muted);transform:translateY(-1px);box-shadow:var(--shadow-sm);}
  .cal-event-stripe{width:3px;border-radius:3px;min-height:34px;align-self:stretch;flex-shrink:0;}
  .cal-event-info{flex:1;min-width:0;}
  .cal-event-title{font-size:13px;font-weight:600;color:var(--text-primary);
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .cal-event-meta{font-size:11px;color:var(--text-muted);margin-top:2px;}
  .cal-event-desc{font-size:12px;color:var(--text-secondary);margin-top:4px;line-height:1.4;white-space:pre-wrap;}
  .cal-event-status{display:inline-block;font-size:10px;font-weight:600;letter-spacing:.05em;
    text-transform:uppercase;padding:1px 6px;border-radius:20px;margin-top:5px;}
  .cal-event-status--free{background:#e8f5e9;color:#2e7d32;}
  .cal-event-status--busy{background:#fce4ec;color:#c62828;}
  .cal-no-events{font-size:13px;color:var(--text-muted);text-align:center;padding:16px 0;font-style:italic;}
  .cal-add-btn{width:100%;padding:11px;background:var(--text-primary);color:#fff;border:none;
    border-radius:var(--radius-sm);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
    cursor:pointer;transition:opacity .15s;margin-top:12px;}
  .cal-add-btn:hover{opacity:.85;}
  .cal-upcoming-item{display:flex;align-items:center;gap:10px;padding:8px 0;
    border-bottom:1px solid var(--border);}
  .cal-upcoming-item:last-child{border-bottom:none;}
  .cal-upcoming-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
  .cal-upcoming-info{flex:1;min-width:0;}
  .cal-upcoming-title{font-size:13px;font-weight:500;color:var(--text-primary);
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .cal-upcoming-date{font-size:11px;color:var(--text-muted);margin-top:1px;}

  /* MODAL */
  .modal-overlay{position:fixed;inset:0;background:rgba(20,17,14,.48);backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;z-index:1000;animation:fadeIn .18s ease;}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .modal{background:var(--surface);border-radius:20px;box-shadow:var(--shadow-lg);
    width:100%;max-width:460px;margin:16px;animation:slideUp .2s ease;
    max-height:90vh;overflow-y:auto;}
  @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .modal-header{display:flex;align-items:center;justify-content:space-between;padding:24px 28px 0;}
  .modal-title{font-family:'DM Serif Display',serif;font-size:22px;font-style:italic;color:var(--text-primary);}
  .modal-close{width:32px;height:32px;border:1px solid var(--border);background:none;border-radius:50%;
    cursor:pointer;font-size:18px;color:var(--text-secondary);display:flex;align-items:center;
    justify-content:center;transition:all .15s;line-height:1;}
  .modal-close:hover{background:var(--surface-2);color:var(--text-primary);}
  .modal-date-label{font-size:12px;color:var(--text-muted);padding:6px 28px 0;}
  .modal-body{padding:16px 28px 28px;display:flex;flex-direction:column;gap:16px;}
  .modal-field{display:flex;flex-direction:column;gap:6px;}
  .modal-label{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);}
  .modal-input{padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);
    font-family:'DM Sans',sans-serif;font-size:14px;color:var(--text-primary);
    background:var(--surface);outline:none;transition:border-color .15s;}
  .modal-input:focus{border-color:var(--accent);}
  .modal-textarea{padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);
    font-family:'DM Sans',sans-serif;font-size:14px;color:var(--text-primary);
    background:var(--surface);outline:none;transition:border-color .15s;
    resize:vertical;min-height:88px;line-height:1.5;}
  .modal-textarea:focus{border-color:var(--accent);}
  .modal-radio-group{display:flex;gap:10px;}
  .modal-radio-opt{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;
    padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);
    cursor:pointer;transition:all .15s;font-size:13px;font-weight:500;color:var(--text-secondary);
    user-select:none;}
  .modal-radio-opt input{display:none;}
  .modal-radio-opt.sel-free{border-color:#2e7d32;background:#e8f5e9;color:#2e7d32;}
  .modal-radio-opt.sel-busy{border-color:#c62828;background:#fce4ec;color:#c62828;}
  .modal-slot-group{display:flex;gap:10px;}
  .modal-slot-btn{flex:1;padding:9px;border:1.5px solid var(--border);border-radius:var(--radius-sm);
    background:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;
    font-weight:500;color:var(--text-secondary);transition:all .15s;}
  .modal-slot-btn.sel{border-color:var(--accent);background:var(--accent-light);color:var(--accent);}
  .modal-color-grid{display:flex;flex-wrap:wrap;gap:8px;}
  .modal-swatch{width:30px;height:30px;border-radius:50%;cursor:pointer;
    border:2.5px solid transparent;transition:transform .12s,border-color .12s;flex-shrink:0;}
  .modal-swatch:hover{transform:scale(1.18);}
  .modal-swatch.sel{border-color:var(--text-primary);transform:scale(1.18);}
  .modal-footer{display:flex;gap:10px;}
  .modal-btn-cancel{flex:1;padding:11px;border:1.5px solid var(--border);background:none;
    border-radius:var(--radius-sm);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
    color:var(--text-secondary);cursor:pointer;transition:all .15s;}
  .modal-btn-cancel:hover{background:var(--surface-2);}
  .modal-btn-save{flex:2;padding:11px;background:var(--text-primary);color:#fff;border:none;
    border-radius:var(--radius-sm);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
    cursor:pointer;transition:opacity .15s;}
  .modal-btn-save:hover{opacity:.85;}
  .modal-btn-save:disabled{opacity:.38;cursor:not-allowed;}

  @media(max-width:700px){
    .cal-container{grid-template-columns:1fr;}
    .cal-root{padding:16px;}
    .cal-header{padding:20px 20px 16px;}
    .cal-grid{padding:10px 10px 14px;}
  }
`;

// ─────────────────────────────────────────
// MODAL COMPONENT
// ─────────────────────────────────────────
function AddEventModal({ dateLabel, onClose, onSave }) {
  const [title,  setTitle]  = useState("");
  const [time,   setTime]   = useState("");
  const [status, setStatus] = useState("free");
  const [desc,   setDesc]   = useState("");
  const [color,  setColor]  = useState(EVENT_COLORS[0].hex);
  const [slot,   setSlot]   = useState("am");

  const valid = title.trim().length > 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">New Event</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-date-label">{dateLabel}</div>

        <div className="modal-body">
          {/* Name */}
          <div className="modal-field">
            <label className="modal-label">Event Name</label>
            <input
              className="modal-input"
              placeholder="e.g. Team meeting"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Time */}
          <div className="modal-field">
            <label className="modal-label">Time</label>
            <input
              className="modal-input"
              placeholder="e.g. 9:00 AM or All day"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          {/* AM / PM slot */}
          <div className="modal-field">
            <label className="modal-label">Show in calendar as</label>
            <div className="modal-slot-group">
              <button className={`modal-slot-btn${slot==="am"?" sel":""}`} onClick={() => setSlot("am")}>
                ☀️ Morning
              </button>
              <button className={`modal-slot-btn${slot==="pm"?" sel":""}`} onClick={() => setSlot("pm")}>
                🌙 Afternoon / Evening
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="modal-field">
            <label className="modal-label">Availability</label>
            <div className="modal-radio-group">
              <label className={`modal-radio-opt${status==="free"?" sel-free":""}`}>
                <input type="radio" name="status" checked={status==="free"} onChange={() => setStatus("free")} />
                ✓ Free
              </label>
              <label className={`modal-radio-opt${status==="busy"?" sel-busy":""}`}>
                <input type="radio" name="status" checked={status==="busy"} onChange={() => setStatus("busy")} />
                ✗ Busy
              </label>
            </div>
          </div>

          {/* Color */}
          <div className="modal-field">
            <label className="modal-label">Color</label>
            <div className="modal-color-grid">
              {EVENT_COLORS.map(c => (
                <div
                  key={c.hex}
                  className={`modal-swatch${color===c.hex?" sel":""}`}
                  style={{ background: c.hex }}
                  title={c.label}
                  onClick={() => setColor(c.hex)}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="modal-field">
            <label className="modal-label">Description</label>
            <textarea
              className="modal-textarea"
              placeholder="Optional notes about this event…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="modal-btn-save"
              disabled={!valid}
              onClick={() => onSave({ title: title.trim(), time: time.trim() || "All day", status, desc, color, slot })}
            >
              Save Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────
export default function CalendarApp() {
  const today = new Date(2026, 2, 22);
  const [current,   setCurrent]   = useState({ year: 2026, month: 2 });
  const [selected,  setSelected]  = useState({ year: 2026, month: 2, day: 22 });
  const [events,    setEvents]    = useState(SAMPLE_EVENTS);
  const [showModal, setShowModal] = useState(false);

  const { year, month } = current;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDay(year, month);
  const daysInPrev  = getDaysInMonth(year, month === 0 ? 11 : month - 1);

  const prevMonth = () => setCurrent(c => c.month===0 ? {year:c.year-1,month:11} : {...c,month:c.month-1});
  const nextMonth = () => setCurrent(c => c.month===11 ? {year:c.year+1,month:0}  : {...c,month:c.month+1});
  const goToday   = () => {
    setCurrent({ year: today.getFullYear(), month: today.getMonth() });
    setSelected({ year: today.getFullYear(), month: today.getMonth(), day: today.getDate() });
  };

  // Build 6-week grid
  const cells = [];
  for (let i = firstDay-1; i >= 0; i--) cells.push({ day: daysInPrev-i, type:"prev" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type:"current" });
  for (let d = 1; d <= 42 - cells.length; d++) cells.push({ day: d, type:"next" });

  const selectedKey    = eKey(selected.year, selected.month, selected.day);
  const selectedEvents = events[selectedKey] || [];
  const selectedDate   = new Date(selected.year, selected.month, selected.day);
  const selectedWD     = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][selectedDate.getDay()];

  function addEvent(fields) {
    setEvents(prev => ({
      ...prev,
      [selectedKey]: [...(prev[selectedKey] || []), { id: Date.now(), ...fields }]
    }));
    setShowModal(false);
  }

  function moveSlot(key, id, slot) {
    setEvents(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(e => e.id === id ? { ...e, slot } : e)
    }));
  }

  const allEvents = Object.entries(events)
    .flatMap(([key, evs]) => {
      const [y,m,d] = key.split("-").map(Number);
      const date = new Date(y, m-1, d);
      return evs.map(e => ({ ...e, date, dateStr: `${MONTHS[m-1]} ${d}` }));
    })
    .filter(e => e.date >= today)
    .sort((a,b) => a.date - b.date)
    .slice(0, 5);

  return (
    <>
      <style>{styles}</style>

      {showModal && (
        <AddEventModal
          dateLabel={`${selectedWD}, ${MONTHS[selected.month]} ${selected.day}, ${selected.year}`}
          onClose={() => setShowModal(false)}
          onSave={addEvent}
        />
      )}

      <div className="cal-root">
        <div className="cal-container">

          {/* ── MAIN CALENDAR ── */}
          <div className="cal-main">
            <div className="cal-header">
              <div className="cal-month-year">
                <span className="cal-month">{MONTHS[month]}</span>
                <span className="cal-year">{year}</span>
              </div>
              <div className="cal-nav">
                <button className="cal-today-btn" onClick={goToday}>Today</button>
                <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                <button className="cal-nav-btn" onClick={nextMonth}>›</button>
              </div>
            </div>

            <div className="cal-grid">
              <div className="cal-weekdays">
                {DAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
              </div>
              <div className="cal-days">
                {cells.map((cell, i) => {
                  const isCurrentMonth = cell.type === "current";
                  const cellYear  = cell.type==="prev"  ? (month===0  ? year-1 : year) :
                                    cell.type==="next"  ? (month===11 ? year+1 : year) : year;
                  const cellMonth = cell.type==="prev"  ? (month===0  ? 11 : month-1)  :
                                    cell.type==="next"  ? (month===11 ? 0  : month+1)  : month;
                  const isToday    = isCurrentMonth && cell.day===today.getDate() && month===today.getMonth() && year===today.getFullYear();
                  const isSelected = cell.day===selected.day && cellMonth===selected.month && cellYear===selected.year;
                  const key        = eKey(cellYear, cellMonth, cell.day);
                  const dayEvents  = events[key] || [];
                  const amEvs      = dayEvents.filter(e => e.slot === "am");
                  const pmEvs      = dayEvents.filter(e => e.slot === "pm");

                  let cls = "cal-day";
                  if (!isCurrentMonth) cls += " cal-day--other-month";
                  if (isToday)         cls += " cal-day--today";
                  if (isSelected)      cls += " cal-day--selected";

                  const Chip = ({ ev, slotDir }) => {
                    const fg = textOnColor(ev.color);
                    return (
                      <div className="cal-chip" style={{ background: ev.color, color: fg }} title={ev.title}>
                        {slotDir === "pm" && (
                          <button className="cal-chip-move" style={{ color: fg }}
                            title="Move to morning"
                            onClick={e => { e.stopPropagation(); moveSlot(key, ev.id, "am"); }}>↑</button>
                        )}
                        <span className="cal-chip-dot" />
                        <span style={{ overflow:"hidden", textOverflow:"ellipsis", maxWidth:58 }}>{ev.title}</span>
                        {slotDir === "am" && (
                          <button className="cal-chip-move" style={{ color: fg }}
                            title="Move to afternoon"
                            onClick={e => { e.stopPropagation(); moveSlot(key, ev.id, "pm"); }}>↓</button>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div key={i} className={cls}
                      onClick={() => isCurrentMonth && setSelected({ year:cellYear, month:cellMonth, day:cell.day })}>
                      <div className="cal-day-header">
                        <div className="cal-day-num">{cell.day}</div>
                      </div>
                      <div className="cal-day-am">
                        {amEvs.map(ev => <Chip key={ev.id} ev={ev} slotDir="am" />)}
                      </div>
                      {amEvs.length > 0 && pmEvs.length > 0 && <div className="cal-day-divider" />}
                      <div className="cal-day-pm">
                        {pmEvs.map(ev => <Chip key={ev.id} ev={ev} slotDir="pm" />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div className="cal-sidebar">
            <div className="cal-sidebar-card">
              <div className="cal-sidebar-title">Selected Day</div>
              <div className="cal-selected-date">{selected.day}</div>
              <div className="cal-selected-weekday">{selectedWD}, {MONTHS[selected.month]} {selected.year}</div>

              <div className="cal-events-list">
                {selectedEvents.length === 0
                  ? <div className="cal-no-events">No events</div>
                  : selectedEvents.map(ev => (
                    <div key={ev.id} className="cal-event-item">
                      <div className="cal-event-stripe" style={{ background: ev.color }} />
                      <div className="cal-event-info">
                        <div className="cal-event-title">{ev.title}</div>
                        <div className="cal-event-meta">
                          {ev.time}{ev.slot ? (ev.slot==="am" ? " · ☀️ Morning" : " · 🌙 Afternoon") : ""}
                        </div>
                        {ev.desc && <div className="cal-event-desc">{ev.desc}</div>}
                        <span className={`cal-event-status cal-event-status--${ev.status || "free"}`}>
                          {ev.status || "free"}
                        </span>
                      </div>
                    </div>
                  ))
                }
              </div>

              <button className="cal-add-btn" onClick={() => setShowModal(true)}>
                + Add Event
              </button>
            </div>

            <div className="cal-sidebar-card">
              <div className="cal-sidebar-title">Upcoming</div>
              {allEvents.length === 0
                ? <div className="cal-no-events">Nothing coming up</div>
                : allEvents.map(ev => (
                  <div key={ev.id} className="cal-upcoming-item">
                    <div className="cal-upcoming-dot" style={{ background: ev.color }} />
                    <div className="cal-upcoming-info">
                      <div className="cal-upcoming-title">{ev.title}</div>
                      <div className="cal-upcoming-date">{ev.dateStr} · {ev.time}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </>
  );
}