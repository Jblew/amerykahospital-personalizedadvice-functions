import {
    AdviceRepository,
    ImportAdviceToUserFunction,
    ImportAdviceToUserFunctionAbstractHandler,
} from "amerykahospital-personalizedadvice-businesslogic";

import { AdviceAlreadyImportedError } from "../../error/AdviceAlreadyImportedError";
import { AdviceDoesNotExistError } from "../../error/AdviceDoesNotExistError";
import { InvalidInputDataError } from "../../error/InvalidInputDataError";

export class ImportAdviceToUserFunctionHandler extends ImportAdviceToUserFunctionAbstractHandler {
    private adviceRepository!: AdviceRepository;

    public constructor(p: { adviceRepository: AdviceRepository }) {
        super();
        this.adviceRepository = p.adviceRepository;
    }

    public async handle(input: ImportAdviceToUserFunction.Input, props: { uid: string }) {
        return super.handle(input, props);
    }

    protected getAdviceRepository(): AdviceRepository {
        return this.adviceRepository;
    }

    protected makeInvalidInputDataError(p: { advanced: string }) {
        return InvalidInputDataError.make(p.advanced);
    }

    protected makeAdviceDoesNotExistError(p: { advanced: string }) {
        return AdviceDoesNotExistError.make(p.advanced);
    }
    protected makeAdviceAlreadyImportedError() {
        return AdviceAlreadyImportedError.make();
    }
}
