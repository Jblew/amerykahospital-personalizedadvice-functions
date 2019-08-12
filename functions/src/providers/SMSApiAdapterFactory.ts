import * as inversify from "inversify";

import { SMSApiAdapterImpl } from "../adapters/SMSApiAdapterImpl";
import { Config } from "../Config";

export default (context: inversify.interfaces.Context) =>
    new SMSApiAdapterImpl({ test: false, from: Config.sms.fromName });
