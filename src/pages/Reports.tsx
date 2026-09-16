import { useState } from "react";
import type { AppState } from "../types";
import { Btn, PageHeader, Card } from "../components/ui";

type ReportType = "inventory" | "shipments" | "deliveries" | "low_stock";
const TYPES = [
  { id: "inventory" as ReportType, label: "Инвентаризация", desc: "Полный список товаров", icon: "📦", color: "from-blue-500 to-blue-700" },
  { id: "shipments" as ReportType, label: "Отгрузки", desc: "Все отгрузки за период", icon: "🚚", color: "from-blue-500 to-blue-700" },
  { id: "deliveries" as ReportType, label: "Поставки", desc: "Статусы выполнения", icon: "📥", color: "from-emerald-500 to-emerald-700" },
  { id: "low_stock" as ReportType, label: "Дефицит", desc: "Позиции ниже минимума", icon: "⚠️", color: "from-rose-500 to-rose-700" },
];

export default function Reports({ state }: { state: AppState }) {
  const { products, shipments, deliveries, suppliers, currency } = state;
  const [active, setActive] = useState<ReportType>("inventory");
  const [generated, setGenerated] = useState(false);

  const exportCSV = () => {
    const now = new Date().toISOString().slice(0, 10);
    let csv = "", filename = "";
    if (active === "inventory") {
      filename = `inventarizatsiya_${now}.csv`;
      csv = "SKU;Наименование;Категория;Единица;Остаток;Мин.запас;Себест.(₽);Цена прод.(₽);Сумма;Место\n";
      products.forEach(p => { csv += `${p.sku};${p.name};${p.category};${p.unit};${p.stock};${p.minStock};${p.costPrice};${p.sellPrice};${p.stock*p.costPrice};${p.location}\n`; });
    } else if (active === "shipments") {
      filename = `otgruzki_${now}.csv`;
      csv = "Номер;Направление;Перевозчик;Дата;Статус\n";
      shipments.forEach(s => { csv += `${s.ref};${s.destination};${s.carrier};${s.date};${s.status}\n`; });
    } else if (active === "deliveries") {
      filename = `postavki_${now}.csv`;
      csv = "Номер;Поставщик;Счёт;Ожид.дата;Дата получения;Статус\n";
      deliveries.forEach(d => { const sup = suppliers.find(s => s.id === d.supplierId)?.name ?? ""; csv += `${d.ref};${sup};${d.invoiceNumber};${d.expectedDate};${d.receivedDate??""};${d.status}\n`; });
    } else {
      filename = `defitsit_${now}.csv`;
      csv = "SKU;Наименование;Остаток;Минимум;Нехватка\n";
      products.filter(p => p.stock <= p.minStock).forEach(p => { csv += `${p.sku};${p.name};${p.stock};${p.minStock};${p.minStock-p.stock}\n`; });
    }
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
  };

  const renderReport = () => {
    if (active === "inventory") {
      const total = products.reduce((a,p) => a+p.stock*p.costPrice, 0);
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="bg-blue-50 rounded-lg px-5 py-3"><p className="text-[9px] font-mono uppercase text-blue-500 font-semibold tracking-wider">Позиций</p><p className="text-2xl font-black font-display text-blue-700">{products.length}</p></div>
            <div className="bg-blue-50 rounded-lg px-5 py-3"><p className="text-[9px] font-mono uppercase text-blue-500 font-semibold tracking-wider">Стоимость</p><p className="text-2xl font-black font-display text-blue-700">{total.toLocaleString("ru-RU")} {currency}</p></div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50">{["SKU","Наименование","Кат.","Остаток","Себест.","Цена прод.","Сумма","Место"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className={`hover:bg-gray-50/80 transition-colors ${p.stock<=p.minStock?"bg-rose-50/30":""}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{p.sku}</td>
                    <td className="px-4 py-3 font-semibold font-display text-sm">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{p.category}</td>
                    <td className={`px-4 py-3 font-mono font-bold text-sm ${p.stock<=p.minStock?"text-rose-500":"text-emerald-500"}`}>{p.stock}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.costPrice.toLocaleString("ru-RU")}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.sellPrice.toLocaleString("ru-RU")}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold">{(p.stock*p.costPrice).toLocaleString("ru-RU")}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.location}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t-2 border-gray-200 font-bold"><td colSpan={6} className="px-4 py-3 text-right text-xs font-mono text-gray-400">ИТОГО:</td><td className="px-4 py-3 font-mono font-black text-blue-700">{total.toLocaleString("ru-RU")} {currency}</td><td /></tr></tfoot>
            </table>
          </div>
        </div>
      );
    }

    if (active === "shipments") return (
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">{["Номер","Направление","Перевозчик","Дата","Статус","Позиций"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-50">
            {shipments.map(s => <tr key={s.id} className="hover:bg-gray-50/80 transition-colors"><td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{s.ref}</td><td className="px-4 py-3 font-semibold font-display text-sm">{s.destination}</td><td className="px-4 py-3 text-xs text-gray-400">{s.carrier}</td><td className="px-4 py-3 font-mono text-xs text-gray-400">{s.date}</td><td className="px-4 py-3 font-mono text-xs">{s.status}</td><td className="px-4 py-3 font-mono text-xs">{s.items.length}</td></tr>)}
          </tbody>
        </table>
      </div>
    );

    if (active === "deliveries") return (
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">{["Номер","Поставщик","Счёт","Ожид.","Получено","Статус"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-50">
            {deliveries.map(d => <tr key={d.id} className="hover:bg-gray-50/80 transition-colors"><td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{d.ref}</td><td className="px-4 py-3 font-semibold font-display text-sm">{suppliers.find(s=>s.id===d.supplierId)?.name??"—"}</td><td className="px-4 py-3 font-mono text-xs text-gray-400">{d.invoiceNumber||"—"}</td><td className="px-4 py-3 font-mono text-xs text-gray-400">{d.expectedDate}</td><td className="px-4 py-3 font-mono text-xs text-gray-400">{d.receivedDate??"—"}</td><td className="px-4 py-3 font-mono text-xs">{d.status}</td></tr>)}
          </tbody>
        </table>
      </div>
    );

    const lowItems = products.filter(p => p.stock <= p.minStock);
    return (
      <div className="flex flex-col gap-4">
        {lowItems.length > 0 && <div className="bg-rose-50 border border-rose-100 rounded-lg px-4 py-3 text-sm text-rose-600 font-medium">{lowItems.length} позиций ниже минимального запаса</div>}
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50">{["SKU","Наименование","Остаток","Минимум","Нехватка","Поставщик"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {lowItems.map(p => <tr key={p.id} className="hover:bg-gray-50/80 transition-colors"><td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{p.sku}</td><td className="px-4 py-3 font-semibold font-display">{p.name}</td><td className="px-4 py-3 font-mono font-bold text-rose-500">{p.stock}</td><td className="px-4 py-3 font-mono text-xs text-gray-400">{p.minStock}</td><td className="px-4 py-3 font-mono font-bold text-rose-500">−{p.minStock-p.stock}</td><td className="px-4 py-3 text-xs text-gray-400">{suppliers.find(s=>s.id===p.supplierId)?.name??"—"}</td></tr>)}
              {lowItems.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-gray-400">Все запасы в норме ✓</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Отчёты" sub="Генерация и экспорт складских данных" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {TYPES.map(r => (
          <button key={r.id} onClick={() => { setActive(r.id); setGenerated(false); }}
            className={`rounded-lg p-5 text-left transition-all card-lift ${active === r.id ? "bg-gray-900 text-white" : "bg-white border border-gray-200 hover:border-gray-300"}`}>
            <div className="text-3xl mb-3">{r.icon}</div>
            <p className={`font-bold font-display text-sm ${active === r.id ? "text-white" : ""}`}>{r.label}</p>
            <p className={`text-xs mt-1 ${active === r.id ? "text-white/70" : "text-gray-400"}`}>{r.desc}</p>
          </button>
        ))}
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <span className="font-bold font-display">{TYPES.find(t => t.id === active)?.label}</span>
          <div className="flex gap-2">
            {!generated
              ? <Btn onClick={() => setGenerated(true)}>Сформировать</Btn>
              : <Btn variant="outline" onClick={exportCSV}>↓ Скачать CSV</Btn>}
          </div>
        </div>
        <div className="p-6">
          {!generated
            ? <div className="py-20 flex flex-col items-center gap-4 text-gray-400">
                <div className="text-6xl animate-float">📋</div>
                <p className="text-sm font-medium">Нажмите «Сформировать» для просмотра</p>
              </div>
            : renderReport()
          }
        </div>
      </Card>
    </div>
  );
}
