/**
 * Shared mutable singleton for client-side hero choreography.
 *
 * Both DNAHelixCanvas (scroll gating) and Hero (typewriter) are 'use client'
 * components that share the same module instance in the browser bundle, so a
 * plain mutable object is the simplest cross-component signal without needing
 * React context or props threading.
 */
export const heroState = {
  /** Set to true by Hero once the typewriter animation finishes. */
  typingDone: false,
}
