import DifficultyBadge from "./DifficultyBadge";
import { NameEntry } from "@/lib/useNames";

function getOriginColor(origin: string): { bg: string; text: string } {
  const lower = origin.toLowerCase();
  if (lower.includes("sanskrit")) return { bg: "bg-purple-100", text: "text-purple-700" };
  if (lower.includes("tamil")) return { bg: "bg-teal-100", text: "text-teal-700" };
  if (lower.includes("hindi")) return { bg: "bg-blue-100", text: "text-blue-700" };
  if (lower.includes("malayalam")) return { bg: "bg-green-100", text: "text-green-700" };
  return { bg: "bg-gray-100", text: "text-gray-600" };
}

interface NameCardProps {
  entry: NameEntry;
  isSelected: boolean;
  isFavorite: boolean;
  onToggle: () => void;
  onToggleFavorite: () => void;
  disabled: boolean;
}

export default function NameCard({
  entry,
  isSelected,
  isFavorite,
  onToggle,
  onToggleFavorite,
  disabled,
}: NameCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-4 flex items-start gap-3 transition-all ${
        isSelected ? "ring-2 ring-saffron" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
        <button
          onClick={onToggle}
          disabled={disabled && !isSelected}
          className={`text-2xl transition-transform cursor-pointer ${
            isSelected ? "scale-110" : ""
          } ${disabled && !isSelected ? "cursor-not-allowed" : "hover:scale-125"}`}
          aria-label={isSelected ? `Remove ${entry.name}` : `Vote for ${entry.name}`}
        >
          {isSelected ? "\u{1F9E1}" : "\u2661"}
        </button>
        {isSelected && (
          <button
            onClick={onToggleFavorite}
            className="text-lg cursor-pointer hover:scale-125 transition-transform"
            aria-label={isFavorite ? `Unmark ${entry.name} as favorite` : `Mark ${entry.name} as favorite`}
          >
            {isFavorite ? "\u2B50" : "\u2606"}
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-semibold text-charcoal">
            {entry.name}
          </span>
          {entry.originNotes && (
            (() => {
              const colors = getOriginColor(entry.originNotes);
              return (
                <span className={`text-xs ${colors.bg} ${colors.text} px-2 py-0.5 rounded-full`}>
                  {entry.originNotes}
                </span>
              );
            })()
          )}
          <DifficultyBadge difficulty={entry.danishDifficulty} />
        </div>
        {entry.meaning && (
          <p className="text-sm text-gray-500 mt-1">{entry.meaning}</p>
        )}
        {entry.danishPronunciationIssues && (
          <p className="text-xs text-gray-400 mt-1">
            Pronunciation: {entry.danishPronunciationIssues}
          </p>
        )}
      </div>
    </div>
  );
}
