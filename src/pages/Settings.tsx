import { useState } from "react";
import type { AppState } from "../types";
import { Field, inputCls, Select, Btn, PageHeader } from "../components/ui";

export default function Settings({ state, setState }: { state: AppState; setState: (s: Partial<AppState>) => void }) {
  const { currentUser } = state;
  const isAdmin = currentUser?.role === "admin";

  const [companyName, setCompanyName] = useState(state.companyName);
  const [currency, setCurrency] = useState(state.currency);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ name: currentUser?.name ?? "", phone: currentUser?.phone ?? "", department: currentUser?.department ?? "" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwOk, setPwOk] = useState(false);

  const saveCompany = () => { setState({ companyName, currency }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const saveProfile = () => {
    if (!currentUser) return;
    setState({ users: state.users.map(u => u.id === currentUser.id ? { ...u, ...profile } : u), currentUser: { ...currentUser, ...profile } });
    setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000);
  };
  const changePassword = () => {
    setPwError(""); setPwOk(false);
    if (!currentUser) return;
    if (currentUser.password !== currentPw) { setPwError("Неверный текущий пароль"); return; }
    if (newPw.length < 6) { setPwError("Минимум 6 символов"); return; }
    setState({ users: state.users.map(u => u.id === currentUser.id ? { ...u, password: newPw } : u), currentUser: { ...currentUser, password: newPw } });
    setCurrentPw(""); setNewPw(""); setPwOk(true); setTimeout(() => setPwOk(false), 2000);
  };

  const initials = currentUser?.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const roleLabel: Record<string, string> = { admin: "Администратор", manager: "Менеджер", operator: "Оператор" };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader title="Настройки" sub="Профиль и управление платформой" />

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header — avatar + name inside the dark band */}
        <div className="bg-gray-900 px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-base font-bold text-white shrink-0 shadow-lg shadow-blue-900/40">
            {initials}
          </div>
          <div>
            <p className="font-bold text-lg text-white leading-tight">{currentUser?.name}</p>
            <p className="text-white/45 text-xs mt-0.5">{currentUser?.email} · <span className="text-white/60 font-medium">{roleLabel[currentUser?.role ?? ""]}</span></p>
          </div>
        </div>
        {/* Form fields */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Имя"><input className={inputCls} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></Field>
            <Field label="Телефон"><input className={inputCls} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></Field>
            <Field label="Отдел"><input className={inputCls} value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))} /></Field>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <Btn onClick={saveProfile}>Сохранить профиль</Btn>
            {profileSaved && <span className="text-xs text-emerald-600 font-semibold">✓ Сохранено</span>}
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-lg border border-gray-100  p-7">
        <h3 className="font-bold font-display text-base mb-5">Смена пароля</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Текущий пароль"><input className={inputCls} type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" /></Field>
          <Field label="Новый пароль"><input className={inputCls} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" /></Field>
        </div>
        {pwError && <p className="text-xs text-rose-500 mb-3 font-medium">{pwError}</p>}
        {pwOk && <p className="text-xs text-emerald-600 mb-3 font-semibold">✓ Пароль изменён</p>}
        <Btn onClick={changePassword}>Изменить пароль</Btn>
      </div>

      {/* Company (admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-lg border border-gray-100  p-7">
          <h3 className="font-bold font-display text-base mb-5">Параметры компании</h3>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="col-span-2"><Field label="Название компании"><input className={inputCls} value={companyName} onChange={e => setCompanyName(e.target.value)} /></Field></div>
            <Field label="Валюта">
              <Select value={currency} onChange={setCurrency} options={["₽","$","€","£","¥"].map(c => ({ value: c, label: c }))}/>
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <Btn onClick={saveCompany}>Сохранить</Btn>
            {saved && <span className="text-xs text-emerald-600 font-semibold">✓ Сохранено</span>}
          </div>
        </div>
      )}

      {/* System info */}
      <div className="bg-white rounded-lg border border-gray-100  p-7">
        <h3 className="font-bold font-display text-base mb-5">Система</h3>
        <div className="flex flex-col gap-4">
          {[["Версия платформы", "WareHQ Склад OS v2.0", "stable"], ["Хранение данных", "localStorage браузера", "local"]].map(([label, desc, badge]) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div><p className="font-semibold font-display text-sm">{label}</p><p className="text-xs text-gray-400 mt-0.5">{desc}</p></div>
              <span className="font-mono text-[10px] font-bold border border-gray-200 text-gray-500 rounded-lg px-2.5 py-1 uppercase tracking-wider">{badge}</span>
            </div>
          ))}
          {isAdmin && (
            <div className="flex items-center justify-between py-3">
              <div><p className="font-semibold font-display text-sm text-rose-500">Сброс данных</p><p className="text-xs text-gray-400 mt-0.5">Вернуться к демо-данным</p></div>
              <Btn variant="danger" size="sm" onClick={() => { if (window.confirm("Сбросить все данные?")) { localStorage.clear(); window.location.reload(); } }}>Сбросить</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
