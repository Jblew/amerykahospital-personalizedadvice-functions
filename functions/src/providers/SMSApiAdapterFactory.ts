import * as inversify from "inversify";

import { SMSApiAdapterImpl } from "../adapters/SMSApiAdapterImpl";

export default (context: inversify.interfaces.Context) => new SMSApiAdapterImpl({ test: false });
