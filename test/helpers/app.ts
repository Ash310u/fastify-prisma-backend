import Fastify from "fastify";
import type { PrismaClient } from "../../generated/prisma/client";
import routes from "../../src/routes";

type AsyncMock<TArgs extends unknown[] = unknown[], TResult = unknown> = ((
  ...args: TArgs
) => Promise<TResult>) & {
  calls: TArgs[];
  mockImplementation: (implementation: (...args: TArgs) => TResult | Promise<TResult>) => void;
  mockResolvedValue: (value: TResult) => void;
  reset: () => void;
};

type ModelDelegate = {
  create: AsyncMock<[unknown], unknown>;
  findMany: AsyncMock<[], unknown[]>;
  findUnique: AsyncMock<[unknown], unknown | null>;
  update: AsyncMock<[unknown], unknown>;
  delete: AsyncMock<[unknown], unknown>;
};

export type MockPrisma = {
  user: ModelDelegate;
  report: ModelDelegate;
  assignment: ModelDelegate;
  campaign: ModelDelegate;
  campaignJoin: ModelDelegate;
  $queryRaw: AsyncMock<unknown[], unknown>;
  $executeRaw: AsyncMock<unknown[], number>;
  $disconnect: AsyncMock<[], void>;
};

function createAsyncMock<TArgs extends unknown[], TResult>(
  initialResult: TResult,
): AsyncMock<TArgs, TResult> {
  let implementation = async () => initialResult;
  const calls: TArgs[] = [];

  const mock = (async (...args: TArgs) => {
    calls.push(args);
    return implementation(...args);
  }) as AsyncMock<TArgs, TResult>;

  mock.calls = calls;
  mock.mockImplementation = (nextImplementation) => {
    implementation = async (...args: TArgs) => nextImplementation(...args);
  };
  mock.mockResolvedValue = (value) => {
    implementation = async () => value;
  };
  mock.reset = () => {
    calls.length = 0;
    implementation = async () => initialResult;
  };

  return mock;
}

function createModelDelegate(): ModelDelegate {
  return {
    create: createAsyncMock({}),
    findMany: createAsyncMock([]),
    findUnique: createAsyncMock(null),
    update: createAsyncMock({}),
    delete: createAsyncMock({}),
  };
}

export function createMockPrisma(): MockPrisma {
  return {
    user: createModelDelegate(),
    report: createModelDelegate(),
    assignment: createModelDelegate(),
    campaign: createModelDelegate(),
    campaignJoin: createModelDelegate(),
    $queryRaw: createAsyncMock([]),
    $executeRaw: createAsyncMock(1),
    $disconnect: createAsyncMock(undefined),
  };
}

export async function buildTestApp() {
  const prisma = createMockPrisma();
  const app = Fastify({ logger: false });

  app.decorate("prisma", prisma as unknown as PrismaClient);
  await app.register(routes);
  await app.ready();

  return { app, prisma };
}
