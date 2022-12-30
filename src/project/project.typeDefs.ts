import { gql } from "apollo-server-core";

export default gql`
    type ProjectDeatilResponse implements SystemResponse {
        status: Int!
        data: ProjectDetail
        token: String
        error: SystemError
    }

    type ProjectResponse implements SystemResponse {
        status: Int!
        data: ProjectData
        token: String
        error: SystemError
    }

    type PreSignedResponse implements SystemResponse {
        status: Int!
        data: [PreSignedData]
        token: String
        error: SystemError
    }

    type ProjectImageResponse implements SystemResponse {
        status: Int!
        data: [ProjectImage]
        token: String
        error: SystemError
    }

    type PreSignedData {
        url: String!
        key: String!
        list_order: Int!
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
        images: [PImageInput]
    }

    input PImageInput {
        idx: Int
        key: String!
        list_order: Int!
    }

    input ExtInput {
        ext: String!
        list_order: Int!
    }

    type ProjectImage {
        idx: Int!
        bucket: String!
        key: String!
        list_order: Int!
    }

    type Query {
        fetchProjectDetail(idx: Int): ProjectDeatilResponse
        preSignedQuery(exts: [ExtInput]): PreSignedResponse
    }

    type Mutation {
        modifiyProject(project: ProjectInput!): ProjectResponse
        projectImageUpload(project_idx: Int!, key: [String]!): ProjectImageResponse
    }
`