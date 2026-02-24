/**
 * Lightweight Cursor Glow Effect
 * Creates a smooth, premium blue glow that follows the cursor
 * Optimized for performance with throttling and transform-based animations
 */

let glow: HTMLElement | null = null;
let mouseX = 0;
let mouseY = 0;
let isMoving = false;
let throttleTimer: number | null = null;

/**
 * Initialize the cursor glow element
 */
function createGlowElement(): HTMLElement {
  const element = document.createElement("div");
  element.className = "cursor-glow";
  document.body.appendChild(element);
  return element;
}

/**
 * Handle mouse move with throttling for performance
 */
function handleMouseMove(e: MouseEvent): void {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (!isMoving) {
    isMoving = true;
    if (glow) glow.classList.add("active");
  }

  // Throttle updates to every frame (~16ms)
  if (throttleTimer !== null) {
    cancelAnimationFrame(throttleTimer);
  }

  throttleTimer = requestAnimationFrame(() => {
    if (glow) {
      glow.style.left = `${mouseX}px`;
      glow.style.top = `${mouseY}px`;
    }
  });
}

/**
 * Handle mouse leave - hide glow
 */
function handleMouseLeave(): void {
  isMoving = false;
  if (glow) glow.classList.remove("active");
}

/**
 * Initialize cursor glow effect
 */
export function initCursorGlow(): void {
  if (typeof window === "undefined") return;

  glow = createGlowElement();

  // Add event listeners
  document.addEventListener("mousemove", handleMouseMove, { passive: true });
  document.addEventListener("mouseleave", handleMouseLeave);

  // Cleanup function (optional, for React strict mode or cleanup)
  return () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseleave", handleMouseLeave);
    if (glow && glow.parentElement) {
      glow.parentElement.removeChild(glow);
    }
    if (throttleTimer !== null) {
      cancelAnimationFrame(throttleTimer);
    }
  };
}
