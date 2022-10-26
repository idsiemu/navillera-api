import { SystemResponse } from "./global.type"
import prisma from "./prisma"

const errorHandeler = async(code:string):Promise<SystemResponse> => {
    const error = await prisma.sys_error.findFirst({
        where: {
            code
        }
    })
    return {
        status: error.status,
        error: error,
    }
}

export default errorHandeler