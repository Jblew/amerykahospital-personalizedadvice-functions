export const Config = {
    addAdvice: {
        limits: {
            perUser: {
                calls: 2,
                periodS: 60,
            },
            perPhone: {
                calls: 3,
                periodS: 60 * 60,
            },
        },
    },
};
