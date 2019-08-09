/* tslint:disable no-unused-expression */
import { expect } from "chai";
import { Container } from "inversify";
import * as _ from "lodash";
import "mocha";
import "reflect-metadata";

import baseContainerFactory from "../inversify.config";

describe("AuthHelper", function() {
    let container: Container | null;

    beforeEach(() => {
        container = baseContainerFactory();
    });

    afterEach(() => {
        container = null;
    });

    it("container exists", () => {
        expect(container).to.not.be.undefined;
    });
});
