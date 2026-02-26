/**
 * Company brand colours and logo paths.
 * Single source of truth — used by Projects and Experience.
 */

export const COMPANY_COLORS: Record<string, string> = {
  'ITC Infotech': '#1e6ef4',
  'Accenture':    '#a100ff',
  'Kaleidofin':   '#00b388',
};

export const COMPANY_LOGOS: Record<string, string> = {
  'ITC Infotech': '/images/company-itcinfotech.png',
  'Accenture':    '/images/company-accenture.png',
  'Kaleidofin':   '/images/company-kaleidofin.png',
};

/** Returns the brand colour for a company, falling back to blue. */
export function companyColor(company: string): string {
  return COMPANY_COLORS[company] ?? '#1e6ef4';
}
