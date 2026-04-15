import path from "path";

export function getImportRelativePath(dirname: string) { return path.relative(dirname, process.cwd()); }

export class TrueExpected<T> {
    val: T;

    constructor(val: T) {
        this.val = val;
    }

    get has_value(): true {
        return true;
    }

    error(): unknown {
        throw Error("Bad Unexpected access");
    }

    transform<U> (transformLambda: (val: T) => Expected<U>): Expected<U> {
        return transformLambda(this.val);
    }

    get(): T {
        return this.val;
    }

    value(): T {
        return this.val;        
    }

    value_nice(): T {
        return this.value();
    }

    value_or(or: T): T {
        return this.value();
    }

    // cast<U>(): Expected<U> {
    //     if (this.state.expected) {
    //         throw new Error("Cannot cast an expected value");
    //     }

    //     return this as Expected<any>;
    // }

    // Warning ! May be dangerous if has_value was not checked before
    as_error(): Expected<never> {
        return this as unknown as Expected<never>;
    }
}

class Unexpected<T> {
    err: string;
    
    constructor(err: string) {
        this.err = err;
    }

    get has_value(): false {
        return false;
    }

    error(): string {
        return this.err;
    }

    transform<U> (transformLambda: (val: T) => Expected<U>): Expected<U> {
        return this as unknown as Unexpected<U>;
    }

    get(): T {
        throw Error("Bad Unexpected access");
    }

    value(): unknown {
        throw Error("Bad Unexpected access");
    }

    value_nice(): undefined {
        return undefined;
    }

    value_or(or: T): T {
        return or;
    }

    // cast<U>(): Expected<U> {
    //     if (this.state.expected) {
    //         throw new Error("Cannot cast an expected value");
    //     }

    //     return this as Expected<any>;
    // }

    // Warning ! May be dangerous if has_value was not checked before
    as_error(): Expected<never> {
        return this as unknown as Expected<never>;
    }
}

export type Expected<T> = TrueExpected<T> | Unexpected<T>;

export function unexpected(error: string, log: boolean = false) : Expected<never> {
    if (log) {
        console.error(error);
    }

    // return Expected.makeUnexpected(error);
    return new Unexpected(error);
}

export function expected<T>(val: T): TrueExpected<T> {
    // return Expected.makeExpected<T>(val);
    return new TrueExpected<T>(val);
}