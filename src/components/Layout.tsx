import { useState } from "react";
import type { Page, AppState } from "../types";

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: "dashboard",  label: "Обзор",       icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { id: "products",   label: "Товары",       icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
  { id: "shipments",  label: "Отгрузки",     icon: "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3 M9 12h13l-3-3m0 6 3-3" },
  { id: "deliveries", label: "Поставки",     icon: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" },
  { id: "suppliers",  label: "Поставщики",   icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { id: "employees",  label: "Сотрудники",   icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { id: "analytics",  label: "Аналитика",    icon: "M18 20V10 M12 20V4 M6 20v-6" },
  { id: "reports",    label: "Отчёты",       icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
  { id: "settings",   label: "Настройки",    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" },
];

export const PAGE_LABELS: Record<Page, string> = {
  dashboard: "Обзор", products: "Товары", shipments: "Отгрузки",
  deliveries: "Поставки", suppliers: "Поставщики", employees: "Сотрудники",
  analytics: "Аналитика", reports: "Отчёты", settings: "Настройки",
};

const roleLabel: Record<string, string> = { admin: "Администратор", manager: "Менеджер", operator: "Оператор" };

export default function Layout({ page, setPage, state, onLogout, sidebarOpen, setSidebarOpen }: {
  page: Page; setPage: (p: Page) => void; state: AppState; onLogout: () => void;
  sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = state.currentUser!;
  const initials = user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const navigate = (p: Page) => { setPage(p); setMobileOpen(false); };

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200
        w-[220px] overflow-hidden
        transition-[transform,width] duration-200 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:static lg:translate-x-0 lg:shrink-0
        ${sidebarOpen ? "lg:w-[220px]" : "lg:w-0 lg:border-0 lg:min-w-0"}
      `}>

        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-3 pl-5 border-b border-gray-100 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 14 14" fill="white" className="w-3.5 h-3.5">
              <rect x="1" y="1" width="5" height="5" rx="1"/>
              <rect x="8" y="1" width="5" height="5" rx="1"/>
              <rect x="1" y="8" width="5" height="5" rx="1"/>
              <rect x="8" y="8" width="5" height="5" rx="1"/>
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900 leading-tight">WareHQ</p>
            <p className="text-[10px] text-gray-400 truncate leading-tight">{state.companyName}</p>
          </div>
          <button
            type="button"
            title="Скрыть меню"
            onClick={() => setSidebarOpen(false)}
            className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
              <path d="M15 6l-6 6 6 6"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto flex flex-col gap-0.5">
          {NAV.map(({ id, label, icon }) => {
            const active = page === id;
            return (
              <button key={id} onClick={() => navigate(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                  ${active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
                  className={`w-4 h-4 shrink-0 ${active ? "text-blue-600" : "text-gray-400"}`}>
                  {icon.split(" M").map((d, i) => <path key={i} d={i === 0 ? d : "M" + d}/>)}
                </svg>
                <span className="flex-1">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-gray-100 p-3 shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{roleLabel[user.role]}</p>
            </div>
            <button onClick={onLogout} title="Выйти"
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-3.5 h-3.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}/>}

      {/* Mobile topbar */}
      <div className="fixed top-0 inset-x-0 z-20 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
            <path d="M3 6h18 M3 12h18 M3 18h18"/>
          </svg>
        </button>
        <span className="font-semibold text-sm text-gray-900">{PAGE_LABELS[page]}</span>
      </div>
    </>
  );
}
