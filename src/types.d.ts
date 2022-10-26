import { Http2ServerRequest, Http2ServerResponse } from "http2";

export type Resolver = (root:any, args:any, context:IContext, info:any) => any

interface Resolvers {
    [key:string] : {
        [key:string] : Resolver
    }
}

export interface IContext {
    req: Http2ServerRequest
    res: Http2ServerResponse
}