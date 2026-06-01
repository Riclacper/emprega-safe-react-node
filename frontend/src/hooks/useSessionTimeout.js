import { useEffect } from "react";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutos

export function useSessionTimeout(signOut, isAuthenticated) {
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;

    function resetTimer() {
      window.clearTimeout(timeoutId);

      timeoutId = window.setTimeout(() => {
        signOut();
      }, INACTIVITY_LIMIT);
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [signOut, isAuthenticated]);
}
