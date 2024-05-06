'use server'

import { auth } from "@/services/auth"
import { createCheckoutSession } from "@/services/stripe";
import { redirect } from "next/navigation";

export async function createCheckoutSessionAction() {
    const userSession = await auth();

    if (!userSession?.user?.id) {
        return {
            error: 'Not authorized',
            data: null
        };
    }

    const checkoutSession = await createCheckoutSession(
        userSession.user.id,
        userSession.user.email as string,
        userSession.user.stripeSubscriptionId as string
    );

    if (!checkoutSession.url) return;

    redirect(checkoutSession.url)
}

