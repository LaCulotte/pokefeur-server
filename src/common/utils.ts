import type { ExecException } from "child_process";
import path from "path";

export function getImportRelativePath(dirname: string) { return path.relative(dirname, process.cwd()) }

export class Expected<T> {
    private val: T | string;
    private expected: boolean;

    private constructor(val: T | string, expected: boolean) {
        this.expected = expected;
        this.val = val;

        if (!this.expected && typeof this.val !== "string") {
            throw new Error("Unexpected should be constructed with type 'string'");
        }
    }

    static makeExpected<T>(val: T) : Expected<T>{
        return new Expected<T>(val, true);
    }

    static makeUnxpected(error: string) : Expected<string>{
        return new Expected<string>(error, false);
    }

    has_value(): boolean {
        return this.expected
    }

    error(): string {
        if (this.expected) {
            throw Error("Bad Expected access");
        }
        return this.val as string;
    }

    value(): T {
        if (!this.expected) {
            throw Error("Bad Unexpected access");
        }
        return this.val as T;
    }
}

export function unexpected(error: string, log: boolean = false) : Expected<any>{
    if (log) {
        console.error(error);
    }

    return Expected.makeUnxpected(error);
}

export function expected<T>(val: T): Expected<T> {
    return Expected.makeExpected<T>(val);
}