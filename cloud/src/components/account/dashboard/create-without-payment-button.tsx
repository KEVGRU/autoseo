"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { adminCreateOwnInstanceAction, type AdminActionState } from "@/server/actions/admin";

/** Admins: turn their own unpaid reservation into a complimentary instance (the server re-checks admin rights). */
export function CreateWithoutPaymentButton({ slug, workspaceName }: { slug: string; workspaceName: string }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(adminCreateOwnInstanceAction, {});
  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.message) toast.success(state.message);
  }, [state]);
  return (
    <form action={action}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="workspaceName" value={workspaceName} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? <Spinner /> : <Gift />} Create without payment (admin)
      </Button>
    </form>
  );
}
