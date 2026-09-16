import { useState } from "react";
import type { Supplier, AppState } from "../types";
import { Badge, Modal, Field, inputCls, Select, Btn, SearchInput, Stars, PageHeader } from "../components/ui";
import { useInView } from "../hooks";

const EMPTY: Omit<Supplier, "id" | "createdAt"> = { name: "", contact: "", email: "", phone: "", address: "", country: "Россия", rating: 4, totalOrders: 0, active: true };

function SupplierCard({ s, i, dels, onClick }: { s: Supplier; i: number; dels: AppState["deliveries"]; onClick: () => void }) {
  const { ref, inView } = useInView(0.05);
  const received = dels.filter(d => d.status === "received").length;
  return (
    <div ref={ref} onClick={onClick}
      className="bg-white rounded-lg border border-gray-100  card-lift cursor-pointer p-5 flex flex-col gap-4"
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(16px)", transition: `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold font-display truncate">{s.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{s.country}</p>
        </div>
        <Badge status={s.active ? "active" : "inactive"} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-gray-500 font-medium">{s.contact}</p>
        <p className="text-xs text-gray-400 font-mono">{s.email}</p>
        <p className="text-xs text-gray-400">{s.phone}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Stars n={s.rating} />
        <div className="text-right">
          <p className="text-xs font-mono font-semibold text-gray-700">{dels.length} поставок</p>
          <p className="text-[10px] text-gray-400">{received} получено</p>
        </div>
      </div>
    </div>
  );
}

export default function Suppliers({ state, setSuppliers }: { state: AppState; setSuppliers: (s: Supplier[]) => void }) {
  const { suppliers, deliveries } = state;
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Supplier | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q) || s.country.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (s: Supplier) => {
    setForm({ name: s.name, contact: s.contact, email: s.email, phone: s.phone, address: s.address, country: s.country, rating: s.rating, totalOrders: s.totalOrders, active: s.active });
    setEditId(s.id); setShowForm(true); setDetail(null);
  };
  const save = () => {
    if (!form.name) return;
    setSuppliers(editId
      ? suppliers.map(s => s.id === editId ? { ...form, id: editId, createdAt: suppliers.find(x => x.id === editId)!.createdAt } : s)
      : [...suppliers, { ...form, id: `sup${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) }]);
    setShowForm(false);
  };
  const toggle = (id: string) => setSuppliers(suppliers.map(s => s.id === id ? { ...s, active: !s.active } : s));
  const upd = (k: keyof typeof form, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));
  const supDels = (id: string) => deliveries.filter(d => d.supplierId === id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Поставщики" sub={`${suppliers.filter(s => s.active).length} активных`} action={<Btn onClick={openAdd}>+ Добавить</Btn>} />
      <SearchInput value={search} onChange={setSearch} placeholder="Название, контакт, страна…" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => (
          <SupplierCard key={s.id} s={s} i={i} dels={supDels(s.id)} onClick={() => setDetail(s)} />
        ))}
        {filtered.length === 0 && <p className="col-span-full py-16 text-center text-gray-400">Поставщики не найдены</p>}
      </div>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}
          footer={<><Btn variant="ghost" onClick={() => setDetail(null)}>Закрыть</Btn><Btn variant="outline" onClick={() => toggle(detail.id)}>{detail.active ? "Деактивировать" : "Активировать"}</Btn><Btn onClick={() => openEdit(detail)}>Редактировать</Btn></>}>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              {[["Статус", <Badge status={detail.active ? "active" : "inactive"} />], ["Страна", detail.country], ["Контакт", detail.contact], ["Email", detail.email], ["Телефон", detail.phone], ["Рейтинг", <Stars n={detail.rating} />], ["Добавлен", detail.createdAt], ["Поставок", supDels(detail.id).length]].map(([k, v]) => (
                <div key={String(k)} className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-[9px] font-mono font-semibold uppercase tracking-wider text-gray-400">{k}</p><div className="font-semibold font-display text-sm mt-0.5">{v}</div></div>
              ))}
              <div className="col-span-2 bg-gray-50 rounded-lg px-4 py-3"><p className="text-[9px] font-mono font-semibold uppercase tracking-wider text-gray-400">Адрес</p><p className="font-semibold font-display text-sm mt-0.5">{detail.address || "—"}</p></div>
            </div>
            {supDels(detail.id).length > 0 && (
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400 mb-3">История поставок</p>
                <div className="flex flex-col gap-1.5">
                  {supDels(detail.id).map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <span className="font-mono text-xs font-bold text-blue-600">{d.ref}</span>
                      <span className="text-xs text-gray-400">{d.expectedDate}</span>
                      <Badge status={d.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal title={editId ? "Редактировать поставщика" : "Новый поставщик"} onClose={() => setShowForm(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowForm(false)}>Отмена</Btn><Btn onClick={save}>Сохранить</Btn></>}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Название"><input className={inputCls} value={form.name} onChange={e => upd("name", e.target.value)} /></Field></div>
            <Field label="Контакт"><input className={inputCls} value={form.contact} onChange={e => upd("contact", e.target.value)} /></Field>
            <Field label="Страна"><input className={inputCls} value={form.country} onChange={e => upd("country", e.target.value)} /></Field>
            <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={e => upd("email", e.target.value)} /></Field>
            <Field label="Телефон"><input className={inputCls} value={form.phone} onChange={e => upd("phone", e.target.value)} /></Field>
            <div className="col-span-2"><Field label="Адрес"><input className={inputCls} value={form.address} onChange={e => upd("address", e.target.value)} /></Field></div>
            <Field label="Рейтинг (1–5)">
              <Select value={String(form.rating)} onChange={v => upd("rating", +v)} options={[1,2,3,4,5].map(n => ({ value: String(n), label: `${n} ★` }))}/>
            </Field>
            <Field label="Активен">
              <div className="flex items-center gap-3 mt-1.5">
                <button type="button" onClick={() => upd("active", !form.active)}
                  className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${form.active ? "bg-gray-900" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.active ? "left-6" : "left-0.5"}`} />
                </button>
                <span className="text-sm text-gray-500">{form.active ? "Да" : "Нет"}</span>
              </div>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
