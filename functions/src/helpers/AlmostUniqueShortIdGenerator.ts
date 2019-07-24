export class AlmostUniqueShortIdGenerator {
    public static generateShortAlmostUniqueId() {
        let id = "";
        for (let partNum = 0; partNum < this.partLengths.length; partNum++) {
            const partLen = this.partLengths[partNum];
            for (let i = 0; i < partLen; i++) {
                id += this.baseStrChars[Math.floor(Math.random() * this.baseStrChars.length)];
            }
            id += partNum < this.partLengths.length - 1 ? "-" : "";
        }
        return id;
    }

    public static async obtainUniqueId(existsFn: (id: string) => Promise<boolean>): Promise<string> {
        for (let i = 0; i < 10; i++) {
            const idCandidate = AlmostUniqueShortIdGenerator.generateShortAlmostUniqueId();
            const exists = await existsFn(idCandidate);
            if (!exists) {
                return idCandidate;
            }
        }
        throw new Error("AlmostUniqueShortIdGenerator: could not obtain unique id through 10 tries");
    }

    private static baseStrChars = "abcdefghijklmnopqrstuvwxyz";
    private static partLengths: number[] = [3, 3];
}
