"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";

type Props = React.ComponentProps<typeof Button> & { pendingText?: string };

export function SubmitButton({ children, pendingText, disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <span className="size-3.5 animate-spin rounded-full border border-current border-t-transparent" />
          {pendingText ?? "Even geduld…"}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
