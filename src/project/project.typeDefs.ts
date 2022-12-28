import { gql } from "apollo-server-core";

export default gql`
    type ProjectDeatilResponse implements SystemResponse {
        status: Int!
        data: ProjectDetail
        token: String
        error: SystemError
    }

    type PreSignedResponse implements SystemResponse {
        status: Int!
        data: String
        token: String
        error: SystemError
    }

    type ProjectDetail {
        types: [ProjectType]
        project: ProjectData
    }

    type ProjectType {
        idx: Int!
        name: String!
    }

    type ProjectData {
        idx: Int!
        type_idx: Int!
        title: String!
        sub_title: String!
        when: String!
        location: String!
        organizer: String!
        operate: String
        support: String
        images: [ProjectImage]
    }

    input ProjectInput {
        idx: Int
        type_idx: Int!
        title: String!
        sub_title: String!
        when: String!
        location: String!
        organizer: String!
        operate: String
        support: String
    }

    type ProjectImage {
        idx: Int!
        bucket: String!
        key: String!
        list_order: Int!
    }

    type Query {
        fetchProjectDetail(idx: Int): ProjectDeatilResponse
    }

    type Mutation {
        modifiyProject1(project: ProjectInput!): ProjectDeatilResponse
        preSignedQuery(idx: Int!): PreSignedResponse
    }
`