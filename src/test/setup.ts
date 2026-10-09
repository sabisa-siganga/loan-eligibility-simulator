import '@testing-library/jest-dom/vitest';

declare global {
  // React 18+ testing flag for act()
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
