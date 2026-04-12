import { PrismaClient } from '@prisma/client'

function createPrismaClient() {
  return new PrismaClient().$extends({
    query: {
      project: {
        async findMany({ args, query }) {
          args.where = { deletedAt: null, ...args.where }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { deletedAt: null, ...args.where }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { deletedAt: null, ...args.where }
          return query(args)
        },
      },
    },
  })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
