interface StatusBadgeProps {
  state?: string;
}

export const StatusBadge = ({ state }: StatusBadgeProps) => {
  if (!state) {
    return (
      <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-600">
        Unknown
      </span>
    );
  }

  const baseClasses =
    'px-2 py-1 text-xs rounded font-medium';

  switch (state.toLowerCase()) {
    case 'new':
      return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>New</span>;
    case 'active':
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>Active</span>;
    case 'done':
      return <span className={`${baseClasses} bg-green-100 text-green-700`}>Done</span>;
    case 'closed':
      return <span className={`${baseClasses} bg-gray-200 text-gray-600`}>Closed</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>{state}</span>;
  }
};

export default StatusBadge;
