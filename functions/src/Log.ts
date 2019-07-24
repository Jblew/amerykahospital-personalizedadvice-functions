import { AbstractUniverseLog } from "universe-log";

export class Log extends AbstractUniverseLog {
    public static log(): Log {
        return Log.INSTANCE;
    }
    private static INSTANCE: Log = new Log();

    private constructor() {
        super({
            levelEnvs: ["AHPA_SERVERVERLESS_LOG_LEVEL"],
            metadata: {
                library: "amerykahospital-personalizedadvice-serverless-functions",
            },
        });
    }

    public initialize() {
        super.init();
    }
}
