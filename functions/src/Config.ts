export const Config = {
    sms: {
        fromName: "Ameryka app",
    },
    addAdvice: {
        limits: {
            perUser: {
                name: "addadvice_peruser_lim",
                maxCalls: 3,
                periodSeconds: 60,
            },
            perPhone: {
                name: "addadvice_perphone_lim",
                maxCalls: 4,
                periodSeconds: 40 * 60,
            },
        },
    },
    sendSMS: {
        limits: {
            perUser: {
                name: "sendsms_peruser_lim",
                maxCalls: 4,
                periodSeconds: 60,
            },
            perPhone: {
                name: "sendsms_perphone_lim",
                maxCalls: 4,
                periodSeconds: 40 * 60,
            },
        },
    },
    importAdviceToUser: {
        limits: {
            perUser: {
                name: "importadvice_peruser_lim",
                maxCalls: 50,
                periodSeconds: 30 * 60,
            },
        },
    },
};
