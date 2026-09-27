import { redirect } from "next/navigation";
import { LoginForm } from "@/components/account/login-form";
import { getCurrentSession } from "@/server/auth/session";
import { safeNext } from "@/server/safe-next";
import { parseBillingPlan } from "@/lib/launch-offer";

export const metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const sp = await searchParams;
  // Pricing and launch-offer links preselect a billing plan (/signup?plan=yearly) on the dashboard's checkout form.
  const plan = parseBillingPlan(sp.plan);
  const next = safeNext(typeof sp.next === "string" ? sp.next : null) ?? (plan ? `/dashboard?plan=${plan}` : undefined);
  if (await getCurrentSession()) redirect(next ?? "/dashboard");
  return <LoginForm mode="signup" next={next} />;
}
