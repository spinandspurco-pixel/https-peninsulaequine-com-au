import { createContext, useContext } from "react";

interface IntroState {
  /** True once the splash logo has settled and the header logo should appear */
  headerLogoReady: boolean;
  /** True once the entire header should fade in (delayed during homepage intro) */
  headerReady: boolean;
}

export const IntroContext = createContext<IntroState>({
  headerLogoReady: true,
  headerReady: true,
});

export function useIntroState() {
  return useContext(IntroContext);
}
