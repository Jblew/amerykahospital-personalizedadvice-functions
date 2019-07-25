export const Config = {
    sms: {
        fromName: "Test", // Test is the default, accepted one
    },
    addAdvice: {
        limits: {
            perUser: {
                calls: 3,
                periodS: 60,
            },
            perPhone: {
                calls: 4,
                periodS: 40 * 60,
            },
        },
    },
    sendSMS: {
        limits: {
            perUser: {
                calls: 4,
                periodS: 60,
            },
            perPhone: {
                calls: 4,
                periodS: 40 * 60,
            },
        },
    },
    importAdviceToUser: {
        limits: {
            perUser: {
                calls: 50,
                periodS: 30 * 60,
            },
        },
    },
};
