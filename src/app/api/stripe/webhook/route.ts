import Stripe from "stripe";

import { handleProccessWebhookDeleteSubscription, handleProcessWebhookUpdatedSubscription, stripe } from "@/services/stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`);
        return new Response(`Webhook Error: ${error.message}`, { status: 400 });
    }

    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            await handleProcessWebhookUpdatedSubscription(event.data);
            break;
        case 'customer.subscription.deleted':
            await handleProccessWebhookDeleteSubscription(event.data);
            break;
        default:
            console.warn(`Unhandled event type ${event.type}`);
            break;
    }

    return new Response('{ "recieved": true }', { status: 200 });
}