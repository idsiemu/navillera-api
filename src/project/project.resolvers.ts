import prisma from '~/prisma';
import { generateSerial } from '~/utils';
import { getPreSignedUrl } from '~/utils/aws';

const resolverMap = {
    Query: {
        fetchProjectDetail: async (_, data) => {
            const { idx } = data
            const types  = await prisma.project_types.findMany()
            if(idx) {
                const project = await prisma.projects.findUnique({
                    where: {
                        idx
                    },
                    include: {
                        images: {
                            orderBy: {
                                list_order: 'asc'
                            }
                        }
                    }
                })
                
                return {
                    status: 200,
                    data: {
                        types,
                        project
                    }
                }
            }
            return {
                status: 200,
                data: {
                    types,
                }
            }
        }
    },
    Mutation: {
        modifiyProject1: async (_, data) => {
            const { idx, type_idx, title, sub_title, when, location, organizer, operate, support } = data
            if(!idx) {
                const create = await prisma.projects.create({
                    data: {
                        type_idx,
                        title,
                        sub_title,
                        when,
                        location,
                        organizer,
                        operate,
                        support
                    }
                })
                return {
                    status: 200,
                    data: create
                }
            }
            const project = await prisma.projects.update({
                where: {
                    idx
                },
                data: {
                    type_idx,
                    title,
                    sub_title,
                    when,
                    location,
                    organizer,
                    operate,
                    support
                }
            })

            return {
                status: 200,
                data: project
            }
        },
        preSignedQuery: async (_, data) => {
            const { idx } = data
            const exist = await prisma.projects.count({
                where: {
                    idx
                }
            })
            if(exist) {
                const fileIndexs = await generateSerial('project', 1)
                if(fileIndexs.length) {
                    const url = getPreSignedUrl(`project/${idx}/${fileIndexs[0]}`)
                    return {
                        status: 200,
                        data: url
                    }
                }
            }
            return {
                status: 200
            }
        }
    }
}

export default resolverMap