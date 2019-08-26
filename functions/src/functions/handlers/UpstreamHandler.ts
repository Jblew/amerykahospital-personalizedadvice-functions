import { Handler } from "amerykahospital-personalizedadvice-businesslogic";
import * as functions from "firebase-functions";

export type UpstreamHandler<INPUT_TYPE, RESULT_TYPE> = Handler<
    (data: INPUT_TYPE, context: functions.https.CallableContext) => Promise<RESULT_TYPE>
>;
