import type { AppState } from "../types";
import { BarChart, Card, CardHeader, PageHeader } from "../components/ui";
import { useCounter, useInView } from "../hooks";

function StockHealthRing({ label, value, total, color, bg, text }: { label: string; value: number; total: number; color: string; bg: string; text: string }) {
  const { ref, inView } = useInView();
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const r = 44; const circ = 2 * Math.PI * r;
  return (
    <div ref={ref} className={`${bg} rounded-lg p-6 flex flex-col items-center gap-3 card-lift`}>
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={inView ? circ - (pct / 100) * circ : circ}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black font-display ${text}`}>{value}</span>
          <span className="text-[10px] font-mono text-gray-400">{pct}%</span>
        </div>
      </div>
      <p className={`text-sm font-semibold font-display ${text}`}>{label}</p>
    </div>
  );
}

function BigMetric({ label, value, prefix = "", suffix = "", color = "text-gray-900" }: {
  label: string; value: number; prefix?: string; suffix?: string; color?: string;
}) {
  const { ref, inView } = useInView();
  const count = useCounter(value, 1200, inView);
  return (
    <div ref={ref} className="bg-white rounded-lg border border-gray-100  p-6 card-lift">
      <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-4xl font-black font-display mt-2 tabular-nums ${color}`}>{prefix}{count.toLocaleString("ru-RU")}{suffix}</p>
    </div>
  );
}

export default function Analytics({ state }: { state: AppState }) {
  const { products, shipments, deliveries, suppliers, currency } = state;

  const costValue = products.reduce((a, p) => a + p.stock * p.costPrice, 0);
  const sellValue = products.reduce((a, p) => a + p.stock * p.sellPrice, 0);
  const margin = sellValue - costValue;
  const marginPct = sellValue > 0 ? Math.round((margin / sellValue) * 100) : 0;
  const revenue = shipments.filter(s => s.status === "delivered").reduce((a, s) =>
    a + s.items.reduce((b, it) => { const p = products.find(x => x.id === it.productId); return b + (p ? it.qty * p.sellPrice : 0); }, 0), 0);

  const catMap: Record<string, { cost: number; sell: number }> = {};
  products.forEach(p => { if (!catMap[p.category]) catMap[p.category] = { cost: 0, sell: 0 }; catMap[p.category].cost += p.stock * p.costPrice; catMap[p.category].sell += p.stock * p.sellPrice; });
  const catData = Object.entries(catMap).sort((a, b) => b[1].sell - a[1].sell);

  const supPerf = suppliers.map(s => {
    const dels = deliveries.filter(d => d.supplierId === s.id);
    const received = dels.filter(d => d.status === "received").length;
    return { sup: s, total: dels.length, received, rate: dels.length > 0 ? Math.round((received / dels.length) * 100) : 0 };
  }).filter(x => x.total > 0).sort((a, b) => b.rate - a.rate);

  const topProducts = [...products].sort((a, b) => b.stock * b.costPrice - a.stock * a.costPrice).slice(0, 8);

  const shipStatusData = [
    { label: "Черновик", value: shipments.filter(s => s.status === "draft").length, color: "#F59E0B" },
    { label: "В пути", value: shipments.filter(s => s.status === "dispatched").length, color: "#3B82F6" },
    { label: "Доставлено", value: shipments.filter(s => s.status === "delivered").length, color: "#10B981" },
  ];

  const healthy = products.filter(p => p.stock > p.minStock).length;
  const low = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const out = products.filter(p => p.stock === 0).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Аналитика" sub="Финансовые показатели и эффективность" />

      {/* Financial hero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-6 text-white relative overflow-hidden col-span-1 sm:col-span-2">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white/50">Потенциальная выручка</p>
          <p className="text-3xl font-bold mt-2 tabular-nums">{sellValue.toLocaleString("ru-RU")} {currency}</p>
          <p className="text-xs text-white/50 mt-1.5">Маржа {marginPct}% · Себест. {costValue.toLocaleString("ru-RU")} {currency}</p>
        </div>
        <BigMetric label="Выручка отгрузок" value={revenue} suffix={` ${currency}`} color="text-blue-700" />
        <BigMetric label="Потенц. маржа" value={margin} suffix={` ${currency}`} color="text-emerald-600" />
      </div>

      {/* Stock health */}
      <Card>
        <CardHeader title="Состояние запасов" />
        <div className="p-6 grid grid-cols-3 gap-6">
          {[
            { label: "В норме", value: healthy, total: products.length, color: "#10B981", bg: "bg-emerald-50", text: "text-emerald-700" },
            { label: "Ниже минимума", value: low, total: products.length, color: "#F59E0B", bg: "bg-amber-50", text: "text-amber-700" },
            { label: "Нет на складе", value: out, total: products.length, color: "#EF4444", bg: "bg-rose-50", text: "text-rose-600" },
          ].map(item => (
            <StockHealthRing key={item.label} {...item} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <Card>
          <CardHeader title="По категориям" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["Категория", "Продажная цена", "Себест.", "Маржа"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {catData.map(([cat, v]) => (
                  <tr key={cat} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3 font-semibold font-display text-sm">{cat}</td>
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{v.sell.toLocaleString("ru-RU")}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{v.cost.toLocaleString("ru-RU")}</td>
                    <td className="px-5 py-3 font-mono text-xs font-bold text-emerald-600">{v.sell > 0 ? Math.round(((v.sell - v.cost) / v.sell) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Supplier reliability */}
        <Card>
          <CardHeader title="Надёжность поставщиков" />
          <div className="p-6">
            {supPerf.length === 0
              ? <p className="text-gray-400 text-sm">Нет данных о поставках</p>
              : <div className="flex flex-col gap-4">
                  {supPerf.map(({ sup, total, received, rate }) => (
                    <div key={sup.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold font-display truncate mr-4">{sup.name}</span>
                        <span className="font-mono text-gray-400 shrink-0">{received}/{total} · <span className={rate >= 80 ? "text-emerald-600" : rate >= 50 ? "text-amber-500" : "text-rose-500"}>{rate}%</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${rate}%`, backgroundColor: rate >= 80 ? "#10B981" : rate >= 50 ? "#F59E0B" : "#EF4444" }} />
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </Card>

        {/* Shipment statuses */}
        <Card>
          <CardHeader title="Статусы отгрузок" />
          <div className="p-6"><BarChart data={shipStatusData} /></div>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader title="Топ товаров по стоимости" />
          <div className="p-6">
            <BarChart data={topProducts.map(p => ({ label: p.name, value: Math.round(p.stock * p.costPrice) }))} />
          </div>
        </Card>
      </div>
    </div>
  );
}
