import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql, GraphQLSchema } from 'graphql';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { rootQuery, rootMutation } from './resolvers.ts';
import { createLoaders } from './loaders.ts';
import type { Loaders } from './loaders.ts';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const schema = new GraphQLSchema({
    query: rootQuery,
    mutation: rootMutation,
  });

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const loaders: Loaders = createLoaders(fastify.prisma);

      return graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: {
          prisma: fastify.prisma,
          loaders,
        },
      });
    },
  });
};

export default plugin;
