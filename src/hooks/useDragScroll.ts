import { useRef, useCallback, useEffect } from "react";

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    // Don't initiate drag on inputs/buttons
    if ((e.target as HTMLElement).closest("input, button, select, textarea")) return;
    isDown.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const onMouseLeave = useCallback(() => {
    isDown.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.removeProperty("user-select");
    }
  }, []);

  const onMouseUp = useCallback(() => {
    isDown.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.removeProperty("user-select");
    }
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDown.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.cursor = "grab";
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseDown, onMouseLeave, onMouseUp, onMouseMove]);

  return ref;
}
