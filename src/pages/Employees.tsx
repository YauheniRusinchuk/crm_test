import { useState } from "react";
import type { User, UserRole, AppState } from "../types";
import { Badge, Modal, Field, inputCls, Select, Btn, SearchInput, PageHeader } from "../components/ui";
import { useInView } from "../hooks";

const roleLabel: Record<UserRole, string> = { admin: "Администратор", manager: "Менеджер", operator: "Оператор" };
const DEPARTMENTS = ["Управление","Логистика","Склад","Закупки","Продажи","IT","Бухгалтерия"];
const EMPTY: Omit<User,"id"|"createdAt"> = { name:"", email:"", password:"", role:"operator", department:"Склад", phone:"", active:true };

const roleColor: Record<UserRole, string> = {
  admin:    "bg-amber-500",
  manager:  "bg-blue-600",
  operator: "bg-gray-500",
};

function EmployeeCard({ u, i, onClick }: { u: User; i: number; onClick: () => void }) {
  const { ref, inView } = useInView(0.05);
  const initials = u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div ref={ref} onClick={onClick}
      className="bg-white rounded-lg border border-gray-100  card-lift cursor-pointer overflow-hidden"
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(16px)", transition: `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s` }}>
      <div className={`h-1 ${roleColor[u.role]}`} />
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-10 h-10 rounded-md ${roleColor[u.role]} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold font-display text-sm truncate">{u.name}</p>
              {!u.active && <Badge status="inactive" />}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{u.department}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Badge status={u.role} />
          <p className="text-[10px] font-mono text-gray-400 truncate ml-2">{u.email}</p>
        </div>
      </div>
    </div>
  );
}

export default function Employees({ state, setUsers }: { state: AppState; setUsers: (u: User[]) => void }) {
  const { users, currentUser } = state;
  const isAdmin = currentUser?.role === "admin";
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (u: User) => {
    setForm({ name:u.name, email:u.email, password:u.password, role:u.role, department:u.department, phone:u.phone, active:u.active });
    setEditId(u.id); setShowForm(true); setDetail(null);
  };
  const save = () => {
    if (!form.name || !form.email) return;
    setUsers(editId
      ? users.map(u => u.id === editId ? { ...form, id: editId, createdAt: users.find(x=>x.id===editId)!.createdAt } : u)
      : [...users, { ...form, id:`u${Date.now()}`, createdAt: new Date().toISOString().slice(0,10) }]);
    setShowForm(false);
  };
  const toggle = (id: string) => { if (id === currentUser?.id) return; setUsers(users.map(u => u.id===id ? {...u,active:!u.active} : u)); };
  const upd = (k: keyof typeof form, v: string|boolean) => setForm(f => ({ ...f, [k]: v }));
  const initials = (name: string) => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Сотрудники" sub={`${users.filter(u=>u.active).length} активных из ${users.length}`} action={isAdmin && <Btn onClick={openAdd}>+ Добавить</Btn>} />

      {/* Role breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {(["admin","manager","operator"] as UserRole[]).map(role => (
          <div key={role} className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900">{users.filter(u=>u.role===role&&u.active).length}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{roleLabel[role]}</p>
          </div>
        ))}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Имя, email, отдел…" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((u, i) => (
          <EmployeeCard key={u.id} u={u} i={i} onClick={() => setDetail(u)} />
        ))}
        {filtered.length === 0 && <p className="col-span-full py-16 text-center text-gray-400">Сотрудники не найдены</p>}
      </div>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}
          footer={<>
            <Btn variant="ghost" onClick={() => setDetail(null)}>Закрыть</Btn>
            {isAdmin && detail.id !== currentUser?.id && <Btn variant="outline" onClick={() => toggle(detail.id)}>{detail.active ? "Деактивировать" : "Активировать"}</Btn>}
            {isAdmin && <Btn onClick={() => openEdit(detail)}>Редактировать</Btn>}
          </>}>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-md ${roleColor[detail.role]} flex items-center justify-center text-base font-bold text-white shrink-0`}>{initials(detail.name)}</div>
              <div>
                <h3 className="text-lg font-bold font-display">{detail.name}</h3>
                <div className="flex items-center gap-2 mt-1.5"><Badge status={detail.role} /><Badge status={detail.active ? "active" : "inactive"} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Отдел", detail.department], ["Телефон", detail.phone || "—"], ["Email", detail.email], ["Дата добавления", detail.createdAt]].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-[9px] font-mono font-semibold uppercase tracking-wider text-gray-400">{k}</p><p className="font-semibold font-display text-sm mt-0.5 break-all">{v}</p></div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {showForm && isAdmin && (
        <Modal title={editId ? "Редактировать сотрудника" : "Новый сотрудник"} onClose={() => setShowForm(false)}
          footer={<><Btn variant="ghost" onClick={() => setShowForm(false)}>Отмена</Btn><Btn onClick={save}>Сохранить</Btn></>}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Полное имя"><input className={inputCls} value={form.name} onChange={e => upd("name", e.target.value)} /></Field></div>
            <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={e => upd("email", e.target.value)} /></Field>
            <Field label="Телефон"><input className={inputCls} value={form.phone} onChange={e => upd("phone", e.target.value)} /></Field>
            <Field label="Пароль"><input className={inputCls} type="password" value={form.password} onChange={e => upd("password", e.target.value)} /></Field>
            <Field label="Роль"><Select value={form.role} onChange={v => upd("role", v)} options={(Object.entries(roleLabel) as [UserRole,string][]).map(([k,v]) => ({ value: k, label: v }))}/></Field>
            <Field label="Отдел"><Select value={form.department} onChange={v => upd("department", v)} options={DEPARTMENTS.map(d => ({ value: d, label: d }))}/></Field>
            <Field label="Активен">
              <div className="flex items-center gap-3 mt-1.5">
                <button type="button" onClick={() => upd("active", !form.active)} className={`w-12 h-6 rounded-full transition-all relative ${form.active ? "bg-gray-900" : "bg-gray-200"}`}>
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
