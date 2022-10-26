import 'module-alias/register';
import * as dotenv from 'dotenv'
import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import {typeDefs, resolvers} from './schema'
import { GraphQLUpload, graphqlUploadExpress } from 'graphql-upload';
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createServer } from 'http';
import * as momentTimezone from 'moment-timezone';
momentTimezone.tz.setDefault("Asia/Seoul")

dotenv.config()
const PORT = process.env.PORT

const app = express()
app.use(graphqlUploadExpress())

const httpServer = createServer(app);

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        ...resolvers,
        Upload: GraphQLUpload
    },
});

const server = new ApolloServer({
    debug: false,
    schema,
    context: context => {
        return context
    }
})

export const moment = momentTimezone;

server.start().then(() => {
    server.applyMiddleware({app, path: '/'})
});

httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
);
