import { gql } from "apollo-server-core";


export default  gql`
  scalar Upload

  type SystemError {
    remark: String!
    code: String!
    text: String!
  }

  interface SystemResponse {
    status: Int!
    error: SystemError
  }
`