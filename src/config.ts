export const config = {
    stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY,
        webhookSecret: '',
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