export default function ProjectsPage() {
  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[28px] font-bold">Проекты</h1>
        <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
          <span>+</span> Новый
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold">5</p>
          <p className="text-xs text-ios-gray">Проектов</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold">4</p>
          <p className="text-xs text-ios-gray">Задач</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold">1</p>
          <p className="text-xs text-ios-gray">Готово</p>
        </div>
      </div>
      <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm border border-ios-separator/30">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-purple" />
            <h3 className="text-base font-bold">Project Apex</h3>
          </div>
          <span className="text-xs text-brand-red bg-brand-red/10 px-2 py-1 rounded-full">Просрочено</span>
        </div>
        <p className="text-ios-gray text-sm mb-3">Запуск B2B продукта</p>
        <div className="h-1.5 bg-ios-bg rounded-full overflow-hidden mb-3">
          <div className="h-full bg-brand-purple w-0" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {['А','М','Д'].map((c, i) => (
              <div key={c} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white dark:border-ios-card-dark ${['bg-brand-purple','bg-brand-blue','bg-brand-orange'][i]}`}>
                {c}
              </div>
            ))}
          </div>
          <span className="text-sm text-ios-gray">0/2 задач</span>
        </div>
      </div>
    </main>
  );
}
