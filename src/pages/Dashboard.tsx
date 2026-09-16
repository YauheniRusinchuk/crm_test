import { useCounter, useInView } from "../hooks";
import type { AppState } from "../types";
import { Badge, BarChart, Card, CardHeader } from "../components/ui";

function StockRing({ label, value, total, color }: {
  label: string; value: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = 32; const circ = 2 * Math.PI * r;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4 w-full min-w-0">
      <svg viewBox="0 0 72 72" className="w-12 h-12 -rotate-90 shrink-0">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#E5E7EB" strokeWidth="6"/>
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }}/>
      </svg>
      <div>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        <p className="text-[10px] text-gray-400">{pct}%</p>
      </div>
    </div>
  );
}

function Metric({ label, value, suffix = "", sub, delay = 0 }: {
  label: string; value: number; suffix?: string; sub?: string; delay?: number;
}) {
  const { ref, inView } = useInView();
  const count = useCounter(value, 900, inView);
  return (
    <div ref={ref} className="bg-white border border-gray-200 rounded-lg p-5 w-full min-w-0"
      style={{ opacity: inView ? 1 : 0, transition: `opacity 0.3s ease ${delay}s` }}>
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{count.toLocaleString("ru-RU")}{suffix}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ state }: { state: AppState }) {
  const { products, shipments, deliveries, suppliers, currency } = state;

  const totalCost  = products.reduce((a, p) => a + p.stock * p.costPrice, 0);
  const totalSell  = products.reduce((a, p) => a + p.stock * p.sellPrice, 0);
  const dispatched = shipments.filter(s => s.status === "dispatched").length;
  const expected   = deliveries.filter(d => d.status === "expected").length;
  const revenue    = shipments
    .filter(s => s.status === "delivered")
    .reduce((a, s) => a + s.items.reduce((b, it) => {
      const p = products.find(x => x.id === it.productId);
      return b + (p ? it.qty * p.sellPrice : 0);
    }, 0), 0);

  const catMap: Record<string, number> = {};
  products.forEach(p => { catMap[p.category] = (catMap[p.category] ?? 0) + p.stock * p.costPrice; });
  const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value: Math.round(value) }));

  const recentActivity = [
    ...shipments.map(s => ({ type: "отгрузка", ref: s.ref, info: s.destination,                                          status: s.status, date: s.date })),
    ...deliveries.map(d => ({ type: "поставка", ref: d.ref, info: suppliers.find(s => s.id === d.supplierId)?.name ?? "—", status: d.status, date: d.expectedDate })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const healthy = products.filter(p => p.stock > p.minStock).length;
  const low     = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const out     = products.filter(p => p.stock === 0).length;

  return (
    <div className="flex flex-col gap-5 w-full min-w-0">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Обзор склада</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Metric label="Стоимость остатков"  value={totalCost}  suffix={` ${currency}`} sub="по себестоимости"   delay={0}/>
        <Metric label="Потенц. выручка"     value={totalSell}  suffix={` ${currency}`} sub="по ценам продажи"   delay={0.05}/>
        <Metric label="Выручка отгрузок"    value={revenue}    suffix={` ${currency}`} sub="по доставленным"    color="text-blue-700" delay={0.1}/>
        <Metric label="В пути / ожидается"  value={dispatched + expected}               sub={`${dispatched} отгрузок · ${expected} поставок`} delay={0.15}/>
      </div>

      {/* Stock health */}
      <div>
        <p className="text-xs text-gray-500 mb-3">Состояние запасов</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StockRing label="В норме"        value={healthy} total={products.length} color="#6B7280"/>
          <StockRing label="Ниже минимума"  value={low}     total={products.length} color="#9CA3AF"/>
          <StockRing label="Нет на складе"  value={out}     total={products.length} color="#D1D5DB"/>
        </div>
      </div>

      {/* Category chart */}
      <Card>
        <CardHeader title="Запасы по категориям"/>
        <div className="p-5">
          <BarChart data={catData}/>
        </div>
      </Card>

      {/* Activity table */}
      <Card>
        <CardHeader title="Последние операции"/>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Тип", "Номер", "Направление / Поставщик", "Дата", "Статус"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentActivity.length === 0
                ? <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Нет операций</td></tr>
                : recentActivity.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {a.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-blue-600 font-semibold">{a.ref}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-sm">{a.info}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{a.date}</td>
                    <td className="px-5 py-3.5"><Badge status={a.status}/></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
