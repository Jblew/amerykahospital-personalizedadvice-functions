import { RolesConfig } from "amerykahospital-personalizedadvice-core";
import FirestoreRoles from "firestore-roles";
import * as inversify from "inversify";

import TYPES from "../TYPES";

export default (context: inversify.interfaces.Context) =>
    new FirestoreRoles(RolesConfig, context.container.get(TYPES.Firestore));
