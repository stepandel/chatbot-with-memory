// Mode detection utilities

export type AppMode = 'fun' | 'regular';

/**
 * Determines if the current path is in fun mode
 */
export function isFunMode(pathname: string): boolean {
  return pathname.startsWith('/fun') || pathname === '/';
}

/**
 * Determines if the current path is in regular mode
 */
export function isRegularMode(pathname: string): boolean {
  return pathname.startsWith('/app') || pathname.startsWith('/regular');
}

/**
 * Gets the app mode from a pathname
 */
export function getAppMode(pathname: string): AppMode {
  if (isFunMode(pathname)) return 'fun';
  if (isRegularMode(pathname)) return 'regular';
  return 'fun'; // Default to fun mode
}

/**
 * Gets the appropriate redirect path for a mode
 */
export function getModeHomePath(mode: AppMode): string {
  return mode === 'fun' ? '/' : '/app';
}

/**
 * Gets the appropriate signin path for a mode
 */
export function getModeSigninPath(mode: AppMode): string {
  return '/';
}