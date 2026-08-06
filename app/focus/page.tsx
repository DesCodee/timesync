export default function FocusPage() {
  return (
    <main className="p-4 flex flex-col items-center pt-10">
      <div className="flex gap-2 mb-10">
        {["25/5", "52/17", "90/20"].map((t, i) => (
          <button key={t} className={`px-4 py-2 rounded-full text-sm font-medium ${i === 0 ? 'bg-black text-white' : 'bg-white dark:bg-ios-card-dark text-ios-gray'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="w-64 h-64 rounded-full border-4 border-ios-separator flex flex-col items-center justify-center mb-8">
        <span className="text-ios-gray text-sm uppercase tracking-widest mb-2">Работа</span>
        <span className="text-6xl font-bold">25:00</span>
      </div>
      <p className="text-ios-gray mb-8">0/4 сессий</p>
      <div className="flex items-center gap-6">
        <button className="w-12 h-12 rounded-full bg-white dark:bg-ios-card-dark flex items-center justify-center shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
        <button className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
        <button className="w-12 h-12 rounded-full bg-white dark:bg-ios-card-dark flex items-center justify-center shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        </button>
      </div>
    </main>
  );
}
