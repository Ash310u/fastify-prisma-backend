import { FastifyReply, FastifyRequest } from "fastify";
import { ReportStatus, UserRole } from "../../generated/prisma/client";
import { handlePrismaCrudError, parseNumericId, replyInvalidId } from "./crud.utils";

export type CreateUserBody = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  city: string;
  impactScore?: number;
};

export type UpdateUserBody = {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  city?: string;
  impactScore?: number;
};

export type CreateSessionBody = {
  email: string;
  passwordHash: string;
};

export async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply,
) {
  const { name, email, passwordHash, role, city, impactScore } = request.body;
  try {
    const user = await request.server.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        city,
        ...(impactScore !== undefined ? { impactScore } : {}),
      },
    });

    return reply.code(201).send(user);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function listUsersHandler(_request: FastifyRequest, reply: FastifyReply) {
  const users = await reply.server.prisma.user.findMany();
  return reply.send(users);
}

export async function getUserByIdHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const user = await request.server.prisma.user.findUnique({ where: { id } });

  if (!user) {
    return reply.code(404).send({ message: "User not found" });
  }

  return reply.send(user);
}

export async function updateUserHandler(
  request: FastifyRequest<{ Body: UpdateUserBody }>,
  reply: FastifyReply,
) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const data = request.body;

  try {
    const user = await request.server.prisma.user.update({
      where: { id },
      data,
    });

    return reply.send(user);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function deleteUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  try {
    await request.server.prisma.user.delete({ where: { id } });
    return reply.code(204).send();
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function createUserSessionHandler(
  request: FastifyRequest<{ Body: CreateSessionBody }>,
  reply: FastifyReply,
) {
  const { email, passwordHash } = request.body;

  const user = await request.server.prisma.user.findUnique({ where: { email } });

  if (!user || user.passwordHash !== passwordHash) {
    return reply.code(401).send({ message: "Invalid credentials" });
  }

  const token = request.server.jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },
    { expiresIn: "7d" },
  );

  return reply.send({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      impactScore: user.impactScore,
    },
  });
}

export async function getCurrentUserSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  const authUser = request.authUser;

  if (!authUser) {
    return reply.code(401).send({ message: "Unauthorized" });
  }

  const user = await request.server.prisma.user.findUnique({
    where: { id: authUser.userId },
  });

  if (!user) {
    return reply.code(404).send({ message: "User not found" });
  }

  return reply.send({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      impactScore: user.impactScore,
    },
  });
}

function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getAverageHours(values: Array<{ start: Date; end: Date | null }>): number {
  const resolved = values.filter((item) => item.end instanceof Date);

  if (resolved.length === 0) {
    return 0;
  }

  const totalMs = resolved.reduce((acc, item) => {
    return acc + (item.end!.getTime() - item.start.getTime());
  }, 0);

  const avgHours = totalMs / resolved.length / (1000 * 60 * 60);
  return Number(avgHours.toFixed(2));
}

export async function getUserRoleInsightsHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const user = await request.server.prisma.user.findUnique({ where: { id } });

  if (!user) {
    return reply.code(404).send({ message: "User not found" });
  }

  if (user.role !== UserRole.authority && user.role !== UserRole.org && user.role !== UserRole.admin) {
    return reply.code(403).send({
      message: "Insights are only available for authority, org, and admin users",
    });
  }

  const todayStart = getStartOfToday();
  const weekStart = getStartOfWeek();

  if (user.role === UserRole.authority) {
    const todayTotalReports = await request.server.prisma.assignment.count({
      where: {
        authorityId: user.id,
        report: {
          createdAt: {
            gte: todayStart,
          },
        },
      },
    });

    const unresolvedAssignments = await request.server.prisma.assignment.findMany({
      where: {
        authorityId: user.id,
        resolvedAt: null,
      },
      include: {
        report: {
          select: {
            id: true,
            addressText: true,
            description: true,
            category: true,
            severity: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
      take: 50,
    });

    const resolvedForAverage = await request.server.prisma.assignment.findMany({
      where: {
        authorityId: user.id,
        resolvedAt: {
          not: null,
        },
      },
      select: {
        assignedAt: true,
        resolvedAt: true,
      },
    });

    const resolvedThisWeek = await request.server.prisma.assignment.count({
      where: {
        authorityId: user.id,
        resolvedAt: {
          gte: weekStart,
        },
      },
    });

    return reply.send({
      userId: user.id,
      role: user.role,
      todayTotalReports,
      unresolvedReports: unresolvedAssignments.map((assignment) => assignment.report),
      avgTimeToResolveHours: getAverageHours(
        resolvedForAverage.map((assignment) => ({
          start: assignment.assignedAt,
          end: assignment.resolvedAt,
        })),
      ),
      resolvedThisWeek,
    });
  }

  const whereScope =
    user.role === UserRole.org
      ? {
          user: {
            city: user.city,
          },
        }
      : {};

  const todayTotalReports = await request.server.prisma.report.count({
    where: {
      ...whereScope,
      createdAt: {
        gte: todayStart,
      },
    },
  });

  const unresolvedReports = await request.server.prisma.report.findMany({
    where: {
      ...whereScope,
      status: {
        not: ReportStatus.resolved,
      },
    },
    select: {
      id: true,
      userId: true,
      addressText: true,
      description: true,
      category: true,
      severity: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  const resolvedForAverage = await request.server.prisma.report.findMany({
    where: {
      ...whereScope,
      resolvedAt: {
        not: null,
      },
    },
    select: {
      createdAt: true,
      resolvedAt: true,
    },
  });

  const resolvedThisWeek = await request.server.prisma.report.count({
    where: {
      ...whereScope,
      resolvedAt: {
        gte: weekStart,
      },
    },
  });

  return reply.send({
    userId: user.id,
    role: user.role,
    cityScope: user.role === UserRole.org ? user.city : "all",
    todayTotalReports,
    unresolvedReports,
    avgTimeToResolveHours: getAverageHours(
      resolvedForAverage.map((report) => ({
        start: report.createdAt,
        end: report.resolvedAt,
      })),
    ),
    resolvedThisWeek,
  });
}