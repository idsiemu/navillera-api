import { gql } from "apollo-server-core";

export default gql`
    type NewsDeatilResponse implements SystemResponse {
        status: Int!
        data: NewsDetailInit
        token: String
        error: SystemError
    }

    type NewsDeatilInViewResponse implements SystemResponse {
        status: Int!
        data: NewsData
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
        images: [NewsImage]
    }

    type NewsImage {
        idx: Int
        key: String!
        list_order: Int!
    }

    input NewsInput {
        idx: Int
        category_idx: Int!
        title: String!
        content: String!
        images: [NewsImageInput]
    }

    input NewsImageInput {
        idx: Int
        key: String!
        list_order: Int!
    }

    type Query {
        fetchNewsDetail(idx: Int): NewsDeatilResponse
        fetchNewsDetailInView(idx: Int!): NewsDeatilInViewResponse
        fetchNews(keyword: String, page: Int): NewsResponse
    }

    type Mutation {
        modifiyNews(news: NewsInput!): NewsModifyResponse
        deleteNews(idx: Int!): NewsModifyResponse
    }
`