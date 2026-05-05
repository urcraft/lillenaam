interface VoteCounterProps {
  count: number;
  max: number;
}

export default function VoteCounter({ count, max }: VoteCounterProps) {
  if (count === 0) return null;

  const handleClick = () => {
    document.getElementById("my-picks")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-saffron text-white font-semibold px-6 py-3 rounded-full shadow-lg text-sm cursor-pointer hover:bg-saffron-dark transition-colors"
    >
      {max === Infinity ? `${count} selected` : `${count}/${max} selected`}
    </button>
  );
}
