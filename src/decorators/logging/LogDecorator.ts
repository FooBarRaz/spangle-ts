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

type MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;

const defaultOptions: LogOptions = {
    logArgs: true,
    logReturnValue: true,
    logExceptions: true,
    keyFilters: []
};

type LoggerFunction = (message: string) => void;

export type LogDecoratorConfiguration = {
    loggers?: {
        info?: LoggerFunction,
        error?: LoggerFunction,
        debug?: LoggerFunction
    },
    serializer?: (thingy: any) => string
}

export class LogDecorator {
    private infoLogger: LoggerFunction;
    private errorLogger: LoggerFunction;
    private debugLogger: LoggerFunction;
    private readonly serializer: (thingy: any) => string;

    constructor(config?: LogDecoratorConfiguration) {
        this.infoLogger = config?.loggers?.info || console.log;
        this.errorLogger = config?.loggers?.error || console.error;
        this.debugLogger = config?.loggers?.debug || console.debug;

        this.serializer = config?.serializer || JSON.stringify
    }

    private handleLogArgs(fullMethodName: string, args: any[], target: any, propertyKey: string, logOptions: LogOptions) {
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
            ) || [];

            loggableArgs = args.filter((_, index) => !forbiddenParams.includes(index));

            this.logArgs(fullMethodName, loggableArgs);
        }
    };


    private stringify(args: any): string {
        if (args instanceof Error) {
            return args.message;
        }

        switch (typeof args) {
            case 'undefined':
                return 'undefined';
            case 'object':
                return this.serializer(args);
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

    private logArgs(methodName: string, args: any) {
        try {
            const argsString = this.stringify(args);
            console.log(`${methodName} called with args: ${argsString}`);
        } catch (e) {
            console.log(`${methodName} called`);
        }
    };

    private logReturnValue(methodName: string, result: any) {
        console.log(`${methodName} returned: ${this.stringify(result)}`);
    };

    private logException(methodName: string, exception: any) {
        console.error(`${methodName} threw error: ${this.stringify(exception?.message || exception)}`);
    };

    private wrapPromiseAndLogResult(methodName: string, promise: Promise<unknown>) {
        return promise
            .then(result => {
                this.logReturnValue(methodName, result);
                return result;
            })
            .catch(err => {
                this.logException(methodName, err);
                throw err;
            })
    };
    /**
     * This is a decorator that you can apply to class methods for easy logging, using @log()
     * It is able to log the args passed to the method, as well as
     * the response returned from the method
     * and any exceptions thrown in the method invocation
     *
     * @param options {@Link LogOptions } Options to modify the logging conditions (optional)
     *
     */
    decoratorInstance(options?: LogOptions): MethodDecorator {
        const context = this;
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            if (descriptor === undefined) {
                descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
            }
            const original = descriptor.value;
            const fullMethodName = `${target.constructor.name}.${propertyKey}`;

            options = {...defaultOptions, ...options};

            descriptor.value = function (...args: any) {
                context.handleLogArgs(fullMethodName, args, target, propertyKey, options);

                try {
                    let result = original.apply(this, args);

                    if (options.logReturnValue) {
                        if (result instanceof Promise) result = context.wrapPromiseAndLogResult(fullMethodName, result);
                        else context.logReturnValue(fullMethodName, result);
                    }

                    return result;
                } catch (e) {
                    if (options.logExceptions) context.logException(fullMethodName, e);

                    throw e;
                }
            }
        };
    };
}

export function createDecorator(configuration?: LogDecoratorConfiguration) {
    const logDecoratorInstance = new LogDecorator(configuration)
    return logDecoratorInstance.decoratorInstance.bind(logDecoratorInstance);
}

export default createDecorator();




