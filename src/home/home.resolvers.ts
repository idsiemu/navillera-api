import prisma from '~/prisma';

const resolverMap = {
    Query: {
        fetchHomeInfos: async (_, data) => {
            const news = await prisma.news.findMany({
                where: {
                    deleted_at: null
                },
                orderBy: {
                    idx: 'desc'
                },
                select: {
                    title: true,
                    created_at: true
                }
            })
            const histories = await prisma.history_title.findMany({
                include: {
                    histories: {
                        select: {
                            content: true
                        },
                        orderBy: {
                            list_order: 'asc'
                        }
                    }
                },
                orderBy: {
                    list_order: 'asc'
                }
            })

            return {
                status: 200,
                data: {
                    news,
                    histories
                }
            }
        }
    }
}

export default resolverMap