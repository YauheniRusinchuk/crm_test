import { useState } from "react";
import type { User, AppState } from "../types";
import { inputCls } from "../components/ui";

type Mode = "login" | "register";

const FEATURES = [
  "Остатки по всем товарам в реальном времени",
  "Поставки и отгрузки в одном месте",
  "Аналитика и отчёты по складу",
  "Роли для команды: администратор, менеджер, оператор",
];

export default function Auth({
  state,
  onLogin,
  onRegister,
}: {
  state: AppState;
  onLogin: (u: User) => void;
  onRegister: (u: User) => void;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const u = state.users.find(
        (x) => x.email === email && x.password === password,
      );
      if (!u) {
        setError("Неверный email или пароль");
        setLoading(false);
        return;
      }
      if (!u.active) {
        setError("Аккаунт деактивирован");
        setLoading(false);
        return;
      }
      onLogin(u);
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Введите имя");
      return;
    }
    if (!email.includes("@")) {
      setError("Некорректный email");
      return;
    }
    if (password.length < 6) {
      setError("Минимум 6 символов");
      return;
    }
    if (state.users.find((u) => u.email === email)) {
      setError("Email уже используется");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onRegister({
        id: `u${Date.now()}`,
        name,
        email,
        password,
        role: "operator",
        department: dept || "Склад",
        phone,
        createdAt: new Date().toISOString().slice(0, 10),
        active: true,
      });
    }, 500);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#080D1A" }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 14 14" fill="white" className="w-4 h-4">
              <rect x="1" y="1" width="5" height="5" rx="1.2" />
              <rect x="8" y="1" width="5" height="5" rx="1.2" />
              <rect x="1" y="8" width="5" height="5" rx="1.2" />
              <rect x="8" y="8" width="5" height="5" rx="1.2" />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight">
            WareHQ
          </span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          Управление складом для малого бизнеса
        </p>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[980px] flex flex-col lg:flex-row gap-16 items-center">
          {/* Left — copy */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-5xl xl:text-6xl leading-[1.06] text-white mb-6"
              style={{
                fontFamily: "'Instrument Serif', serif",
                letterSpacing: "-1px",
              }}
            >
              Склад под
              <br />
              <em className="not-italic" style={{ color: "#60A5FA" }}>
                полным
              </em>
              <br />
              контролем
            </h1>
            <p
              className="text-base mb-10 max-w-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Простая система учёта для небольших складов и команд. Никаких
              сложных настроек — начните работу за 5 минут.
            </p>
            <div className="flex flex-col gap-3.5">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(59,130,246,0.15)",
                      border: "1px solid rgba(59,130,246,0.3)",
                    }}
                  >
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      className="w-3 h-3"
                    >
                      <path d="M2 6l2.5 2.5L10 3.5" />
                    </svg>
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing pill */}
            <div
              className="mt-10 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white/60">
                Бесплатно 3 дня · затем{" "}
                <span className="text-white/80 font-medium">9,99 ₽/мес</span> ·
                без привязки карты
              </span>
            </div>
          </div>

          {/* Right — form card */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div
              className="rounded-2xl p-8"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Tabs */}
              <div
                className="flex rounded-xl p-1 mb-7"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                {(["login", "register"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError("");
                    }}
                    className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
                    style={
                      mode === m
                        ? { background: "rgba(255,255,255,0.1)", color: "#fff" }
                        : { color: "rgba(255,255,255,0.35)" }
                    }
                  >
                    {m === "login" ? "Войти" : "Регистрация"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form
                onSubmit={mode === "login" ? handleLogin : handleRegister}
                className="flex flex-col gap-4"
              >
                {mode === "register" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-xs font-medium"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        Имя
                      </label>
                      <input
                        className={inputCls}
                        placeholder="Иван Иванов"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-xs font-medium"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          Телефон
                        </label>
                        <input
                          className={inputCls}
                          placeholder="+7 900..."
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-xs font-medium"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          Отдел
                        </label>
                        <input
                          className={inputCls}
                          placeholder="Склад"
                          value={dept}
                          onChange={(e) => setDept(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-medium"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Email
                  </label>
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="you@company.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-medium"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Пароль
                  </label>
                  <input
                    className={inputCls}
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-1 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.99]"
                  style={{
                    background:
                      "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Загрузка…
                    </span>
                  ) : mode === "login" ? (
                    "Войти в систему"
                  ) : (
                    "Создать аккаунт"
                  )}
                </button>
              </form>

              <p
                className="text-center text-xs mt-5"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                  }}
                  className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
                >
                  {mode === "login" ? "Зарегистрироваться" : "Войти"}
                </button>
              </p>

              {/* Demo */}
              {mode === "login" && (
                <div
                  className="mt-6 pt-6"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    Демо-доступ
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@warehq.ru");
                      setPassword("admin123");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.07)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)")
                    }
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-[10px] font-bold text-blue-300 shrink-0">
                      МО
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/70">
                        Михаил Орлов · Администратор
                      </p>
                      <p
                        className="text-[10px] font-mono"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        admin@warehq.ru · admin123
                      </p>
                    </div>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      <path d="M6 12l4-4-4-4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
