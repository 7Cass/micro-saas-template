import { config } from "@/config";
import Stripe from "stripe";
import { prisma } from "../database";
import { Console } from "console";

export const stripe = new Stripe(config.stripe.secretKey as string, {
    apiVersion: '2024-04-10',
    httpClient: Stripe.createFetchHttpClient(),
});

export const getStripeCustomerByEmail = async (email: string) => {
    const customers = await stripe.customers.list({ email });
    return customers.data[0];
}

export const getStripeCustomerByStripeId = async (stripeCustomerId: string) => {
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    return customer;
}

export const createStripeCustomer = async (
    input: {
        name?: string,
        email: string
    }
) => {
    let customer = await getStripeCustomerByEmail(input.email)
    if (customer) return customer

    const createdCustomer = await stripe.customers.create({
        email: input.email,
        name: input.name
    });

    const createdCustomerSubscription = await stripe.subscriptions.create({
        customer: createdCustomer.id,
        items: [{ price: config.stripe.plans.free.priceId }]
    });

    await prisma.user.update({
        where: {
            email: input.email,
        },
        data: {
            stripeCustomerId: createdCustomer.id,
            stripeSubscriptionId: createdCustomerSubscription.id,
            stripeSubscriptionStatus: createdCustomerSubscription.status,
            stripePriceId: config.stripe.plans.free.priceId
        }
    });

    return createdCustomer;
}

export const createCheckoutSession = async (userId: string, userEmail: string, userStripeSubscriptionId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                stripeCustomerId: true
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        let customer = user.stripeCustomerId ? await getStripeCustomerByStripeId(user.stripeCustomerId as string) : await createStripeCustomer({
            email: userEmail
        });

        let subscriptions = await stripe.subscriptionItems.list({
            subscription: userStripeSubscriptionId,
            limit: 1
        });

        const session = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: 'http://localhost:3000/app/settings/billing',
            flow_data: {
                type: "subscription_update_confirm",
                after_completion: {
                    type: 'redirect',
                    redirect: {
                        return_url: 'http://localhost:3000/app/settings/billing?success=true'
                    }
                },
                subscription_update_confirm: {
                    subscription: userStripeSubscriptionId,
                    items: [{ id: subscriptions.data[0].id, price: config.stripe.plans.pro.priceId, quantity: 1 }]
                }
            }
        });

        return {
            url: session.url
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error to create checkout session')
    }
}

export const cancelSubscription = async (stripeCustomerId: string, userStripeSubscriptionId: string) => {
    try {
        const customer = await getStripeCustomerByStripeId(stripeCustomerId);

        if (!customer) {
            throw new Error('Customer not found');
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: 'http://localhost:3000/app/settings/billing',
            flow_data: {
                type: 'subscription_cancel',
                after_completion: {
                    type: 'redirect',
                    redirect: {
                        return_url: 'http://localhost:3000/app/settings/billing?success=true'
                    }
                },
                subscription_cancel: {
                    subscription: userStripeSubscriptionId
                }
            }
        });

        return {
            url: session.url
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error to cancel subscription')
    }
}

export const handleProcessWebhookUpdatedSubscription = async (event: {
    object: Stripe.Subscription
}) => {
    const stripeCustomerId = event.object.customer as string
    const stripeSubscriptionId = event.object.id as string
    const stripeSubscriptionStatus = event.object.status
    const stripePriceId = event.object.items.data[0].price.id

    const userExists = await prisma.user.findFirst({
        where: {
            OR: [
                {
                    stripeSubscriptionId,
                },
                {
                    stripeCustomerId,
                },
            ],
        },
        select: {
            id: true,
        },
    })

    if (!userExists) {
        throw new Error('user of stripeCustomerId not found')
    }

    await prisma.user.update({
        where: {
            id: userExists.id,
        },
        data: {
            stripeCustomerId,
            stripeSubscriptionId,
            stripeSubscriptionStatus,
            stripePriceId,
        },
    });
}

export const handleProccessWebhookDeleteSubscription = async (event: { object: Stripe.Subscription }) => {
    const stripeCustomerId = event.object.customer as string
    const stripeSubscriptionId = event.object.id as string

    const userExists = await prisma.user.findFirst({
        where: {
            OR: [
                {
                    stripeSubscriptionId,
                },
                {
                    stripeCustomerId,
                },
            ],
        },
        select: {
            id: true,
        },
    })

    if (!userExists) {
        throw new Error('user of stripeCustomerId not found')
    }

    await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: config.stripe.plans.free.priceId }]
    });
}

type Plan = {
    priceId: string
    quota: {
        TASKS: number
    }
}

type Plans = {
    [key: string]: Plan
}

export const getPlanByPrice = (priceId: string) => {
    const plans: Plans = config.stripe.plans

    const planKey = Object.keys(plans).find(
        (key) => plans[key].priceId === priceId,
    ) as keyof Plans | undefined

    const plan = planKey ? plans[planKey] : null

    if (!plan) {
        throw new Error(`Plan not found for priceId: ${priceId}`)
    }

    return {
        name: planKey,
        quota: plan.quota,
    }
}

export const getSubscriptionById = async (subscriptionId: string) => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
}

export const getUserCurrentPlan = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            stripePriceId: true,
            stripeSubscriptionId: true
        },
    })

    if (!user || !user.stripePriceId) {
        throw new Error('User or user stripePriceId not found')
    }

    if (!user || !user.stripeSubscriptionId) {
        throw new Error('User or user subscriptionId not found')
    }

    const plan = getPlanByPrice(user.stripePriceId);
    const subscription = await getSubscriptionById(user.stripeSubscriptionId);

    const tasksCount = await prisma.todo.count({
        where: {
            userId,
        },
    })

    const availableTasks = plan.quota.TASKS
    const currentTasks = tasksCount
    const usage = (currentTasks / availableTasks) * 100

    return {
        name: plan.name,
        subscription_status: subscription.status,
        canceled_at: subscription.canceled_at,
        cancel_at: subscription.cancel_at,
        quota: {
            TASKS: {
                available: availableTasks,
                current: currentTasks,
                usage,
            },
        },
    }
}