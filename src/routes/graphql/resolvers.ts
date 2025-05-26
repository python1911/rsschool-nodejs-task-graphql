import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';
import { PrismaClient } from '@prisma/client';
import { createLoaders } from './loaders';

const prisma = new PrismaClient();
const loaders = createLoaders();

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    bio: { type: GraphQLString },
    userId: { type: GraphQLNonNull(GraphQLID) }
  })
});

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    balance: { type: GraphQLInt },
    profile: {
      type: ProfileType,
      resolve: (parent) => {
        return prisma.profile.findUnique({
          where: { userId: parent.id }
        });
      }
    },
    posts: {
      type: GraphQLList(PostType),
      resolve: (parent) => {
        return prisma.post.findMany({
          where: { authorId: parent.id }
        });
      }
    },
    subscribedTo: {
      type: GraphQLList(UserType),
      resolve: (parent) => {
        return loaders.userSubscribedToLoader.load(parent.id);
      }
    },
    subscribedBy: {
      type: GraphQLList(UserType),
      resolve: (parent) => {
        return loaders.subscribedToUserLoader.load(parent.id);
      }
    }
  })
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLNonNull(GraphQLID) },
    author: {
      type: UserType,
      resolve: (parent) => {
        return prisma.user.findUnique({
          where: { id: parent.authorId }
        });
      }
    }
  })
});

export const getUsers = {
  type: GraphQLList(UserType),
  resolve: () => prisma.user.findMany()
};

export const getUser = {
  type: UserType,
  args: {
    id: { type: GraphQLNonNull(GraphQLID) }
  },
  resolve: (_, args) => {
    return prisma.user.findUnique({ where: { id: args.id } });
  }
};
