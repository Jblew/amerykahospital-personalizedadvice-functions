// tslint:disable member-ordering
import { BasicTaggedUniverseLog, UniverseLog } from "universe-log";

export class Log {
    private static ROOT_LOGGER: BasicTaggedUniverseLog = new BasicTaggedUniverseLog({
        levelEnvs: ["AHPA_SERVERVERLESS_LOG_LEVEL"],
        metadata: {
            project: "amerykahospital-personalizedadvice",
            service: "serverless-functions",
        },
    });
    private static loggers: { [x: string]: UniverseLog } = {};

    public static tag(tag: string): UniverseLog {
        if (!Log.loggers[tag]) {
            Log.loggers[tag] = Log.ROOT_LOGGER.tag(tag);
        }
        return Log.loggers[tag];
    }
}
