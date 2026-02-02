import { useState, useRef, useCallback, useEffect } from "react";

interface PinchZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

interface UsePinchZoomOptions {
  minScale?: number;
  maxScale?: number;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
}

export function usePinchZoom(options: UsePinchZoomOptions = {}) {
  const { minScale = 1, maxScale = 4, onZoomStart, onZoomEnd } = options;

  const [state, setState] = useState<PinchZoomState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  const isZooming = useRef(false);
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef(1);
  const initialCenter = useRef({ x: 0, y: 0 });
  const lastCenter = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: React.Touch, touch2: React.Touch) => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  });

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isZooming.current = true;
        initialDistance.current = getDistance(e.touches[0], e.touches[1]);
        initialScale.current = state.scale;
        const center = getCenter(e.touches[0], e.touches[1]);
        initialCenter.current = center;
        lastCenter.current = center;
        onZoomStart?.();
      }
    },
    [state.scale, onZoomStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && initialDistance.current !== null) {
        e.preventDefault();
        
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scaleChange = currentDistance / initialDistance.current;
        let newScale = initialScale.current * scaleChange;
        
        // Clamp scale
        newScale = Math.max(minScale, Math.min(maxScale, newScale));

        // Calculate pan based on center movement
        const currentCenter = getCenter(e.touches[0], e.touches[1]);
        const deltaX = currentCenter.x - lastCenter.current.x;
        const deltaY = currentCenter.y - lastCenter.current.y;
        lastCenter.current = currentCenter;

        setState((prev) => {
          let newTranslateX = prev.translateX + deltaX;
          let newTranslateY = prev.translateY + deltaY;

          // Reset translation when zooming back to 1
          if (newScale <= 1) {
            newTranslateX = 0;
            newTranslateY = 0;
          }

          return {
            scale: newScale,
            translateX: newTranslateX,
            translateY: newTranslateY,
          };
        });
      } else if (e.touches.length === 1 && state.scale > 1) {
        // Single finger pan when zoomed in
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastCenter.current.x;
        const deltaY = touch.clientY - lastCenter.current.y;
        lastCenter.current = { x: touch.clientX, y: touch.clientY };

        setState((prev) => ({
          ...prev,
          translateX: prev.translateX + deltaX,
          translateY: prev.translateY + deltaY,
        }));
      }
    },
    [minScale, maxScale, state.scale]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
        initialDistance.current = null;
        
        if (e.touches.length === 1) {
          lastCenter.current = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
          };
        }
        
        if (isZooming.current) {
          isZooming.current = false;
          onZoomEnd?.();
        }
      }
    },
    [onZoomEnd]
  );

  // Double-tap to zoom
  const lastTapTime = useRef(0);
  const handleDoubleTap = useCallback(
    (e: React.TouchEvent) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
        e.preventDefault();
        
        if (state.scale > 1) {
          // Zoom out
          setState({ scale: 1, translateX: 0, translateY: 0 });
        } else {
          // Zoom in to 2x centered on tap position
          const touch = e.changedTouches[0];
          const rect = containerRef.current?.getBoundingClientRect();
          
          if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const offsetX = (centerX - touch.clientX) * 1; // Offset towards tap
            const offsetY = (centerY - touch.clientY) * 1;
            
            setState({
              scale: 2,
              translateX: offsetX,
              translateY: offsetY,
            });
          } else {
            setState({ scale: 2, translateX: 0, translateY: 0 });
          }
        }
      }

      lastTapTime.current = now;
    },
    [state.scale]
  );

  const reset = useCallback(() => {
    setState({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  // Reset when component unmounts or item changes
  useEffect(() => {
    return () => reset();
  }, [reset]);

  const transform = `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`;

  return {
    containerRef,
    scale: state.scale,
    translateX: state.translateX,
    translateY: state.translateY,
    transform,
    isZoomed: state.scale > 1,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    handleDoubleTap,
    reset,
  };
}
