export function Nav() {
  return (
    <header className="border-b border-white/10 mb-6">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥬</span>
          <div>
            <div className="font-semibold">LettyQuest</div>
            <div className="text-xs text-white/60">Keep Letty happy, keep your energy up</div>
          </div>
        </div>
        <div className="text-sm text-white/70">Hackathon build · web-only</div>
      </div>
    </header>
  );
}
