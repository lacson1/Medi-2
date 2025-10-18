/**
 * Utility function to get time-based greeting
 * @returns {string} Time-appropriate greeting (Good morning/afternoon/evening)
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Get personalized greeting with user name
 * @param userName - The user's name
 * @returns {string} Personalized greeting
 */
export function getPersonalizedGreeting(userName?: string): string {
  const greeting = getGreeting();
  const displayName = userName || 'User';
  return `${greeting}, ${displayName}!`;
}
