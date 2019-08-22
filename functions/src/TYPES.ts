export const TYPES = {
    FirebaseAdminApp: Symbol("FirebaseAdminApp"),
    Firestore: Symbol("Firestore"),
    RealtimeDatabase: Symbol("RealtimeDatabase"),
    AuthHelper: Symbol("AuthHelper"),
    RateLimiterFactory: Symbol("RateLimiterFactory"),
    AddAdviceFunctionFactory: Symbol("AddAdviceFunctionFactory"),
    ImportAdviceToUserFunctionFactory: Symbol("ImportAdviceToUserFunctionFactory"),
    SendSMSFunctionFactory: Symbol("SendSMSFunctionFactory"),
    FirestoreRoles: Symbol("FirestoreRoles"),
    DynamicLinksAdapter: Symbol("DynamicLinksAdapter"),
    SMSApiAdapter: Symbol("SMSApiAdapter"),
    AdviceRepository: Symbol("AdviceRepository"),
    SentSMSRepository: Symbol("SentSMSRepository"),
    AdviceSMSSender: Symbol("AdviceSMSSender"),
};

export default TYPES;

export { AuthHelper } from "./helpers/auth/AuthHelper";
export { RateLimiterFactory } from "./providers/RateLimiterFactory";
export { AddAdviceFunctionFactory } from "./functions/addadvice/AddAdviceFunctionFactory";
export { ImportAdviceToUserFunctionFactory } from "./functions/importadvicetouser/ImportAdviceToUserFunctionFactory";
export { SendSMSFunctionFactory } from "./functions/sendsms/SendSMSFunctionFactory";
