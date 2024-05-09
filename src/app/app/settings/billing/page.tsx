import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  createCheckoutSessionAction,
  createCancelSubscriptionAction,
} from "./actions";
import { auth } from "@/services/auth";
import { getUserCurrentPlan } from "@/services/stripe";
import { formatTimestampToDate } from "@/lib/format-date";

export default async function Page() {
  const session = await auth();
  const plan = await getUserCurrentPlan(session?.user.id as string);

  return (
    <form
      action={
        plan.name === "free"
          ? createCheckoutSessionAction
          : createCancelSubscriptionAction
      }
    >
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle>Plan Usage</CardTitle>
          <CardDescription>
            You are currently on the{" "}
            <span className="uppercase font-bold">{plan.name}</span> plan.
            <span className="block">
              {plan.cancel_at && (
                <small>
                  Expires in: {formatTimestampToDate(plan.cancel_at)}
                </small>
              )}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <header className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                {plan.quota.TASKS.current}/{plan.quota.TASKS.available}
              </span>
              <span className="text-muted-foreground text-sm">
                {plan.quota.TASKS.usage.toFixed(2)}%
              </span>
            </header>
            <main>
              <Progress value={plan.quota.TASKS.usage} />
            </main>
          </div>
        </CardContent>
        {plan.name !== "free" && (
          <CardFooter className="flex items-center justify-between border-t border-border pt-6">
            <span>
              You are subscribed to the PRO plan with more tasks and support.
            </span>
            {plan.cancel_at && (
              <Button disabled>
                Wait until <span className="uppercase px-1">{plan.name}</span>
                expires
              </Button>
            )}
            {!plan.cancel_at && (
              <Button type="submit">Cancel Subscription</Button>
            )}
          </CardFooter>
        )}
        {plan.name === "free" && (
          <CardFooter className="flex items-center justify-between border-t border-border pt-6">
            <span>Upgrade to PRO for more tasks and support</span>
            <Button type="submit">Subscribe for $0,99/mo</Button>
          </CardFooter>
        )}
      </Card>
    </form>
  );
}
