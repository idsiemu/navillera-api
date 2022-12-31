import errorHandeler from '~/errorHandler';
import prisma from '~/prisma';

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
                        select: {
                            idx: true,
                            category_idx: true,
                            title: true,
                            content: true,
                            created_at: true
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
                select: {
                    idx: true,
                    category_idx: true,
                    title: true,
                    content: true,
                    created_at: true,
                    views: true
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
            const { idx, category_idx, title, content } = data
            if (idx < 0) {
                try {
                    const result = await prisma.news.create({
                        data: {
                            category_idx,
                            title,
                            content
                        },
                        select: {
                            idx: true,
                            category_idx: true,
                            title: true,
                            content: true,
                            created_at: true,
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
                const updated = await prisma.news.update({
                    where: {
                        idx
                    },
                    data: {
                        category_idx,
                        title,
                        content
                    },
                    select: {
                        idx: true,
                        category_idx: true,
                        title: true,
                        content: true,
                        created_at: true,
                    }
                })
                return {
                    status: 200,
                    data: updated
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