import { AdviceRepository } from "amerykahospital-personalizedadvice-businesslogic";
import { AdviceRepositoryFactory } from "amerykahospital-personalizedadvice-db";
import * as admin from "firebase-admin";
import * as inversify from "inversify";

import TYPES from "../TYPES";
export default (context: inversify.interfaces.Context): AdviceRepository =>
    AdviceRepositoryFactory.make(context.container.get<admin.firestore.Firestore>(TYPES.Firestore));
