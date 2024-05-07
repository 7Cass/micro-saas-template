export const config = {
    stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        plans: {
            free: {
                priceId: 'price_1PDOVHJUzH3T83WssEUlUg9p',
                quota: {
                    TASKS: 5

                },
            },
            pro: {
                priceId: 'price_1PDLy7JUzH3T83Ws7fbYHAzm',
                quota: {
                    TASKS: 100
                }
            }
        }
    }
};