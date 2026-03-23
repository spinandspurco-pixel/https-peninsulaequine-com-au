import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface IntakeContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const IntakeContext = createContext<IntakeContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function useIntake() {
  return useContext(IntakeContext);
}

export function IntakeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <IntakeContext.Provider value={{ isOpen, open, close }}>
      {children}
    </IntakeContext.Provider>
  );
}
