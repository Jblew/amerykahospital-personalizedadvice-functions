import { RolesConfig } from "amerykahospital-personalizedadvice-db";
import FirestoreRoles from "firestore-roles";
import * as inversify from "inversify";

import TYPES from "../TYPES";

export default (context: inversify.interfaces.Context): FirestoreRoles =>
    new FirestoreRoles(RolesConfig, context.container.get(TYPES.Firestore));
