import { DynamicLinksAdapter } from "./DynamicLinksAdapter";

export class DynamicLinksAdapterMock implements DynamicLinksAdapter {
    public async obtainShortUnguessableDynamicLinkFromFirebase(longDynamicLink: string): Promise<string> {
        throw new Error("Mock");
    }
}
