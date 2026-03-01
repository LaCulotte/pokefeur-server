import type { ExecException } from "child_process";
import path from "path";

export function getImportRelativePath(dirname: string) { return path.relative(dirname, process.cwd()) }

type ExpectedState<T> =
  | { expected: true; val: T }
  | { expected: false; val: string };

export class Expected<T> {
    private constructor(private state: ExpectedState<T>) {}

    static makeExpected<T>(val: T): Expected<T> {
        return new Expected<T>({ expected: true, val });
    }

    static makeUnexpected<T = never>(error: string): Expected<T> {
        return new Expected<T>({ expected: false, val: error });
    }


    has_value(): boolean {
        return this.state.expected;
    }

    error(): string {
        if (this.state.expected) {
            throw Error("Bad Expected access");
        }

        return this.state.val as string;
    }

    value(): T {
        if (!this.state.expected) {
            throw Error("Bad Unexpected access");
        }

        return this.state.val;        
    }

    value_nice(): T | undefined {
        if (!this.state.expected) {
            return undefined;
        }

        return this.state.val;     
    }

    value_or(or: T): T {
        if (!this.state.expected) {
            return or;
        }
        
        return this.state.val;
    }

    cast<U>(): Expected<U> {
        if (this.state.expected) {
            throw new Error("Cannot cast an expected value");
        }

        return this as Expected<any>;
    }

    // Warning ! May be dangerous if has_value was not checked before
    as_error(): Expected<never> {
        return this as unknown as Expected<never>;
    }
}

export function unexpected(error: string, log: boolean = false) : Expected<never> {
    if (log) {
        console.error(error);
    }

    return Expected.makeUnexpected(error);
}

export function expected<T>(val: T): Expected<T> {
    return Expected.makeExpected<T>(val);
}