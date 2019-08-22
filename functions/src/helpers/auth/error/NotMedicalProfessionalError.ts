import { RoleKey } from "amerykahospital-personalizedadvice-core";

import { LocalizedFirebaseFunctionsError } from "../../../error/LocalizedFirebaseFunctionsError";

export type NotMedicalProfessionalError = LocalizedFirebaseFunctionsError<typeof NotMedicalProfessionalError.type>;

export namespace NotMedicalProfessionalError {
    export const type = "not-medical-professional-error";

    const localizedMessage = {
        EN: "You must be have a medical professional role to access this function",
        PL: "Musisz posiadać uprawnienia profesjonalisty medycznego",
    };

    export function make(): NotMedicalProfessionalError {
        return LocalizedFirebaseFunctionsError.make({
            code: "permission-denied",
            type,
            advanced: `Required role key: "${RoleKey.medicalprofessional}"`,
            localizedMessage,
        });
    }
}
