// tslint:disable
import { Handler } from "amerykahospital-personalizedadvice-businesslogic";
import { https } from "firebase-functions";

export type UpstreamHandler<INPUT_TYPE, RESULT_TYPE> = Handler<
    (data: INPUT_TYPE, context: https.CallableContext) => Promise<RESULT_TYPE>
>;
