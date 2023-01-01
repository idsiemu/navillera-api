import errorHandeler from '~/errorHandler';
import prisma from '~/prisma';
import { s3DeleteFiles } from '~/utils/aws';

const resolverMap = {
    Query: {
        fetchNewsDetail: async (_, data) => {
            const { idx } = data
            try {
                const categories = await prisma.news_category.findMany({
                    select: {
                        idx: true,
                        title: true
                    }
                })
                if (idx) {
                    const news = await prisma.news.findFirst({
                        where: {
                            idx,
                            deleted_at: null
                        },
                        include: {
                            images: {
                                orderBy: {
                                    list_order: 'asc'
                                },
                                select: {
                                    idx: true,
                                    key: true,
                                    list_order: true
                                }
                            }
                        }
                    })
                    if (news) {
                        return {
                            status: 200,
                            data: {
                                categories,
                                news
                            }
                        }
                    }
                }

                return {
                    status: 200,
                    data: {
                        categories,
                    }
                }
            } catch (e) {
                return {
                    status: 500
                }
            }

        },
        fetchNews: async (_, data) => {
            const { keyword, page } = data
            let totalCount = 0
            if (!page) {
                totalCount = await prisma.news.count({
                    where: keyword ? {
                        deleted_at: null,
                        OR: [
                            {
                                title: {
                                    contains: keyword
                                },
                            },
                            {
                                content: {
                                    contains: keyword
                                }
                            }
                        ]
                    } : {
                        deleted_at: null
                    }
                })

                totalCount = Math.ceil(totalCount / 10)
            }

            const list = await prisma.news.findMany({
                where: keyword ? {
                    deleted_at: null,
                    OR: [
                        {
                            title: {
                                contains: keyword
                            },
                        },
                        {
                            content: {
                                contains: keyword
                            }
                        }
                    ]
                } : {
                    deleted_at: null
                },
                take: 10,
                skip: 10 * (page ? page : 0),
                include: {
                    category: {
                        select: {
                            title: true
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
                    list: list.map(item => {
                        return {
                            idx: item.idx,
                            category: item.category.title,
                            title: item.title,
                            views: item.views,
                            created_at: item.created_at
                        }
                    }),
                    total_count: totalCount
                }
            }
        },
        fetchNewsDetailInView: async (_, data) => {
            const { idx } = data
            const news = await prisma.news.findUnique({
                where: {
                    idx
                },
                include: {
                    images: {
                        orderBy: {
                            list_order: 'asc',
                        },
                        select: {
                            idx: true,
                            key: true,
                            list_order: true
                        }
                    }
                }
            })

            await prisma.news.update({
                where: {
                    idx
                },
                data: {
                    views: news.views + 1
                }
            })
            return {
                status: 200,
                data: news

            }
        }
    },
    Mutation: {
        modifiyNews: async (_, data) => {
            const { news: { idx, category_idx, title, content, images}} = data
            if (idx < 0 || !idx) {
                try {
                    const result = await prisma.news.create({
                        data: {
                            category_idx,
                            title,
                            content,
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
                        },
                        include: {
                            images: {
                                orderBy: {
                                    list_order: 'asc'
                                },
                                select: {
                                    idx: true,
                                    key: true,
                                    list_order: true
                                }
                            }
                        }
                    })
                    return {
                        status: 200,
                        data: result
                    }
                } catch (e) {
                    return {
                        status: 500
                    }
                }

            }
            const news = await prisma.news.count({
                where: {
                    idx
                }
            })
            if (news) {
                const beforeImages = await prisma.news_images.findMany({
                    where: {
                        news_idx: idx
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
                        return prisma.news_images.deleteMany({
                            where: {
                                key: will.Key
                            }
                        })
                    }),
                    ...images.filter(img => !img.idx).map(image => {
                        return prisma.news_images.create({
                            data: {
                                news_idx: idx,
                                bucket: process.env.AWS_S3_BUCKET,
                                key: image.key,
                                list_order: image.list_order
                            }
                        })
                    }),
                    ...willUpdateImages.map(img => {
                        return prisma.news_images.update({
                            where: {
                                idx: img.idx
                            },
                            data: {
                                list_order: img.list_order
                            }
                        })
                    }),
                    prisma.news.update({
                        where: {
                            idx
                        },
                        data: {
                            category_idx,
                            title,
                            content
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
                    data: trans[trans.length - 1]
                }
            }
            return {
                status: 500
            }
        },
        deleteNews: async (_, data) => {
            const { idx } = data
            try{
                await prisma.news.update({
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