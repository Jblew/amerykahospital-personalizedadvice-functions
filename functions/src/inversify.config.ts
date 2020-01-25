import { AdviceRepository, SentSMSRepository, SMSConfig } from "amerykahospital-personalizedadvice-businesslogic";
import * as admin from "firebase-admin";
import { FirestoreRoles } from "firestore-roles";
import { Container } from "inversify";
import "reflect-metadata";

import { DynamicLinksAdapter } from "./adapters/DynamicLinksAdapter";
import { DynamicLinksAdapterImpl } from "./adapters/DynamicLinksAdapterImpl";
import { SMSApiAdapter } from "./adapters/SMSApiAdapter";
import { AddAdviceFunctionHandlerFactory } from "./functions/addadvice/AddAdviceFunctionHandlerFactory";
import { HeartbeatFunctionHandlerFactory } from "./functions/heartbeat/HeartbeatFunctionHandlerFactory";
import {
    ImportAdviceToUserFunctionHandlerFactory, //
} from "./functions/importadvicetouser/ImportAdviceToUserFunctionHandlerFactory";
import { SendSMSFunctionHandlerFactory } from "./functions/sendsms/SendSMSFunctionHandlerFactory";
import { ThankFunctionHandlerFactory } from "./functions/thank/ThankFunctionHandlerFactory";
import { AuthHelper } from "./helpers/auth/AuthHelper";
import { AuthHelperImpl } from "./helpers/auth/AuthHelperImpl";
import adviceRepositoryFactory from "./providers/AdviceRepositoryFactory";
import firebaseAppFactory from "./providers/FirebaseAppFactory";
import firestoreRolesFactory from "./providers/FirestoreRolesFactory";
import { RateLimiterFactory } from "./providers/RateLimiterFactory";
import { RateLimiterFactoryImpl } from "./providers/RateLimiterFactoryImpl";
import sentSMSRepositoryFactory from "./providers/SentSMSRepositoryFactory";
import smsApiAdapterFactory from "./providers/SMSApiAdapterFactory";
import { DeepLinkBuilder, deepLinkBuilder, FirebaseConfig, FIREBASE_CONFIG, SMS_CONFIG } from "./settings";
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
        .bind<DynamicLinksAdapter>(TYPES.DynamicLinksAdapter)
        .to(DynamicLinksAdapterImpl)
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
        .bind<ImportAdviceToUserFunctionHandlerFactory>(TYPES.ImportAdviceToUserFunctionHandlerFactory)
        .to(ImportAdviceToUserFunctionHandlerFactory)
        .inSingletonScope();
    container
        .bind<HeartbeatFunctionHandlerFactory>(TYPES.HeartbeatFunctionHandlerFactory)
        .to(HeartbeatFunctionHandlerFactory)
        .inSingletonScope();
    container
        .bind<ThankFunctionHandlerFactory>(TYPES.ThankFunctionHandlerFactory)
        .to(ThankFunctionHandlerFactory)
        .inSingletonScope();
    container
        .bind<SendSMSFunctionHandlerFactory>(TYPES.SendSMSFunctionHandlerFactory)
        .to(SendSMSFunctionHandlerFactory)
        .inSingletonScope();
    container.bind<DeepLinkBuilder>(TYPES.DeepLinkBuilder).toConstantValue(deepLinkBuilder);
    container.bind<SMSConfig>(TYPES.SMSConfig).toConstantValue(SMS_CONFIG);
    container.bind<FirebaseConfig>(TYPES.FirebaseConfig).toConstantValue(FIREBASE_CONFIG);

    return container;
}
export default containerFactory;
