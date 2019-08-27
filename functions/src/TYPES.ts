export const TYPES = {
    FirebaseAdminApp: Symbol("FirebaseAdminApp"),
    Firestore: Symbol("Firestore"),
    RealtimeDatabase: Symbol("RealtimeDatabase"),
    AuthHelper: Symbol("AuthHelper"),
    RateLimiterFactory: Symbol("RateLimiterFactory"),
    AddAdviceFunctionHandlerFactory: Symbol("AddAdviceFunctionHandlerFactory"),
    ImportAdviceToUserFunctionHandlerFactory: Symbol("ImportAdviceToUserFunctionHandlerFactory"),
    SendSMSFunctionHandlerFactory: Symbol("SendSMSFunctionHandlerFactory"),
    FirestoreRoles: Symbol("FirestoreRoles"),
    DynamicLinksAdapter: Symbol("DynamicLinksAdapter"),
    SMSApiAdapter: Symbol("SMSApiAdapter"),
    AdviceRepository: Symbol("AdviceRepository"),
    SentSMSRepository: Symbol("SentSMSRepository"),
    FirebaseConfig: Symbol("FirebaseConfig"),
    SMSConfig: Symbol("SMSConfig"),
    DeepLinkBuilder: Symbol("DeepLinkBuilder"),
};

export default TYPES;

export { AuthHelper } from "./helpers/auth/AuthHelper";
export { RateLimiterFactory } from "./providers/RateLimiterFactory";
export { AddAdviceFunctionHandlerFactory } from "./functions/addadvice/AddAdviceFunctionHandlerFactory";
export {
    ImportAdviceToUserFunctionHandlerFactory,
} from "./functions/importadvicetouser/ImportAdviceToUserFunctionHandlerFactory";
export { SendSMSFunctionFactory } from "./functions/sendsms/SendSMSFunctionFactory";
