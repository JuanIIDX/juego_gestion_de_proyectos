export const IS_BORED =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('bored') === 'true';
