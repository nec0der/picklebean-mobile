/**
 * Date Formatting Utilities
 */

/**
 * Formats a date to a relative time string (e.g., "2 hours ago", "Yesterday")
 * or absolute date for older dates
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return 'Just now';
  }

  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  // For older dates, show formatted date
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  
  // If different year, include year
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric';
  }

  return date.toLocaleDateString('en-US', options);
};

/**
 * Formats a duration in seconds to MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
