export default function SettingsPage() {
  return (
    <main className="p-4">
      <h1 className="text-[28px] font-bold mb-6">Настройки</h1>
      <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
          T
        </div>
        <div>
          <p className="text-base font-semibold">test</p>
          <p className="text-sm text-ios-gray">test@gmail.com</p>
        </div>
      </div>
      <p className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-3">Внешний вид</p>
      <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-ios-bg dark:bg-white/10 flex items-center justify-center text-sm">🌙</div>
          <span className="text-base">Тема</span>
        </div>
        <div className="flex bg-ios-bg dark:bg-white/10 rounded-xl p-1">
          {['Система', 'Светлая', 'Тёмная'].map((t, i) => (
            <button key={t} className={`flex-1 py-1.5 text-sm rounded-lg ${i === 0 ? 'bg-white dark:bg-ios-card-dark shadow-sm font-medium' : 'text-ios-gray'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs font-medium text-ios-gray uppercase tracking-wider mb-3">О приложении</p>
      <div className="bg-white dark:bg-ios-card-dark rounded-2xl shadow-sm divide-y divide-ios-separator/50">
        <div className="p-4 flex items-center justify-between">
          <span className="text-base">Версия</span>
          <span className="text-ios-gray">1.0.0</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <span className="text-base">Политика конфиденциальности</span>
          <span className="text-ios-gray">›</span>
        </div>
      </div>
    </main>
  );
}
