export default function TasksPage() {
  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[28px] font-bold">Задачи</h1>
        <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
          <span>+</span> Новая
        </button>
      </div>
      <div className="bg-white dark:bg-ios-card-dark rounded-2xl p-4 shadow-sm">
        <p className="text-ios-gray">Здесь будет список задач с поиском и фильтрами</p>
      </div>
    </main>
  );
}
