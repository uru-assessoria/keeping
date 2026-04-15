export const STYLE_CONSTANTS = {};

export var STYLE: any = {
  PAGE: 'flex min-h-screen flex-col md:flex-row bg-surface-variant text-slate-900 font-sans',
  MAIN: 'flex-1 flex flex-col w-full min-h-screen py-8 px-4 sm:px-8 md:px-16 bg-white shadow-[var(--shadow)]',
  TITLE: 'text-2xl sm:text-3xl font-semibold text-slate-900',
  BUTTON_WIREFRAME:
    'w-full sm:w-auto rounded px-3 py-2 text-sm text-white text-center transition-colors cursor-pointer',
  FORM: 'w-full max-w-md space-y-6',
  LABEL: 'block text-sm font-medium text-slate-700 mb-2',
  INPUT:
    'w-full rounded border border-slate-300 bg-surface-variant px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary',
};
STYLE.BUTTON = STYLE.BUTTON_WIREFRAME + ' bg-zinc-900 hover:bg-zinc-700';
STYLE.BUTTON_OPERATIVE =
  STYLE.BUTTON_WIREFRAME + ' bg-zinc-900 hover:bg-zinc-700';
STYLE.BUTTON_DESTRUCTIVE =
  STYLE.BUTTON_WIREFRAME + ' bg-danger hover:bg-red-700';

export default STYLE;
