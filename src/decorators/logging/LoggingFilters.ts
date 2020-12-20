import 'reflect-metadata';

export const NO_LOG_KEY = Symbol('logExclude');
export const OMIT_PATH_KEY = Symbol('omitPath');

export const logExclude = (
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

export const logOmitPaths = (paths: string[]) => {
   return (target: any,
           propertyKey: string | symbol,
           parameterIndex: number) => {

       const existingRestrictedParams: {number: string[]}  = Reflect.getOwnMetadata(OMIT_PATH_KEY, target, propertyKey) || {};

       existingRestrictedParams[parameterIndex] = paths;

       Reflect.defineMetadata(
           OMIT_PATH_KEY,
           existingRestrictedParams,
           target,
           propertyKey
       );
   }
}

