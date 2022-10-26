import { gql } from "apollo-server-core";

export default gql`
    type HomeResponse implements SystemResponse {
        status: Int!
        token: String
        error: SystemError
    }

    type Query {
        fetchHomeInfos: HomeResponse
    }
`