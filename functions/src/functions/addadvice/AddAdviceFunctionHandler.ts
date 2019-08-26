import {
    AddAdviceFunction,
    AddAdviceFunctionAbstractHandler,
    AdviceRepository,
} from "amerykahospital-personalizedadvice-businesslogic";
import * as admin from "firebase-admin";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

import { InvalidInputDataError } from "../../error/InvalidInputDataError";
import { PerPhoneLimitExceededError } from "../../error/PerPhoneLimitExceededError";

export class AddAdviceFunctionHandler extends AddAdviceFunctionAbstractHandler {
    private adviceRepository!: AdviceRepository;

    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;

    public constructor(p: { adviceRepository: AdviceRepository; perPhoneNumberLimiter: FirebaseFunctionsRateLimiter }) {
        super();
        this.adviceRepository = p.adviceRepository;
        this.perPhoneNumberLimiter = p.perPhoneNumberLimiter;
    }

    public async handle(input: AddAdviceFunction.Input) {
        await this.limitPerPhone(input.parentPhoneNumber);

        return super.handle(input);
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

    private async limitPerPhone(phone: string) {
        await this.perPhoneNumberLimiter.rejectOnQuotaExceededOrRecordUsage(`p_${phone}`, config =>
            PerPhoneLimitExceededError.make(config),
        );
    }
}
