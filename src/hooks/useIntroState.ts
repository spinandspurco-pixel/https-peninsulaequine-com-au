import { createContext, useContext } from "react";

interface IntroState {
  /** True once the splash logo has settled and the header logo should appear */
  headerLogoReady: boolean;
}

export const IntroContext = createContext<IntroState>({ headerLogoReady: true });

export function useIntroState() {
  return useContext(IntroContext);
}
