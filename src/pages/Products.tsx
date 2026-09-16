import { useState } from "react";
import type { Product, AppState } from "../types";
import { Modal, ConfirmDialog, Field, inputCls, Select, Btn, SearchInput, PageHeader, Pagination, PAGE_SIZE } from "../components/ui";

const UNITS = ["шт.", "рул.", "уп.", "кг", "л", "пара", "м", "м²"];
const EMPTY: Omit<Product, "id"> = { sku: "", name: "", category: "", unit: "шт.", stock: 0, minStock: 0, maxStock: 0, costPrice: 0, sellPrice: 0, supplierId: "", location: "", photo: "", description: "", barcode: "" };

export default function Products({ state, setProducts, setCategories }: {
  state: AppState; setProducts: (p: Product[]) => void; setCategories: (c: string[]) => void;
}) {
  const { products, suppliers, currency, categories } = state;
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState("");

  const allCats = [...new Set([...categories, ...products.map(p => p.category).filter(Boolean)])];
  const cats = ["all", ...allCats];
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.barcode.includes(q)) &&
      (catFilter === "all" || p.category === catFilter);
  });
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resetPage = () => setCurrentPage(1);

  const addCategory = (name: string) => {
    const n = name.trim();
    if (!n) return;
    const existing = allCats.find(c => c.toLowerCase() === n.toLowerCase());
    if (existing) return existing;
    setCategories([...allCats, n]);
    return n;
  };

  const removeCategory = (name: string) => {
    setCategories(allCats.filter(c => c !== name));
    const affected = products.filter(p => p.category === name);
    if (affected.length) {
      setProducts(products.map(p => p.category === name ? { ...p, category: "" } : p));
    }
    if (form.category === name) upd("category", "");
    if (catFilter === name) setCatFilter("all");
    setConfirmDeleteCat(null);
  };

  const catUsage = (name: string) => products.filter(p => p.category === name).length;

  const ruPlural = (n: number, one: string, few: string, many: string) => {
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  };

  const submitNewCat = () => {
    const added = addCategory(newCat);
    if (added) { setCatFilter(added); resetPage(); }
    setNewCat("");
    setAddingCat(false);
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({ sku: p.sku, name: p.name, category: p.category, unit: p.unit, stock: p.stock, minStock: p.minStock, maxStock: p.maxStock, costPrice: p.costPrice, sellPrice: p.sellPrice, supplierId: p.supplierId, location: p.location, photo: p.photo, description: p.description, barcode: p.barcode });
    setEditId(p.id); setShowForm(true); setDetail(null);
  };
  const save = () => {
    if (!form.name || !form.sku) return;
    if (form.category) addCategory(form.category);
    setProducts(editId ? products.map(p => p.id === editId ? { ...form, id: editId } : p) : [...products, { ...form, id: `p${Date.now()}` }]);
    setShowForm(false);
  };
  const remove = (id: string) => { setProducts(products.filter(p => p.id !== id)); setDetail(null); setConfirmDelete(null); };
  const upd = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const ss = (p: Product) => p.stock <= p.minStock ? "danger" : p.stock >= p.maxStock * 0.9 ? "warning" : "ok";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Товары"
        sub={`${products.length} позиций на складе`}
        action={<Btn onClick={openAdd}>+ Добавить товар</Btn>}
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <SearchInput value={search} onChange={v => { setSearch(v); resetPage(); }} placeholder="Название, SKU, штрихкод…" />
        <div className="flex gap-1.5 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => { setCatFilter(c); resetPage(); }}
              className={`group px-3 py-2 text-xs font-semibold rounded-lg border transition-all inline-flex items-center gap-1.5
                ${catFilter === c ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-500 hover:border-zinc-300 hover:text-gray-700"}`}>
              {c === "all" ? "Все" : c}
              {c !== "all" && (
                <span
                  role="button"
                  title="Удалить категорию"
                  onClick={e => { e.stopPropagation(); setConfirmDeleteCat(c); }}
                  className={`w-4 h-4 rounded flex items-center justify-center text-[13px] leading-none font-normal transition-colors
                    ${catFilter === c ? "text-white/50 hover:text-white hover:bg-white/15" : "text-gray-300 hover:text-rose-600 hover:bg-rose-50"}`}
                >×</span>
              )}
            </button>
          ))}
          {addingCat ? (
            <form className="flex items-center gap-1.5" onSubmit={e => { e.preventDefault(); submitNewCat(); }}>
              <input
                autoFocus
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Название"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { setAddingCat(false); setNewCat(""); } }}
              />
              <button type="submit" className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white">Добавить</button>
              <button type="button" onClick={() => { setAddingCat(false); setNewCat(""); }}
                className="px-2 py-2 text-xs text-gray-400 hover:text-gray-700">Отмена</button>
            </form>
          ) : (
            <button onClick={() => setAddingCat(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-all">
              + Категория
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["Фото", "SKU", "Наименование", "Категория", "Остаток", "Мин.", "Цена", "Место", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((p, i) => {
                const s = ss(p);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer group" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => setDetail(p)}>
                    <td className="px-5 py-3.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {p.photo ? <img src={p.photo} alt={p.name} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-xl">📦</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-600">{p.sku}</td>
                    <td className="px-5 py-3.5 font-semibold text-sm text-gray-900">{p.name}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{p.category}</td>
                    <td className={`px-5 py-3.5 font-mono font-bold text-sm ${s === "danger" ? "text-rose-500" : s === "warning" ? "text-amber-500" : "text-emerald-500"}`}>{p.stock} {p.unit}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{p.minStock}</td>
                    <td className="px-5 py-3.5 font-semibold text-sm text-gray-900">{p.sellPrice.toLocaleString("ru-RU")} {currency}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{p.location}</td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors">Ред.</button>
                        <button onClick={() => setConfirmDelete(p)} className="text-xs text-rose-400 hover:text-rose-600 font-medium transition-colors">Удал.</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={9} className="py-16 text-center text-gray-400">Товары не найдены</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} total={filtered.length} onChange={setCurrentPage} />
      </div>

      {/* Detail modal */}
      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}
          footer={<>
            <Btn variant="ghost" onClick={() => setDetail(null)}>Закрыть</Btn>
            <Btn variant="outline" onClick={() => openEdit(detail)}>Редактировать</Btn>
            <Btn variant="danger" onClick={() => setConfirmDelete(detail)}>Удалить</Btn>
          </>}>
          <div className="flex flex-col gap-5">
            {detail.photo && (
              <div className="h-52 rounded-lg overflow-hidden bg-gray-100">
                <img src={detail.photo} alt={detail.name} className="w-full h-full object-cover" />
              </div>
            )}
            {detail.description && <p className="text-sm text-gray-500 leading-relaxed">{detail.description}</p>}
            <div className="grid grid-cols-2 gap-3">
              {[
                ["SKU", detail.sku], ["Штрихкод", detail.barcode || "—"], ["Категория", detail.category], ["Единица", detail.unit],
                ["Остаток", `${detail.stock} ${detail.unit}`], ["Мин. запас", `${detail.minStock} ${detail.unit}`],
                ["Себестоимость", `${detail.costPrice.toLocaleString("ru-RU")} ${currency}`], ["Цена продажи", `${detail.sellPrice.toLocaleString("ru-RU")} ${currency}`],
                ["Место хранения", detail.location || "—"], ["Поставщик", suppliers.find(s => s.id === detail.supplierId)?.name ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-[9px] font-mono font-semibold uppercase tracking-wider text-gray-400">{k}</p>
                  <p className="font-semibold text-sm mt-0.5 text-gray-900">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400 mb-2">Уровень запасов</p>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${detail.maxStock > 0 ? Math.min((detail.stock / detail.maxStock) * 100, 100) : 0}%`,
                  backgroundColor: detail.stock <= detail.minStock ? "#EF4444" : "#10B981",
                  transition: "width 1s ease",
                }} />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-300 mt-1.5">
                <span>0</span><span className="text-gray-400">мин: {detail.minStock}</span><span>макс: {detail.maxStock}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form modal */}
      {showForm && (
        <Modal title={editId ? "Редактировать товар" : "Новый товар"} onClose={() => setShowForm(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowForm(false)}>Отмена</Btn><Btn onClick={save}>Сохранить</Btn></>}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU"><input className={inputCls} value={form.sku} onChange={e => upd("sku", e.target.value)} placeholder="WH-001" /></Field>
            <Field label="Штрихкод"><input className={inputCls} value={form.barcode} onChange={e => upd("barcode", e.target.value)} /></Field>
            <div className="col-span-2"><Field label="Наименование"><input className={inputCls} value={form.name} onChange={e => upd("name", e.target.value)} /></Field></div>
            <div className="col-span-2"><Field label="Описание"><textarea className={inputCls} rows={2} value={form.description} onChange={e => upd("description", e.target.value)} /></Field></div>
            <Field label="Категория">
              <Select
                value={form.category}
                onChange={v => upd("category", v)}
                placeholder="Выбрать…"
                options={allCats.map(c => ({ value: c, label: c }))}
                onCreate={name => addCategory(name)}
                createLabel="Новая категория"
              />
            </Field>
            <Field label="Единица"><Select value={form.unit} onChange={v => upd("unit", v)} options={UNITS.map(u => ({ value: u, label: u }))}/></Field>
            <Field label="Остаток"><input className={inputCls} type="number" min={0} value={form.stock} onChange={e => upd("stock", +e.target.value)} /></Field>
            <Field label="Мин. запас"><input className={inputCls} type="number" min={0} value={form.minStock} onChange={e => upd("minStock", +e.target.value)} /></Field>
            <Field label="Макс. запас"><input className={inputCls} type="number" min={0} value={form.maxStock} onChange={e => upd("maxStock", +e.target.value)} /></Field>
            <Field label="Место хранения"><input className={inputCls} value={form.location} onChange={e => upd("location", e.target.value)} placeholder="А1-01" /></Field>
            <Field label="Себестоимость (₽)"><input className={inputCls} type="number" min={0} value={form.costPrice} onChange={e => upd("costPrice", +e.target.value)} /></Field>
            <Field label="Цена продажи (₽)"><input className={inputCls} type="number" min={0} value={form.sellPrice} onChange={e => upd("sellPrice", +e.target.value)} /></Field>
            <Field label="Поставщик"><Select value={form.supplierId} onChange={v => upd("supplierId", v)} placeholder="Выбрать…" options={suppliers.map(s => ({ value: s.id, label: s.name }))}/></Field>
            <div className="col-span-2">
              <Field label="Фото товара">
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all px-4 py-5">
                  {form.photo
                    ? <img src={form.photo} alt="preview" className="h-32 w-full object-contain rounded" />
                    : <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-gray-300"><path strokeLinecap="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>
                        <span className="text-xs text-gray-400">Нажмите для выбора файла</span>
                        <span className="text-[10px] text-gray-300">PNG, JPG, WEBP до 5 МБ</span>
                      </>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => upd("photo", ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }} />
                </label>
                {form.photo && (
                  <button type="button" onClick={() => upd("photo", "")}
                    className="mt-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                    Удалить фото
                  </button>
                )}
              </Field>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <ConfirmDialog
          title={`Удалить «${confirmDelete.name}»?`}
          message="Товар будет удалён безвозвратно. Отменить действие невозможно."
          onConfirm={() => remove(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmDeleteCat && (
        <ConfirmDialog
          title={`Удалить категорию «${confirmDeleteCat}»?`}
          message={catUsage(confirmDeleteCat)
            ? `Её используют ${catUsage(confirmDeleteCat)} ${ruPlural(catUsage(confirmDeleteCat), "товар", "товара", "товаров")}. Категория будет снята с этих позиций.`
            : "Категория будет удалена из списка."}
          onConfirm={() => removeCategory(confirmDeleteCat)}
          onCancel={() => setConfirmDeleteCat(null)}
        />
      )}
    </div>
  );
}
