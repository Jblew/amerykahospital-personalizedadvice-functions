import * as firebaseTesting from "@firebase/testing";
import * as inversify from "inversify";
export default (context: inversify.interfaces.Context) =>
    firebaseTesting.initializeAdminApp({ projectId: "unit-testing-" + Date.now(), databaseName: "db" });
