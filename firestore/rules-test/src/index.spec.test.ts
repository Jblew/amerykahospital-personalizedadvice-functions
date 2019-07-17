/* tslint:disable:max-classes-per-file */
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "lodash";
import "mocha";
import { SinonSpy, spy } from "sinon";
import { FirestoreCollections } from "amerykahospital-personalizedadvice-core";

chaiUse(chaiAsPromised);

describe("Firebase rules", () => {
    describe("Collection " + FirestoreCollections.ADVICES_COLLECTION_KEY, () => {
        describe("get", () => {
            it.skip("Is not allowed when user is not authenticated");
            it.skip("Is allowed when advice belongs to user");
            it.skip("Is allowed when advice belongs to different user");
            it.skip("Is allowed when advice does not belong to a user and authenticated");
            it.skip("Is not allowed when advice does not belong to a user and not authenticated");
            it.skip("Is allowed when user is not authenticated");
        });

        describe("list", () => {
            it.skip("Lists only advices that belongs to a specific user");
            it.skip("Medical professional can list all advices");
            it.skip("Authenticated user can not list pending advices");
            it.skip("Non authenticated user can not list anything");
        });

        describe("create", () => {
            it.skip("Is not allowed when user is not authenticated");
            it.skip("Is not allowed when user is not medical professional but is authenticated");
            it.skip("Is allowed when user is a medical professional");
        });

        describe("update", () => {
            it.skip("Is not allowed when user is not authenticated");
            it.skip("Is not allowed when user is not medical professional but is authenticated");
            it.skip("Is allowed when user is a medical professional");
            it.skip("Is not allowed when advice belongs to a user and authenticated");
            it.skip("Is allowed when advice does not belong to any user and authenticated");
        });
    });

    describe("Collection " + FirestoreCollections.MEDICALPROFESSIONAL_UIDS_COLLECTION, () => {
        it.skip("Everybody can list");
    });

    describe("Collection " + FirestoreCollections.SENT_CODES_COLLECTION_KEY, () => {
        /* */
    });
});
