import { AdviceManager } from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";
import * as inversify from "inversify";

import TYPES from "../TYPES";
export default (context: inversify.interfaces.Context) =>
    new AdviceManager(context.container.get<admin.firestore.Firestore>(TYPES.Firestore));
