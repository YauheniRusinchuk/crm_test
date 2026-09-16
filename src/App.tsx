import { useState, useEffect, useCallback } from "react";
import type { AppState, Page, User, Product, Supplier, Shipment, Delivery } from "./types";
import { loadState, saveState, defaultState } from "./data";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Shipments from "./pages/Shipments";
import Deliveries from "./pages/Deliveries";
import Suppliers from "./pages/Suppliers";
import Employees from "./pages/Employees";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Layout, { PAGE_LABELS } from "./components/Layout";

const SIDEBAR_KEY = "warehq_sidebar";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState() ?? defaultState());
  const [page, setPage] = useState<Page>("dashboard");
  const [pageKey, setPageKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) !== "0"; } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? "1" : "0"); } catch { /* ignore */ }
  }, [sidebarOpen]);

  useEffect(() => { saveState(state); }, [state]);

  const patch = useCallback((partial: Partial<AppState>) => setState(s => ({ ...s, ...partial })), []);

  const navigate = (p: Page) => { setPage(p); setPageKey(k => k + 1); };

  const handleLogin    = (user: User)    => patch({ currentUser: user });
  const handleRegister = (user: User)    => patch({ users: [...state.users, user], currentUser: user });
  const handleLogout   = ()              => patch({ currentUser: null });

  if (!state.currentUser) return <Auth state={state} onLogin={handleLogin} onRegister={handleRegister} />;

  const setProducts  = (products: Product[])   => patch({ products });
  const setCategories= (categories: string[])  => patch({ categories });
  const setSuppliers = (suppliers: Supplier[]) => patch({ suppliers });
  const setShipments = (shipments: Shipment[]) => patch({ shipments });
  const setDeliveries= (deliveries: Delivery[])=> patch({ deliveries });
  const setUsers     = (users: User[])          => patch({ users });

  return (
    <div className="flex h-full bg-gray-100 text-gray-900">
      <Layout page={page} setPage={navigate} state={state} onLogout={handleLogout}
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Desktop topbar */}
        <header className="h-14 bg-white border-b border-gray-200 px-4 hidden lg:flex items-center gap-3 shrink-0 sticky top-0 z-10">
          <button
            type="button"
            title={sidebarOpen ? "Скрыть меню" : "Показать меню"}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors shrink-0"
          >
            {sidebarOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
                <path d="M4 6h10 M4 12h16 M4 18h10 M18 8l-4 4 4 4"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
                <path d="M3 6h18 M3 12h18 M3 18h18"/>
              </svg>
            )}
          </button>
          <p className="flex-1 text-sm font-semibold text-gray-800">{PAGE_LABELS[page]}</p>
          <div className="flex items-center gap-2">
            {state.currentUser && (
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-[11px] font-bold text-white cursor-default select-none" title={state.currentUser.name}>
                {state.currentUser.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div key={pageKey} className="w-full max-w-none p-4 sm:p-5 lg:p-6 xl:p-8 animate-fade-up">
            {page === "dashboard"  && <Dashboard  state={state} />}
            {page === "products"   && <Products   state={state} setProducts={setProducts} setCategories={setCategories} />}
            {page === "shipments"  && <Shipments  state={state} setShipments={setShipments} />}
            {page === "deliveries" && <Deliveries state={state} setDeliveries={setDeliveries} setProducts={setProducts} />}
            {page === "suppliers"  && <Suppliers  state={state} setSuppliers={setSuppliers} />}
            {page === "employees"  && <Employees  state={state} setUsers={setUsers} />}
            {page === "analytics"  && <Analytics  state={state} />}
            {page === "reports"    && <Reports    state={state} />}
            {page === "settings"   && <Settings   state={state} setState={patch} />}
          </div>
        </main>
      </div>
    </div>
  );
}
