export const Config = {
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
    heartbeat: {
        limits: {
            perUser: {
                name: "heartbeat_peruser_lim",
                maxCalls: 6,
                periodSeconds: 60,
            },
        },
    },
    thank: {
        limits: {
            perUser: {
                name: "thank_peruser_lim",
                maxCalls: 30,
                periodSeconds: 60,
            },
        },
    },
};
