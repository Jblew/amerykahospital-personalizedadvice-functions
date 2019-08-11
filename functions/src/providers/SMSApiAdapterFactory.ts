import * as inversify from "inversify";

import { SMSApiAdapter } from "../adapters/SMSApiAdapter";
import { Config } from "../Config";

export default (context: inversify.interfaces.Context) => new SMSApiAdapter({ test: false, from: Config.sms.fromName });
