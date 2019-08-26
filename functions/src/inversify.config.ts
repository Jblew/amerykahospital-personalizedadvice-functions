import { AdviceRepository, SentSMSRepository } from "amerykahospital-personalizedadvice-businesslogic";
import * as admin from "firebase-admin";
import { FirestoreRoles } from "firestore-roles";
import { Container } from "inversify";
import "reflect-metadata";

import { DynamicLinksAdapter } from "./adapters/DynamicLinksAdapter";
import { SMSApiAdapter } from "./adapters/SMSApiAdapter";
import { AdviceSMSSender } from "./advicesms/AdviceSMSSender";
import { AdviceSMSSenderImpl } from "./advicesms/AdviceSMSSenderImpl";
import { AddAdviceFunctionHandlerFactory } from "./functions/addadvice/AddAdviceFunctionHandlerFactory";
import { ImportAdviceToUserFunctionFactory } from "./functions/importadvicetouser/ImportAdviceToUserFunctionFactory";
import { SendSMSFunctionFactory } from "./functions/sendsms/SendSMSFunctionFactory";
import { AuthHelper } from "./helpers/auth/AuthHelper";
import { AuthHelperImpl } from "./helpers/auth/AuthHelperImpl";
import adviceRepositoryFactory from "./providers/AdviceRepositoryFactory";
import firebaseAppFactory from "./providers/FirebaseAppFactory";
import firestoreRolesFactory from "./providers/FirestoreRolesFactory";
import { RateLimiterFactory } from "./providers/RateLimiterFactory";
import { RateLimiterFactoryImpl } from "./providers/RateLimiterFactoryImpl";
import sentSMSRepositoryFactory from "./providers/SentSMSRepositoryFactory";
import smsApiAdapterFactory from "./providers/SMSApiAdapterFactory";
import TYPES from "./TYPES";

function containerFactory() {
    const container = new Container();
    container
        .bind<admin.app.App>(TYPES.FirebaseAdminApp)
        .toDynamicValue(firebaseAppFactory)
        .inSingletonScope();
    container
        .bind<admin.firestore.Firestore>(TYPES.Firestore)
        .toDynamicValue(context => context.container.get<admin.app.App>(TYPES.FirebaseAdminApp).firestore())
        .inSingletonScope();
    container
        .bind<admin.database.Database>(TYPES.RealtimeDatabase)
        .toDynamicValue(context => context.container.get<admin.app.App>(TYPES.FirebaseAdminApp).database())
        .inSingletonScope();
    container
        .bind<FirestoreRoles>(TYPES.FirestoreRoles)
        .toDynamicValue(firestoreRolesFactory)
        .inSingletonScope();
    container
        .bind<SMSApiAdapter>(TYPES.SMSApiAdapter)
        .toDynamicValue(smsApiAdapterFactory)
        .inSingletonScope();
    container
        .bind<AdviceSMSSender>(TYPES.AdviceSMSSender)
        .to(AdviceSMSSenderImpl)
        .inSingletonScope();
    container
        .bind<DynamicLinksAdapter>(TYPES.DynamicLinksAdapter)
        .to(DynamicLinksAdapter)
        .inSingletonScope();
    container.bind<AuthHelper>(TYPES.AuthHelper).to(AuthHelperImpl);
    container.bind<RateLimiterFactory>(TYPES.RateLimiterFactory).to(RateLimiterFactoryImpl);
    container
        .bind<AdviceRepository>(TYPES.AdviceRepository)
        .toDynamicValue(adviceRepositoryFactory)
        .inSingletonScope();
    container
        .bind<SentSMSRepository>(TYPES.SentSMSRepository)
        .toDynamicValue(sentSMSRepositoryFactory)
        .inSingletonScope();
    container
        .bind<AddAdviceFunctionHandlerFactory>(TYPES.AddAdviceFunctionHandlerFactory)
        .to(AddAdviceFunctionHandlerFactory)
        .inSingletonScope();
    container
        .bind<ImportAdviceToUserFunctionFactory>(TYPES.ImportAdviceToUserFunctionFactory)
        .to(ImportAdviceToUserFunctionFactory)
        .inSingletonScope();
    container
        .bind<SendSMSFunctionFactory>(TYPES.SendSMSFunctionFactory)
        .to(SendSMSFunctionFactory)
        .inSingletonScope();

    return container;
}
export default containerFactory;
