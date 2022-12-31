import errorHandeler from '~/errorHandler';
import prisma from '~/prisma';
import { generateSerial } from '~/utils';
import { getPreSignedUrl, s3DeleteFiles } from '~/utils/aws';
// import errorHandeler from '~/errorHandler';

const resolverMap = {
    Query: {
        fetchAllProjects: async (_, data) => {
            const types = await prisma.project_types.findMany()
            try{
                const projects = await prisma.projects.findMany({
                    where: {
                        deleted_at: null,
                        AND: [
                            {
                                images: {
                                    some: {
                                        list_order: 0
                                    }
                                },
                            },
                            {
                                images: {
                                    some: {
                                        list_order: 1
                                    }
                                }
                            }
                        ],
                    },
                    orderBy: {
                        type_idx: "asc"
                    },
                    include: {
                        images: true
                    }
                })
                return {
                    status: 200,
                    data: {
                        types,
                        projects
                    }
                }
            }catch(e) {
                return {
                    status: 500
                }
            }
            
        },
        fetchProjectDetail: async (_, data) => {
            const { idx } = data
            const types  = await prisma.project_types.findMany()
            if(idx) {
                const project = await prisma.projects.findFirst({
                    where: {
                        idx,
                        deleted_at: null
                    },
                    include: {
                        images: {
                            orderBy: {
                                list_order: 'asc'
                            }
                        }
                    }
                })

                if(project) {
                    return {
                        status: 200,
                        data: {
                            types,
                            project
                        }
                    }
                }
                
                return errorHandeler('500-004')
            }
            return {
                status: 200,
                data: {
                    types,
                }
            }
        },
        preSignedQuery: async (_, data) => {
            const { exts } = data
            const fileIndexs = await generateSerial('project_image', exts.map(ext => ext.ext))

            return {
                status: 200,
                data: fileIndexs.map((fileName, index) => {
                    const key = `project/${fileName}`
                    const url = getPreSignedUrl(key)
                    return {
                        url,
                        key: key,
                        list_order: exts[index].list_order
                    }
                })
            }
        },
        fetchProjects: async (_, data) => {
            const { page } = data
            let totalCount = 0
            if (!page) {
                totalCount = await prisma.projects.count({
                    where: {
                        deleted_at: null
                    }
                })

                totalCount = Math.ceil(totalCount / 10)
            }

            const list = await prisma.projects.findMany({
                where: {
                    deleted_at: null
                },
                take: 10,
                skip: 10 * (page ? page : 0),
                include: {
                    type: {
                        select: {
                            idx: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    idx: 'desc'
                }
            })

            return {
                status: 200,
                data: {
                    list: list,
                    total_count: totalCount
                }
            }
        }
    },
    Mutation: {
        modifiyProject: async (_, data) => {
            const { project: { idx, type_idx, title, sub_title, when, location, organizer, operate, support, images } } = data
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
                        support,
                        images: {
                            createMany: {
                                data: images.map(img => {
                                    return {
                                        ...img,
                                        bucket: process.env.AWS_S3_BUCKET,
                                    }
                                })
                            }
                        }
                    }
                })
                return {
                    status: 200,
                    data: create
                }
            }
            const beforeImages = await prisma.project_images.findMany({
                where: {
                    project_idx: idx
                }
            })
            const wiilDeleteImages = []
            const willUpdateImages = []
            beforeImages.forEach(be => {
                let exist = null
                images.some(img => {
                    if(be.key === img.key) {
                        exist = img
                        return true
                    }
                    return false
                })
                if(exist) {
                    willUpdateImages.push(exist)
                } else {
                    wiilDeleteImages.push({
                        Key: be.key
                    })
                }
            })

            const trans = await prisma.$transaction([
                ...wiilDeleteImages.map(will => {
                    return prisma.project_images.deleteMany({
                        where: {
                            key: will.Key
                        }
                    })
                }),
                ...images.filter(img => !img.idx).map(image => {
                    return prisma.project_images.create({
                        data: {
                            project_idx: idx,
                            bucket: process.env.AWS_S3_BUCKET,
                            key: image.key,
                            list_order: image.list_order
                        }
                    })
                }),
                ...willUpdateImages.map(img => {
                    return prisma.project_images.update({
                        where: {
                            idx: img.idx
                        },
                        data: {
                            list_order: img.list_order
                        }
                    })
                }),
                prisma.projects.update({
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
                        support,
                    },
                    include: {
                        images: {
                            orderBy: {
                                list_order: 'asc'
                            }
                        }
                    }
                }),
            ])
            
            
            s3DeleteFiles(wiilDeleteImages)

            return {
                status: 200,
                data: trans[0]
            }
        },
        deleteProject: async (_, data) => {
            const { idx } = data
            try{
                await prisma.projects.update({
                    where: {
                        idx
                    },
                    data: {
                        deleted_at: new Date()
                    }
                })
                return {
                    status: 200
                }
            }catch(e) {
                return errorHandeler('500-001')
            }
        }
    }
}

export default resolverMap