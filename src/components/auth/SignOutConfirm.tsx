import { ReactNode, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SignOutConfirmProps {
  onConfirm: () => void | Promise<void>;
  children: ReactNode;
  description?: string;
}

/**
 * Wraps a trigger element with a confirmation dialog before signing out.
 * Prevents accidental termination of a Google OAuth session.
 */
export function SignOutConfirm({ onConfirm, children, description }: SignOutConfirmProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="border-border/30 bg-background/95 backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl tracking-tight">
            End this session?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground/80 leading-relaxed">
            {description ??
              "You will be signed out of HQ. You can sign back in with Google at any time."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-mono text-[10px] uppercase tracking-[0.22em]">
            Stay signed in
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setOpen(false);
              await onConfirm();
            }}
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
