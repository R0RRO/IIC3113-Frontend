import { ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VoteButton({ report, disabled = false }) {
  const { vote, userVotes } = useApp();
  const currentVote = userVotes[report.id] || 0;

  return (
    <div className={`flex flex-col items-center gap-0.5 min-w-[48px] ${disabled ? 'opacity-40' : ''}`}>
      <button
        onClick={() => !disabled && vote(report.id, 1)}
        disabled={disabled}
        className={`p-1 rounded-md transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
          currentVote === 1
            ? 'bg-sky-500 text-white'
            : 'text-gray-400 hover:bg-sky-100 hover:text-sky-600'
        }`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      <span className={`text-sm font-bold ${
        currentVote === 1 ? 'text-sky-600' : currentVote === -1 ? 'text-red-500' : 'text-gray-600'
      }`}>
        {report.votes}
      </span>
      <button
        onClick={() => !disabled && vote(report.id, -1)}
        disabled={disabled}
        className={`p-1 rounded-md transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
          currentVote === -1
            ? 'bg-red-500 text-white'
            : 'text-gray-400 hover:bg-red-100 hover:text-red-500'
        }`}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
