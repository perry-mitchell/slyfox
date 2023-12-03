export function assertNotNull<T>(exp: T, message: string): asserts exp is NonNullable<T> {
    if (exp === null) {
        const error = new Error(message);
        error.name = "AssertionError";
        throw error;
    }
}
