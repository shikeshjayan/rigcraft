export function timeAgo(date) {
  if (!date) return '';
  const input = new Date(date);
  if (Number.isNaN(input.getTime())) return '';
  const seconds = Math.floor((Date.now() - input.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return input.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
