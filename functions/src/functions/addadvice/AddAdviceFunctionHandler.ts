import {
    AddAdviceFunction,
    AddAdviceFunctionAbstractHandler,
    AdviceRepository,
} from "amerykahospital-personalizedadvice-businesslogic";
import * as admin from "firebase-admin";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import FirestoreRoles from "firestore-roles";

import { InvalidInputDataError } from "../../error/InvalidInputDataError";
import { MissingPermissionError } from "../../error/MissingPermissionError";
import { PerPhoneLimitExceededError } from "../../error/PerPhoneLimitExceededError";

export class AddAdviceFunctionHandler extends AddAdviceFunctionAbstractHandler {
    private adviceRepository: AdviceRepository;
    private roles: FirestoreRoles;

    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;

    public constructor(p: {
        adviceRepository: AdviceRepository;
        roles: FirestoreRoles;
        perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;
    }) {
        super();
        this.roles = p.roles;
        this.adviceRepository = p.adviceRepository;
        this.perPhoneNumberLimiter = p.perPhoneNumberLimiter;
    }

    public async handle(input: AddAdviceFunction.Input, props: { uid: string }) {
        await this.limitPerPhone(input.parentPhoneNumber);

        return super.handle(input, props);
    }

    protected getTimestampSeconds(): number {
        return admin.firestore.Timestamp.now().seconds;
    }

    protected makeInvalidInputDataError(p: { advanced: string }) {
        return InvalidInputDataError.make(p.advanced);
    }

    protected getAdviceRepository(): AdviceRepository {
        return this.adviceRepository;
    }

    protected async userHasRole(p: { uid: string; role: string }): Promise<boolean> {
        return this.roles.hasRole(p.uid, p.role);
    }

    protected makeMissingRoleError(p: { role: string }) {
        return MissingPermissionError.make(p.role);
    }

    private async limitPerPhone(phone: string) {
        await this.perPhoneNumberLimiter.rejectOnQuotaExceededOrRecordUsage(`p_${phone}`, config =>
            PerPhoneLimitExceededError.make(config),
        );
    }
}
