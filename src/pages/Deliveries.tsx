import { useState } from "react";
import type { Delivery, DeliveryStatus, AppState, Product } from "../types";
import { Badge, Modal, Field, inputCls, Select, Btn, SearchInput, PageHeader, Pagination, PAGE_SIZE, StatusActions, StatusTimeline, StatusHistoryLine } from "../components/ui";

const DEL_EVENT: Record<string, string> = {
  expected: "Запланирована",
  partial: "Частично принята",
  received: "Принята",
  cancelled: "Отменена",
};

const STATUS_FILTERS = [
  { value: "all",       label: "Все"       },
  { value: "expected",  label: "Ожидается" },
  { value: "received",  label: "Получено"  },
  { value: "partial",   label: "Частично"  },
  { value: "cancelled", label: "Отменено"  },
];

export default function Deliveries({ state, setDeliveries, setProducts }: {
  state: AppState; setDeliveries: (d: Delivery[]) => void; setProducts: (p: Product[]) => void;
}) {
  const { deliveries, products, suppliers, currency } = state;
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage]   = useState(1);
  const resetPage = () => setCurrentPage(1);
  const [detail, setDetail]             = useState<Delivery | null>(null);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm] = useState({
    supplierId: "", expectedDate: "", invoiceNumber: "", notes: "",
    items: [{ productId: "", qty: 1 }],
  });

  const filtered = deliveries.filter(d => {
    const sup = suppliers.find(s => s.id === d.supplierId)?.name ?? "";
    const q = search.toLowerCase();
    return (d.ref.toLowerCase().includes(q) || sup.toLowerCase().includes(q) || d.invoiceNumber.toLowerCase().includes(q)) &&
      (statusFilter === "all" || d.status === statusFilter);
  });
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const delValue = (d: Delivery) =>
    d.items.reduce((a, it) => { const p = products.find(x => x.id === it.productId); return a + (p ? it.qty * p.costPrice : 0); }, 0);

  const nowISO = () => new Date().toISOString();

  const actionsOf = (status: DeliveryStatus) => {
    if (status === "expected") return [
      { label: "Принята", next: "received" as const, variant: "primary" as const },
      { label: "Частично", next: "partial" as const, variant: "outline" as const },
      { label: "Отменить", next: "cancelled" as const, variant: "danger" as const },
    ];
    if (status === "partial") return [
      { label: "Принята", next: "received" as const, variant: "primary" as const },
      { label: "Отменить", next: "cancelled" as const, variant: "danger" as const },
    ];
    return [];
  };

  const setStatus = (del: Delivery, next: DeliveryStatus) => {
    const wasReceived = del.status === "received";
    const updated: Delivery = {
      ...del,
      status: next,
      ...(next === "received" || next === "partial" ? { receivedDate: nowISO().slice(0, 10) } : {}),
      history: [...(del.history ?? []), { status: next, at: nowISO() }],
    };
    setDeliveries(deliveries.map(d => d.id === del.id ? updated : d));
    if (next === "received" && !wasReceived) {
      setProducts(products.map(p => {
        const it = del.items.find(i => i.productId === p.id);
        return it ? { ...p, stock: p.stock + it.qty } : p;
      }));
    }
    setDetail(prev => prev?.id === del.id ? updated : prev);
  };

  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { productId: "", qty: 1 }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i: number, k: "productId" | "qty", v: string | number) =>
    setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));

  const save = () => {
    if (!form.supplierId || !form.expectedDate) return;
    const validItems = form.items.filter(it => it.productId && it.qty > 0);
    if (!validItems.length) return;
    const ref = `ПОС-2024-${String(deliveries.length + 1).padStart(3, "0")}`;
    setDeliveries([{
      id: `d${Date.now()}`, ref, supplierId: form.supplierId, items: validItems,
      status: "expected", expectedDate: form.expectedDate,
      invoiceNumber: form.invoiceNumber, notes: form.notes,
      history: [{ status: "expected", at: new Date().toISOString() }],
    }, ...deliveries]);
    setShowForm(false);
    setForm({ supplierId: "", expectedDate: "", invoiceNumber: "", notes: "", items: [{ productId: "", qty: 1 }] });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Поставки"
        sub={`${deliveries.length} поставок`}
        action={<Btn onClick={() => setShowForm(true)}>+ Запланировать</Btn>}
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <SearchInput value={search} onChange={v => { setSearch(v); resetPage(); }} placeholder="Номер, поставщик, счёт…"/>
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
                  {deliveries.filter(d => d.status === value).length}
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
                {["Номер", "Поставщик", "Счёт-фактура", "Ожид. дата", "Получено", "Позиций", "Сумма", "Статус", "Действия"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-gray-400">
                    {search || statusFilter !== "all" ? "Ничего не найдено" : "Нет поставок"}
                  </td>
                </tr>
              ) : paginated.map(d => {
                const sup = suppliers.find(s => s.id === d.supplierId);
                const val = delValue(d);
                return (
                  <tr key={d.id} onClick={() => setDetail(d)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-semibold text-gray-800">{d.ref}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-gray-900">{sup?.name ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{d.invoiceNumber || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{d.expectedDate}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{d.receivedDate ?? "—"}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{d.items.length}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-gray-900 text-xs">{val.toLocaleString("ru-RU")} {currency}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={d.status}/>
                      <StatusHistoryLine events={d.history ?? []} labels={DEL_EVENT}/>
                    </td>
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <StatusActions actions={actionsOf(d.status).map(a => ({
                        label: a.label, variant: a.variant, onClick: () => setStatus(d, a.next),
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
            <StatusTimeline events={detail.history ?? []} labels={DEL_EVENT}/>

            <div className="grid grid-cols-2 gap-3">
              {([
                ["Статус",         <Badge status={detail.status}/>],
                ["Поставщик",      suppliers.find(s => s.id === detail.supplierId)?.name ?? "—"],
                ["Счёт-фактура",   detail.invoiceNumber || "—"],
                ["Ожидаемая дата", detail.expectedDate],
                ["Дата получения", detail.receivedDate || "—"],
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
                        <p className="text-xs text-gray-400">{p?.sku} · на складе: {p?.stock} {p?.unit}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{it.qty} {p?.unit}</p>
                        {p && <p className="text-xs text-gray-400">{(it.qty * p.costPrice).toLocaleString("ru-RU")} {currency}</p>}
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Итого</span>
                  <span className="text-sm font-bold text-gray-900">{delValue(detail).toLocaleString("ru-RU")} {currency}</span>
                </div>
              </div>
            </div>

            {detail.notes && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">{detail.notes}</div>
            )}
          </div>
        </Modal>
      )}

      {/* New delivery form */}
      {showForm && (
        <Modal title="Запланировать поставку" onClose={() => setShowForm(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowForm(false)}>Отмена</Btn><Btn onClick={save}>Создать</Btn></>}>
          <div className="flex flex-col gap-4">
            <Field label="Поставщик">
              <Select value={form.supplierId} onChange={v => setForm(f => ({ ...f, supplierId: v }))} placeholder="Выбрать…"
                options={suppliers.filter(s => s.active).map(s => ({ value: s.id, label: s.name }))}/>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ожидаемая дата">
                <input className={inputCls} type="date" value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))}/>
              </Field>
              <Field label="Счёт-фактура №">
                <input className={inputCls} placeholder="СФ-2024-000" value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))}/>
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
                      options={products.map(p => ({ value: p.id, label: p.name }))}/>
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
