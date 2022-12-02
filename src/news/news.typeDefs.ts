import { gql } from "apollo-server-core";

export default gql`
    type NewsDeatilResponse implements SystemResponse {
        status: Int!
        data: NewsDetailInit
        token: String
        error: SystemError
    }

    type NewsModifyResponse implements SystemResponse {
        status: Int!
        data: NewsData
        token: String
        error: SystemError
    }

    type NewsResponse implements SystemResponse {
        status: Int!
        data: NewsObject
        token: String
        error: SystemError
    }

    type NewsObject {
        list: [NewsDataByList]
        total_count: Int!
    }

    type NewCategory {
        idx: Int!
        title: String!
    }

    type NewsDetailInit {
        categories: [NewCategory]
        news: NewsData
    }

    type NewsDataByList {
        idx: Int!
        category: String!
        title: String!
        views: Int!
        created_at: DateTime!
    }

    type NewsData {
        idx: Int!
        category_idx: Int!
        title: String!
        content: String!
        created_at: DateTime!
    }

    type Query {
        fetchNewsDetail(idx: Int): NewsDeatilResponse
        fetchNews(keyword: String, page: Int): NewsResponse
    }

    type Mutation {
        modifiyNews(idx: Int, category_idx: Int! title: String!, content: String!): NewsModifyResponse
    }
`