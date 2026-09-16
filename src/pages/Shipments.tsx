import { useState } from "react";
import type { Shipment, ShipmentStatus, AppState } from "../types";
import { Badge, Modal, Field, inputCls, Select, Btn, SearchInput, PageHeader, Pagination, PAGE_SIZE, StatusActions, StatusTimeline, StatusHistoryLine } from "../components/ui";

const CARRIERS = ["СДЭК", "Деловые Линии", "Почта России", "DHL", "FedEx", "ПЭК", "Энергия"];

const SHIP_EVENT: Record<string, string> = {
  draft: "Создана",
  dispatched: "Отправлена",
  delivered: "Доставлена",
  cancelled: "Отменена",
};

const STATUS_FILTERS = [
  { value: "all",        label: "Все"        },
  { value: "draft",      label: "Черновик"   },
  { value: "dispatched", label: "В пути"     },
  { value: "delivered",  label: "Доставлено" },
  { value: "cancelled",  label: "Отменено"   },
];

export default function Shipments({ state, setShipments }: {
  state: AppState; setShipments: (s: Shipment[]) => void;
}) {
  const { shipments, products, users, currency } = state;
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const resetPage = () => setCurrentPage(1);
  const [detail, setDetail]           = useState<Shipment | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm] = useState({
    destination: "", carrier: "", trackingNumber: "", date: "", notes: "",
    items: [{ productId: "", qty: 1 }],
  });

  const filtered = shipments.filter(s => {
    const q = search.toLowerCase();
    return (s.ref.toLowerCase().includes(q) || s.destination.toLowerCase().includes(q) || s.carrier.toLowerCase().includes(q)) &&
      (statusFilter === "all" || s.status === statusFilter);
  });
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const shipValue = (s: Shipment) =>
    s.items.reduce((a, it) => { const p = products.find(x => x.id === it.productId); return a + (p ? it.qty * p.sellPrice : 0); }, 0);

  const nowISO = () => new Date().toISOString();

  const actionsOf = (status: ShipmentStatus) => {
    if (status === "draft") return [
      { label: "В пути", next: "dispatched" as const, variant: "primary" as const },
      { label: "Отменить", next: "cancelled" as const, variant: "danger" as const },
    ];
    if (status === "dispatched") return [
      { label: "Доставлено", next: "delivered" as const, variant: "primary" as const },
      { label: "Отменить", next: "cancelled" as const, variant: "danger" as const },
    ];
    return [];
  };

  const setStatus = (s: Shipment, next: ShipmentStatus) => {
    const updated: Shipment = {
      ...s,
      status: next,
      ...(next === "delivered" ? { deliveredDate: nowISO().slice(0, 10) } : {}),
      history: [...(s.history ?? []), { status: next, at: nowISO() }],
    };
    setShipments(shipments.map(x => x.id === s.id ? updated : x));
    setDetail(prev => prev?.id === s.id ? updated : prev);
  };

  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { productId: "", qty: 1 }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i: number, k: "productId" | "qty", v: string | number) =>
    setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));

  const save = () => {
    if (!form.destination || !form.carrier || !form.date) return;
    const validItems = form.items.filter(it => it.productId && it.qty > 0);
    if (!validItems.length) return;
    const ref = `ОТГ-2024-${String(shipments.length + 1).padStart(3, "0")}`;
    setShipments([{
      id: `s${Date.now()}`, ref, destination: form.destination, carrier: form.carrier,
      trackingNumber: form.trackingNumber, items: validItems, status: "draft",
      date: form.date, notes: form.notes, managerId: state.currentUser!.id,
      history: [{ status: "draft", at: new Date().toISOString() }],
    }, ...shipments]);
    setShowForm(false);
    setForm({ destination: "", carrier: "", trackingNumber: "", date: "", notes: "", items: [{ productId: "", qty: 1 }] });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Отгрузки"
        sub={`${shipments.length} отгрузок`}
        action={<Btn onClick={() => setShowForm(true)}>+ Новая отгрузка</Btn>}
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <SearchInput value={search} onChange={v => { setSearch(v); resetPage(); }} placeholder="Номер, направление, перевозчик…"/>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button key={value} onClick={() => { setStatusFilter(value); resetPage(); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors
                ${statusFilter === value
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {label}
              {value !== "all" && (
                <span className={`ml-1.5 text-[10px] ${statusFilter === value ? "text-white/60" : "text-gray-400"}`}>
                  {shipments.filter(s => s.status === value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Номер", "Направление", "Перевозчик", "Дата", "Позиций", "Сумма", "Статус", "Действия"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    {search || statusFilter !== "all" ? "Ничего не найдено" : "Нет отгрузок"}
                  </td>
                </tr>
              ) : paginated.map(s => {
                const val = shipValue(s);
                return (
                  <tr key={s.id} onClick={() => setDetail(s)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-semibold text-gray-800">{s.ref}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-gray-900">{s.destination}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{s.carrier}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{s.date}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{s.items.length}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-gray-900 text-xs">{val.toLocaleString("ru-RU")} {currency}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={s.status}/>
                      <StatusHistoryLine events={s.history ?? []} labels={SHIP_EVENT}/>
                    </td>
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <StatusActions actions={actionsOf(s.status).map(a => ({
                        label: a.label, variant: a.variant, onClick: () => setStatus(s, a.next),
                      }))}/>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} total={filtered.length} onChange={setCurrentPage}/>
      </div>

      {/* Detail modal */}
      {detail && (
        <Modal title={detail.ref} onClose={() => setDetail(null)}
          footer={<>
            <Btn variant="ghost" onClick={() => setDetail(null)}>Закрыть</Btn>
            <StatusActions actions={actionsOf(detail.status).map(a => ({
              label: a.label, variant: a.variant, onClick: () => setStatus(detail, a.next),
            }))}/>
          </>}>
          <div className="flex flex-col gap-4">
            <StatusTimeline events={detail.history ?? []} labels={SHIP_EVENT}/>

            <div className="grid grid-cols-2 gap-3">
              {([
                ["Статус",        <Badge status={detail.status}/>],
                ["Перевозчик",    detail.carrier],
                ["Направление",   detail.destination],
                ["Трек-номер",    detail.trackingNumber || "—"],
                ["Дата отправки", detail.date],
                ["Дата доставки", detail.deliveredDate || "—"],
                ["Ответственный", users.find(u => u.id === detail.managerId)?.name ?? "—"],
              ] as [string, React.ReactNode][]).map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-[10px] text-gray-400 font-medium mb-0.5">{k}</p>
                  <div className="text-sm font-medium text-gray-900">{v}</div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Позиции</p>
              <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
                {detail.items.map((it, i) => {
                  const p = products.find(x => x.id === it.productId);
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      {p?.photo && <img src={p.photo} alt={p.name} className="w-9 h-9 rounded object-cover shrink-0 bg-gray-100"/>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p?.name ?? it.productId}</p>
                        <p className="text-xs text-gray-400">{p?.sku}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{it.qty} {p?.unit}</p>
                        {p && <p className="text-xs text-gray-400">{(it.qty * p.sellPrice).toLocaleString("ru-RU")} {currency}</p>}
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Итого</span>
                  <span className="text-sm font-bold text-gray-900">{shipValue(detail).toLocaleString("ru-RU")} {currency}</span>
                </div>
              </div>
            </div>

            {detail.notes && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">{detail.notes}</div>
            )}
          </div>
        </Modal>
      )}

      {/* New shipment form */}
      {showForm && (
        <Modal title="Новая отгрузка" onClose={() => setShowForm(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowForm(false)}>Отмена</Btn><Btn onClick={save}>Создать</Btn></>}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Направление">
                  <input className={inputCls} placeholder="Москва, Центральный" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}/>
                </Field>
              </div>
              <Field label="Перевозчик">
                <Select value={form.carrier} onChange={v => setForm(f => ({ ...f, carrier: v }))} placeholder="Выбрать…"
                  options={CARRIERS.map(c => ({ value: c, label: c }))}/>
              </Field>
              <Field label="Трек-номер">
                <input className={inputCls} placeholder="—" value={form.trackingNumber} onChange={e => setForm(f => ({ ...f, trackingNumber: e.target.value }))}/>
              </Field>
              <Field label="Дата отправки">
                <input className={inputCls} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}/>
              </Field>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">Позиции</span>
                <button onClick={addItem} className="text-xs text-gray-600 hover:text-gray-900 font-medium border border-gray-200 rounded px-2.5 py-1 hover:bg-gray-50 transition-colors">+ Добавить</button>
              </div>
              <div className="flex flex-col gap-2">
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Select className="flex-1 min-w-0" value={item.productId} onChange={v => updateItem(i, "productId", v)} placeholder="Выбрать товар…"
                      options={products.map(p => ({ value: p.id, label: `${p.name} (ост.: ${p.stock})` }))}/>
                    <input type="number" min={1} value={item.qty} onChange={e => updateItem(i, "qty", +e.target.value || 1)} className={`w-20 text-center ${inputCls}`}/>
                    {form.items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-gray-700 text-xl leading-none font-light">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Field label="Примечания">
              <textarea className={inputCls} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Необязательно"/>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
