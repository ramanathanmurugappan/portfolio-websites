/**
 * Neumorphic theme palette factory.
 * Single source of truth for light/dark neumorphic shadow colours.
 * Used by Chatbot and VoiceMode.
 */

export interface NmTheme {
  /** Base surface colour */
  bg:     string;
  /** Primary text */
  text:   string;
  /** Secondary / muted text */
  muted:  string;
  /** Faint text (close button, disabled states) */
  faint:  string;
  /** Raised shadow — element sits above the surface */
  raised: (n: number) => string;
  /** Inset shadow — element is pressed into the surface */
  inset:  (n: number) => string;
}

export function nmTheme(isDark: boolean): NmTheme {
  const shadowDark  = isDark ? '#14141a' : '#d1d1d5';
  const shadowLight = isDark ? '#28282e' : '#ffffff';

  return {
    bg:    isDark ? '#1e1e22' : '#e8e8ec',
    text:  isDark ? '#c4c4cc' : '#444',
    muted: isDark ? '#58586a' : '#999',
    faint: isDark ? '#38384a' : '#bbb',
    raised: (n) =>
      `${n}px ${n}px ${n * 2}px ${shadowDark}, -${n}px -${n}px ${n * 2}px ${shadowLight}`,
    inset: (n) =>
      `inset ${n}px ${n}px ${n * 2}px ${shadowDark}, inset -${n}px -${n}px ${n * 2}px ${shadowLight}`,
  };
}
