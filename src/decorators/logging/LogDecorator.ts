import safeStringify from 'json-stringify-safe';
import _omit from 'lodash.omit';
import { NO_LOG_KEY } from './LoggingFilters';

type KeyFilters = {
    target: 'args' | 'returnValue' | 'exceptions';
    filterAction: 'pick' | 'omit';
    paths: string[];
};

type LogOptions = {
    logArgs?: boolean | number[];
    logReturnValue?: boolean;
    logExceptions?: boolean;
    keyFilters?: KeyFilters[];
}

const defaultOptions: LogOptions = {
    logArgs: true,
    logReturnValue: true,
    logExceptions: true,
    keyFilters: []
};

function stringify(args: any): string {
    if (args instanceof Error) {
        return args.message;
    }

    switch (typeof args) {
        case 'undefined':
            return 'undefined';
        case 'object':
            return safeStringify(args);
        case 'boolean':
            return `${args}`
        case 'number':
            return args.toString(10);
        case 'string':
            return args;
        default:
            return 'unknown';
    }
}

const logArgs = (methodName: string, args: any) => {
    try {
        const argsString = stringify(args);
        console.log(`${methodName} called with args: ${argsString}`);
    } catch (e) {
        console.log(`${methodName} called`);
    }
};

const logReturnValue = (methodName: string, result: any) => {
    console.log(`${methodName} returned: ${stringify(result)}`);
};

const logException = (methodName: string, exception: any) => {
    console.error(`${methodName} threw error: ${stringify(exception?.message || exception)}`);
};

const wrapPromiseAndLogResult = (methodName: string, promise: Promise<unknown>) => {
    return promise
        .then(result => {
            logReturnValue(methodName, result);
            return result;
        })
        .catch(err => {
            logException(methodName, err);
            throw err;
        })
};


const handleLogArgs = (fullMethodName: string, args: any[], target: any, propertyKey: string, logOptions: LogOptions) => {
    let loggableArgs = [...args];
    if (logOptions && logOptions.logArgs) {
        if (logOptions.logArgs instanceof Array) {
            loggableArgs = logOptions.logArgs.map((index) => args[index]);
        }
        if (logOptions.keyFilters && logOptions.keyFilters.length) {
           const argKeyFilter = logOptions?.keyFilters.find(keyFilter => keyFilter.target === 'args');
           if (argKeyFilter) {
               if (argKeyFilter.filterAction === 'omit') {
                   loggableArgs = args.map(eachArg => _omit(eachArg, argKeyFilter.paths));
               }
           }
        }

        // handle noLog parameter decorator
        const forbiddenParams: number[] = Reflect.getOwnMetadata(
            NO_LOG_KEY,
            target,
            propertyKey
        )

        loggableArgs = args.filter((_, index) => !forbiddenParams.includes(index));

        logArgs(fullMethodName, loggableArgs);
    }
};

/**
 * This is a decorator that you can apply to class methods for easy logging, using @Log()
 * It is able to log the args passed to the method, as well as
 * the response returned from the method
 * and any exceptions thrown in the method invocation
 *
 * @param options {@Link LogOptions } Options to modify the logging conditions (optional)
 *
 */
export const log = (options?: LogOptions) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (descriptor === undefined) {
        descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    }
    const original = descriptor.value;
    const fullMethodName = `${target.constructor.name}.${propertyKey}`;

    options = {...defaultOptions, ...options};

    descriptor.value = function (...args: any) {
        handleLogArgs(fullMethodName, args, target, propertyKey, options);

        try {
            let result = original.apply(this, args);

            if (options.logReturnValue) {
                if (result instanceof Promise) result = wrapPromiseAndLogResult(fullMethodName, result);
                else logReturnValue(fullMethodName, result);
            }

            return result;
        } catch (e) {
            if (options.logExceptions) logException(fullMethodName, e);

            throw e;
        }
    }
};

