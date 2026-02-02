import { useState, useEffect } from "react";

interface UseProgressiveImageOptions {
  lowQualitySrc?: string;
  highQualitySrc: string;
}

export function useProgressiveImage({ lowQualitySrc, highQualitySrc }: UseProgressiveImageOptions) {
  const [src, setSrc] = useState(lowQualitySrc || highQualitySrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    // Preload high quality image
    const img = new Image();
    img.src = highQualitySrc;
    
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
      setIsLoaded(true);
    };

    // If low quality exists, mark as initially loaded
    if (lowQualitySrc) {
      setIsLoaded(true);
    }

    return () => {
      img.onload = null;
    };
  }, [lowQualitySrc, highQualitySrc]);

  return { src, isLoaded, isHighQualityLoaded, isBlurred: !isHighQualityLoaded && !!lowQualitySrc };
}
