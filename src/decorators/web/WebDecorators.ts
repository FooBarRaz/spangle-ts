import 'reflect-metadata'
import {Request, RequestHandler, Response, Router} from 'express'

type httpVerb = 'get' | 'post' | 'put';

function defineRouteOnMethod(verb: httpVerb, path: string) {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
        // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
        // To prevent any further validation simply set it to an empty array here.
        let router;
        if (!Reflect.hasMetadata('router', target.constructor)) {
            router = Router();
            Reflect.defineMetadata('router', router, target.constructor);
        }

        // Get the routes stored so far, extend it by the new route and re-set the metadata.
        router = Reflect.getMetadata('router', target.constructor) as Router;
        // const routes = Reflect.getMetadata('router', target.constructor) as Array<{ path: string; route: Router }>;

        router[verb](path, descriptor.value);

        Reflect.defineMetadata('router', router, target.constructor);
    };
}

//
// type AuthenticationOptions = {
//     required: boolean;
// }
// /**
//  *
//  * Use this as a decorator for controller methods that require Authentication
//  * If an auth token is present in the request, you will be able to fetch it in the method
//  * @example
//  * const token = request.get('token')
//  *
//  * If an auth token is not present, it will return a 401 response
//  *
//  */
// export const Authenticate = (options: AuthenticationOptions = {required: true}): MethodDecorator =>
//     (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
//         const original = descriptor.value;
//
//         descriptor.value = function(req: Request, res: Response) {
//             const token = options.required ?
//                 requireToken(req, res)
//                 : getTokenIfExists(req);
//
//             req.headers.token = token;
//             original.apply(this, [req, res, token]);
//         }
//     };
//

export const Controller = (path = ''): ClassDecorator => (target: any): void => {
    Reflect.defineMetadata('prefix', path, target);

    // As long as routes are set by our methods this should almost never be true (except the controller has no methods)
    if (!Reflect.hasMetadata('router', target)) {
        const router = Router();
        Reflect.defineMetadata('router', router, target);
    }
};

export const createRouteForControllers = (controllers: object | object[]): Array<RequestHandler> => {
    if (!Array.isArray(controllers)) {
        return createRouteForControllers([controllers])
    }
    return (controllers as object[]).map(controller => {
        const prefix = Reflect.getMetadata('prefix', controller.constructor);
        const router = Reflect.getMetadata('router', controller.constructor);
        return Router().use(prefix, router)
    })
}

export const Get = (path = ''): MethodDecorator => defineRouteOnMethod('get', path);
export const Post = (path = ''): MethodDecorator => defineRouteOnMethod('post', path);
