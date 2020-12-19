import 'reflect-metadata';

export const NO_LOG_KEY = Symbol('noLog');


export const noLog = (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number) => {
    const existingOmittedParams: number[] = Reflect.getOwnMetadata(NO_LOG_KEY, target, propertyKey) || [];
    existingOmittedParams.push(parameterIndex);

    Reflect.defineMetadata(
        NO_LOG_KEY,
        existingOmittedParams,
        target,
        propertyKey
    );
}

