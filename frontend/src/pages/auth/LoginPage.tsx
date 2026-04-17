export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-24 px-6">
      <h2 className="text-2xl font-semibold mb-6">Вход</h2>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          disabled
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full border rounded px-3 py-2"
          disabled
        />
        <button
          type="button"
          className="w-full bg-slate-800 text-white rounded py-2 opacity-50 cursor-not-allowed"
          disabled
        >
          В разработке
        </button>
      </form>
    </div>
  );
}
