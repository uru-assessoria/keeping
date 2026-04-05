export const STYLE_CONSTANTS = {};

export var STYLE: any = {
  PAGE: 'flex min-h-screen flex-col md:flex-row bg-zinc-50 font-sans dark:bg-black',
  MAIN: 'flex-1 flex flex-col w-full min-h-screen py-8 px-4 sm:px-8 md:px-16 bg-white dark:bg-black',
  TITLE: 'text-2xl sm:text-3xl font-semibold text-black dark:text-zinc-50',
  BUTTON_WIREFRAME:
    'w-full sm:w-auto rounded  px-3 py-1 text-sm text-white text-center transition-colors cursor-pointer',
  FORM: 'w-full max-w-md space-y-6',
  LABEL: 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2',
  INPUT:
    'w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400',
};
STYLE.BUTTON = STYLE.BUTTON_WIREFRAME + ' bg-zinc-900 hover:bg-zinc-700';
STYLE.BUTTON_OPERATIVE =
  STYLE.BUTTON_WIREFRAME + ' bg-zinc-900 hover:bg-zinc-700';
STYLE.BUTTON_DESTRUCTIVE =
  STYLE.BUTTON_WIREFRAME + ' bg-red-900 hover:bg-red-800';

export default STYLE;
