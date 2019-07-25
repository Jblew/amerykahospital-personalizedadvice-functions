export const Config = {
    addAdvice: {
        limits: {
            perUser: {
                calls: 2,
                periodS: 60,
            },
            perPhone: {
                calls: 4,
                periodS: 40 * 60,
            },
        },
    },
};
