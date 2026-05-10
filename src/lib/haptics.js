// src/lib/haptics.js

/**
 * Triggers a device vibration if supported.
 * @param {number | number[]} pattern - Vibration pattern in milliseconds.
 */
export const triggerHaptic = (pattern = 50) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors
    }
  }
};

export const hapticFeedback = {
  light: () => triggerHaptic(10), // Very light tap
  medium: () => triggerHaptic(30), // Standard tap
  heavy: () => triggerHaptic(50), // Heavy tap
  success: () => triggerHaptic([20, 50, 20]), // Quick double tap
  error: () => triggerHaptic([50, 100, 50, 100, 50]), // Stutter tap
};
