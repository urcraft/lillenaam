"use client";

interface NameFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  difficultyFilter: string;
  onDifficultyChange: (val: string) => void;
  showMyPicks: boolean;
  onMyPicksChange: (val: boolean) => void;
  selectedNames: string[];
  maxVotes: number;
  onRemovePick: (name: string) => void;
  favoriteName: string | null;
}

export default function NameFilters({
  search,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  showMyPicks,
  onMyPicksChange,
  selectedNames,
  maxVotes,
  onRemovePick,
  favoriteName,
}: NameFiltersProps) {
  return (
    <div className="mb-6 space-y-3">
      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-md p-5 flex flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Type a name..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50"
          />
        </div>

        {/* Difficulty filter */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Difficulty</label>
          <select
            value={difficultyFilter}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50"
          >
            <option value="ALL">All</option>
            <option value="EASY">Easy</option>
            <option value="MODERATE">Moderate</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* My Picks strip */}
      <div id="my-picks" className="flex items-center gap-2 flex-wrap px-1 scroll-mt-20">
        <button
          onClick={() => onMyPicksChange(!showMyPicks)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            showMyPicks
              ? "bg-saffron text-white ring-2 ring-saffron/30"
              : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
          }`}
        >
          My Picks ({maxVotes === Infinity ? selectedNames.length : `${selectedNames.length}/${maxVotes}`})
        </button>
        {selectedNames.length > 0 ? (
          selectedNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 bg-saffron/10 text-saffron-dark px-2.5 py-1 rounded-full text-xs font-medium"
            >
              {favoriteName === name && "\u2B50 "}{name}
              <button
                onClick={() => onRemovePick(name)}
                className="hover:text-red-500 transition-colors cursor-pointer leading-none min-w-[24px] min-h-[24px] flex items-center justify-center -mr-1"
                aria-label={`Remove ${name}`}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">No picks yet</span>
        )}
      </div>
    </div>
  );
}
