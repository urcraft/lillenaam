interface DifficultyBadgeProps {
  difficulty: string;
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  if (!difficulty) return null;

  const colors: Record<string, string> = {
    EASY: "bg-[#22C55E26] text-[#22C55E]",
    MODERATE: "bg-[#F59E0B26] text-[#F59E0B]",
    HARD: "bg-[#EF444426] text-[#EF4444]",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[difficulty] || "bg-gray-100 text-gray-500"}`}
    >
      {difficulty}
    </span>
  );
}
