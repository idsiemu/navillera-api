
const resolverMap = {
    Query : {
        fetchHomeInfos: (_, data) => {
            return {
                status: 200,
            }
        }
    }
}

export default resolverMap