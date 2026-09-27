import Link from "next/link";
import { ShieldCheck, TriangleAlert, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { peekLoginToken } from "@/server/auth/login";

export const metadata = { title: "Confirm sign-in" };

export default async function VerifyPage({ searchParams }: PageProps<"/auth/verify">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  // Looked up by hash without consuming the link, so people see which account they are about to sign into.
  const preview = token && typeof sp.error !== "string" ? await peekLoginToken(token) : null;
  const invalid = typeof sp.error === "string" || (!!token && !preview);
  return (
    <div>
      <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <ShieldCheck className="size-6" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Confirm sign-in</h1>
      <p className="mt-2 text-muted-foreground">
        One more click to sign in on this device. This extra step keeps email security scanners from using your link.
      </p>
      {invalid ? (
        <Alert variant="destructive" className="mt-6">
          <TriangleAlert />
          <AlertDescription>This sign-in link is invalid, has expired or was already used. Request a new one below.</AlertDescription>
        </Alert>
      ) : preview ? (
        // Plain form POST: works without JavaScript and the token never ends up in a server action payload log.
        <form method="post" action="/api/auth/verify" className="mt-8 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm">
            <span className="flex size-9 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-4" />
            </span>
            <span>
              <span className="block text-muted-foreground">Signing in as</span>
              <span className="font-medium">{preview.maskedEmail}</span>
            </span>
          </div>
          <input type="hidden" name="token" value={token} />
          <Button type="submit" className="h-11 w-full text-base">
            <ShieldCheck /> Sign in on this device
          </Button>
          <p className="text-xs text-muted-foreground">Not you? Close this page — nothing happens without the click.</p>
        </form>
      ) : (
        <Alert variant="destructive" className="mt-6">
          <TriangleAlert />
          <AlertDescription>This link is missing its token. Request a new sign-in email.</AlertDescription>
        </Alert>
      )}
      <Link href="/login" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">
        Request a new link
      </Link>
    </div>
  );
}
