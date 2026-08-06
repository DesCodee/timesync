export default function AnalyticsPage() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-[28px] font-bold mb-2">Аналитика</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-ios-gray">Выполнение</p>
          <p className="text-[32px] font-bold text-brand-green mt-1">100%</p>
          <p className="text-xs text-ios-gray">6 из 6</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-ios-gray">Фокус (всего)</p>
          <p className="text-[32px] font-bold text-brand-blue mt-1">0ч 50м</p>
          <p className="text-xs text-ios-gray">2 сессий</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-ios-gray">Привычки</p>
          <p className="text-[32px] font-bold text-brand-orange mt-1">1/4</p>
          <p className="text-xs text-ios-gray">выполнено сегодня</p>
        </div>
        <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-ios-gray">Стрик</p>
          <p className="text-[32px] font-bold text-brand-purple mt-1">13д</p>
          <p className="text-xs text-ios-gray">макс. серия</p>
        </div>
      </div>
      <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold">Выполнение задач</h3>
          <span className="text-xs text-ios-gray">7 дней</span>
        </div>
        <div className="flex items-end justify-between h-24 gap-2">
          {['Сб','Вс','Пн','Вт','Ср','Чт','Пт'].map((d, i) => (
            <div key={d} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full rounded-t-md ${i === 6 ? 'bg-black dark:bg-white h-full' : 'bg-ios-separator h-2'}`} />
              <span className="text-[10px] text-ios-gray">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
