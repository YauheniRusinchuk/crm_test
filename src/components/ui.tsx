import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useInView } from "../hooks";

function useLockBody() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ status }: { status: string }) => {
  const labels: Record<string, string> = {
    draft: "черновик", dispatched: "в пути", delivered: "доставлено",
    cancelled: "отменено", expected: "ожидается", received: "получено",
    partial: "частично", active: "активен", inactive: "неактивен",
    admin: "администратор", manager: "менеджер", operator: "оператор",
  };
  const style: Record<string, { dot: string; bg: string; text: string; border: string }> = {
    delivered:  { dot: "bg-emerald-500", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
    received:   { dot: "bg-emerald-500", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
    active:     { dot: "bg-emerald-500", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
    dispatched: { dot: "bg-blue-400",    bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-200"    },
    expected:   { dot: "bg-blue-400",    bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-200"    },
    partial:    { dot: "bg-amber-400",   bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"   },
    draft:      { dot: "bg-gray-400",    bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200"    },
    cancelled:  { dot: "bg-red-400",     bg: "bg-red-50",      text: "text-red-600",     border: "border-red-200"     },
    inactive:   { dot: "bg-gray-300",    bg: "bg-gray-100",    text: "text-gray-500",    border: "border-gray-200"    },
    admin:      { dot: "bg-violet-400",  bg: "bg-violet-50",   text: "text-violet-700",  border: "border-violet-200"  },
    manager:    { dot: "bg-blue-400",    bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-200"    },
    operator:   { dot: "bg-gray-400",    bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200"    },
  };
  const s = style[status] ?? { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded border uppercase tracking-wide whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`}/>
      {labels[status] ?? status}
    </span>
  );
};

export function formatWhen(iso: string) {
  if (!iso) return "—";
  const hasTime = iso.includes("T");
  const d = new Date(hasTime ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(hasTime ? { hour: "2-digit" as const, minute: "2-digit" as const } : {}),
  });
}

export function formatWhenShort(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export const StatusTimeline = ({ events, labels }: {
  events: { status: string; at: string }[];
  labels: Record<string, string>;
}) => (
  <div>
    <p className="text-xs text-gray-500 font-medium mb-3">История статусов</p>
    {events.length === 0 ? (
      <p className="text-sm text-gray-400">Пока нет событий</p>
    ) : (
      <div className="flex flex-col">
        {events.map((ev, i) => {
          const last = i === events.length - 1;
          return (
            <div key={`${ev.status}-${ev.at}-${i}`} className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${last ? "bg-blue-600" : "bg-gray-400"}`} />
                {i < events.length - 1 && <span className="w-px flex-1 bg-gray-200 min-h-[18px] my-1" />}
              </div>
              <div className={i < events.length - 1 ? "pb-3" : ""}>
                <p className="text-sm font-medium text-gray-900 leading-tight">{labels[ev.status] ?? ev.status}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatWhen(ev.at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export const StatusActions = ({ actions }: {
  actions: { label: string; onClick: () => void; variant?: "primary" | "danger" | "outline" }[];
}) => {
  if (!actions.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map(a => {
        const cls = a.variant === "danger"
          ? "text-rose-600 border-rose-200 hover:bg-rose-50"
          : a.variant === "outline"
            ? "text-gray-700 border-gray-200 hover:bg-gray-50"
            : "text-white bg-gray-900 border-gray-900 hover:bg-gray-800";
        return (
          <button key={a.label} type="button" onClick={a.onClick}
            className={`text-xs font-medium rounded-md border px-2.5 py-1 whitespace-nowrap transition-colors ${cls}`}>
            {a.label}
          </button>
        );
      })}
    </div>
  );
};

export const StatusHistoryLine = ({ events, labels }: {
  events: { status: string; at: string }[];
  labels: Record<string, string>;
}) => {
  if (!events.length) return null;
  return (
    <p className="text-[10px] text-gray-400 mt-1 leading-snug max-w-[260px]">
      {events.map((ev, i) => (
        <span key={`${ev.status}-${i}`}>
          {i > 0 && <span className="text-gray-300"> → </span>}
          {labels[ev.status] ?? ev.status} {formatWhenShort(ev.at)}
        </span>
      ))}
    </p>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
export const Stat = ({
  label, value, sub, variant = "default"
}: {
  label: string; value: string | number; sub?: string;
  variant?: "default" | "primary" | "black" | "accent";
}) => {
  const { ref, inView } = useInView();
  const variants = {
    default: "bg-white border border-gray-200 text-gray-900",
    primary: "bg-blue-600 text-white border-0",
    black:   "bg-gray-900 text-white border-0",
    accent:  "bg-gray-800 text-white border-0",
  };
  const subColor = variant === "default" ? "text-gray-400" : "text-white/60";
  const labelColor = variant === "default" ? "text-gray-400" : "text-white/60";
  return (
    <div ref={ref} className={`relative overflow-hidden rounded-xl p-5 flex flex-col gap-2 ${variants[variant]}`}
      style={{ opacity: inView ? 1 : 0, transition: "opacity 0.3s ease" }}>
      <span className={`text-[10px] font-semibold uppercase tracking-wider font-mono ${labelColor}`}>{label}</span>
      <span className="text-3xl font-bold leading-none tabular-nums">{value}</span>
      {sub && <span className={`text-xs ${subColor}`}>{sub}</span>}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, footer }: {
  title: string; onClose: () => void; children: ReactNode; footer?: ReactNode;
}) => {
  useLockBody();
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl shadow-black/10 animate-scale-in border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-base text-gray-900 truncate pr-4">{title}</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all text-lg leading-none font-light shrink-0">×</button>
        </div>
        <div className="overflow-y-auto px-6 py-5 min-h-0">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

// ─── Confirm dialog ───────────────────────────────────────────────────────────
export const ConfirmDialog = ({ title, message, confirmLabel = "Удалить", onConfirm, onCancel }: {
  title: string; message?: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
}) => {
  useLockBody();
  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm shadow-xl shadow-black/10 animate-scale-in border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-5">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg viewBox="0 0 20 20" fill="none" stroke="#EF4444" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" d="M10 10V6m0 5.5v.5"/>
              <path d="M8.485 3.515a2 2 0 0 1 3.03 0L17.5 10.5A2 2 0 0 1 16 13.5H4a2 2 0 0 1-1.5-3z"/>
            </svg>
          </div>
          <h2 className="font-semibold text-base text-gray-900 mb-1">{title}</h2>
          {message && <p className="text-sm text-gray-500 leading-relaxed">{message}</p>}
        </div>
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            Отмена
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <span className="text-xs font-medium text-gray-500">{label}</span>
    {children}
  </div>
);

export const inputCls = "bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors w-full placeholder:text-gray-300";

export type SelectOption = { value: string; label: string };

export const Select = ({
  value, onChange, options, placeholder, className = "",
  onCreate, createLabel = "Новая категория",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  onCreate?: (value: string) => void;
  createLabel?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createValue, setCreateValue] = useState("");
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openUp: false });

  const items = placeholder
    ? [{ value: "", label: placeholder }, ...options]
    : options;
  const selected = options.find(o => o.value === value);
  const display = selected?.label ?? placeholder ?? "Выбрать…";
  const isPlaceholder = !selected;

  const updatePos = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < 240 && r.top > spaceBelow;
    setPos({
      top: openUp ? r.top : r.bottom + 4,
      left: r.left,
      width: r.width,
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (open) updatePos();
  }, [open]);

  useLayoutEffect(() => {
    if (creating) createInputRef.current?.focus();
  }, [creating]);

  useEffect(() => {
    if (!open) {
      setCreating(false);
      setCreateValue("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (creating) { setCreating(false); setCreateValue(""); return; }
      setOpen(false);
    };
    const onReposition = () => updatePos();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    document.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      document.removeEventListener("scroll", onReposition, true);
    };
  }, [open, creating]);

  const commitCreate = () => {
    const name = createValue.trim();
    if (!name || !onCreate) return;
    const existing = options.find(o =>
      o.label.toLowerCase() === name.toLowerCase() || o.value.toLowerCase() === name.toLowerCase()
    );
    if (existing) onChange(existing.value);
    else { onCreate(name); onChange(name); }
    setOpen(false);
  };

  return (
    <div className={`relative min-w-0 ${className}`}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className={`${inputCls} flex items-center justify-between gap-2 text-left cursor-pointer ${isPlaceholder ? "text-gray-400" : "text-gray-900"} ${open ? "ring-1 ring-gray-400 border-gray-400" : ""}`}
      >
        <span className="truncate">{display}</span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>
      {open && createPortal(
        <div
          ref={listRef}
          role="listbox"
          className="fixed z-[200] bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/10 overflow-hidden flex flex-col"
          style={pos.openUp
            ? { left: pos.left, width: pos.width, bottom: window.innerHeight - pos.top + 4 }
            : { left: pos.left, width: pos.width, top: pos.top }}
        >
          <div className="py-1 max-h-52 overflow-y-auto">
            {items.map(o => {
              const active = o.value === value;
              const muted = o.value === "" && !!placeholder;
              return (
                <button
                  key={o.value || "__placeholder"}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm text-left transition-colors
                    ${active && !muted ? "bg-gray-100 text-gray-900 font-medium" : muted ? "text-gray-400" : "text-gray-700"}
                    hover:bg-gray-50`}
                >
                  <span className="truncate">{o.label}</span>
                  {active && !muted && (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 text-gray-500 shrink-0">
                      <path d="M3.5 8.5l3 3 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {onCreate && (
            <div className="border-t border-gray-100 p-1.5 bg-white">
              {creating ? (
                <div className="flex gap-1">
                  <input
                    ref={createInputRef}
                    className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    placeholder="Название"
                    value={createValue}
                    onChange={e => setCreateValue(e.target.value)}
                    onKeyDown={e => {
                      e.stopPropagation();
                      if (e.key === "Enter") { e.preventDefault(); commitCreate(); }
                      if (e.key === "Escape") { e.preventDefault(); setCreating(false); setCreateValue(""); }
                    }}
                  />
                  <button type="button" onClick={commitCreate}
                    className="px-2.5 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 shrink-0">
                    OK
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <span className="text-base leading-none font-light">+</span>
                  {createLabel}
                </button>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

// ─── Button ───────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, variant = "primary", size = "md", type = "button", disabled }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md"; type?: "button" | "submit"; disabled?: boolean;
}) => {
  const v = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    ghost:   "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
    danger:  "text-red-600 border border-gray-200 hover:bg-red-50",
    outline: "border border-gray-200 text-gray-700 hover:bg-gray-50",
  }[variant];
  const s = size === "sm" ? "px-3 py-1.5 text-xs rounded-md" : "px-3.5 py-2 text-sm rounded-md";
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${v} ${s} font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2`}>
      {children}
    </button>
  );
};

// ─── Bar chart ────────────────────────────────────────────────────────────────
export const BarChart = ({ data }: { data: { label: string; value: number; color?: string }[] }) => {
  const { ref, inView } = useInView();
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div ref={ref} className="flex flex-col gap-3">
      {data.map(({ label, value, color }, i) => (
        <div key={label} className="flex flex-col gap-1">
          <div className="flex justify-between text-xs items-center">
            <span className="text-gray-600 font-medium truncate mr-4">{label}</span>
            <span className="font-mono text-gray-400 shrink-0 text-[11px]">{value.toLocaleString("ru-RU")}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full"
              style={{
                width: inView ? `${(value / max) * 100}%` : "0%",
                backgroundColor: color ?? "#374151",
                transition: `width 0.7s cubic-bezier(0.4,0,0.2,1) ${i * 0.06}s`,
              }}/>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Table helpers ────────────────────────────────────────────────────────────
export const TableHead = ({ cols }: { cols: string[] }) => (
  <thead>
    <tr className="border-b border-gray-100 bg-gray-50/80">
      {cols.map(c => (
        <th key={c} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 font-mono whitespace-nowrap">{c}</th>
      ))}
    </tr>
  </thead>
);

export const EmptyRow = ({ cols, msg = "Нет данных" }: { cols: number; msg?: string }) => (
  <tr><td colSpan={cols} className="px-4 py-12 text-center text-gray-400 text-sm">{msg}</td></tr>
);

export const Stars = ({ n }: { n: number }) => (
  <span>
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`text-sm ${i < n ? "text-amber-400" : "text-gray-200"}`}>★</span>
    ))}
  </span>
);

export const SearchInput = ({ value, onChange, placeholder = "Поиск…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all w-full max-w-xs hover:border-gray-300"/>
  </div>
);

// ─── Page header ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">{title}</h1>
      {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
    </div>
    {action && <div className="flex items-center gap-2 mt-0.5">{action}</div>}
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white rounded-lg border border-gray-200 ${onClick ? "cursor-pointer hover:border-gray-300 transition-colors" : ""} ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
    <span className="text-sm font-medium text-gray-700">{title}</span>
    {action && <div>{action}</div>}
  </div>
);

// ─── Section divider with label ───────────────────────────────────────────────
export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-gray-400 mb-3">{children}</p>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGE_SIZE = 20;

export const Pagination = ({ page, total, pageSize = PAGE_SIZE, onChange }: {
  page: number; total: number; pageSize?: number; onChange: (p: number) => void;
}) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  // Show at most 7 page buttons with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btn = "w-8 h-8 flex items-center justify-center rounded text-sm transition-colors";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">{from}–{to} из {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className={`${btn} text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed`}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4"><path d="M10 12L6 8l4-4"/></svg>
        </button>
        {pages.map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
            : <button key={p} onClick={() => onChange(p as number)}
                className={`${btn} text-sm font-medium ${page === p ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                {p}
              </button>
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className={`${btn} text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed`}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4"><path d="M6 4l4 4-4 4"/></svg>
        </button>
      </div>
    </div>
  );
};
