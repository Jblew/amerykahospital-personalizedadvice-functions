export interface DynamicLinksAdapter {
    obtainShortUnguessableDynamicLinkFromFirebase(longDynamicLink: string): Promise<string>;
}
