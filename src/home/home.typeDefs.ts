import { gql } from "apollo-server-core";

export default gql`
    scalar DateTime
    type HomeResponse implements SystemResponse {
        status: Int!
        data: HomeData
        token: String
        error: SystemError
    }

    type News {
        title: String!
        created_at: DateTime!
    }

    type HistoryTitle {
        title: String!
        histories: [History]
    }

    type History {
        content: String!
    }

    type HomeData {
        news: [News]
        histories: [HistoryTitle]

    }
    type Query {
        fetchHomeInfos: HomeResponse
    }
`