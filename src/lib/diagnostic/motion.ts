// Centralized motion timing tokens for the diagnostic experience —
// keep every transition drawing from the same rhythm rather than
// scattering arbitrary duration values across components.
export const motionTokens = {
  fast: 0.16,
  default: 0.28,
  slow: 0.48,
  page: 0.7,
  ease: [0.16, 1, 0.3, 1] as const,
};
