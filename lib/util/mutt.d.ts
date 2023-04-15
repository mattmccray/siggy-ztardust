interface Context {
    count: number;
    failed: number;
}
export declare function test(name: string, suite: (assertions: Assertions) => void): void;
export declare function isDeeplyEqual(a: any, b: any): boolean;
export declare function spy<T extends Function = (...params: any[]) => any>(fn?: T): T & {
    called: any[];
    thrown: (Error | undefined)[];
};
export default test;
declare function createAssertions(ctx: Context): {
    spy: typeof spy;
    equalDeep(actual: any, expected: any, message?: string): void;
    notEqualDeep(actual: any, expected: any, message?: string): void;
    equal(actual: any, expected: any, message?: string): void;
    notEqual(actual: any, expected: any, message?: string): void;
    fail(message: string): void;
    ok(actual: any, message?: string): void;
    notOk(actual: any, message?: string): void;
    is(actual: any, expected: any, message?: string): void;
    isNot(actual: any, expected: any, message?: string): void;
    throws(block: () => void, message?: string): void;
    doesNotThrow(block: () => void, message?: string): void;
};
type Assertions = ReturnType<typeof createAssertions>;
