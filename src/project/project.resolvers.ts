import prisma from '~/prisma';
import { generateSerial } from '~/utils';
import { getPreSignedUrl, s3DeleteFiles } from '~/utils/aws';
// import errorHandeler from '~/errorHandler';

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
                    console.log(image.list_order)
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
    }
}

export default resolverMap