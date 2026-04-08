import { FastifyReply, FastifyRequest } from "fastify";
import { ReportStatus } from "../../generated/prisma/client";
import { handlePrismaCrudError, parseNumericId, replyInvalidId } from "./crud.utils";

type CreateReportBody = {
  userId: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
  addressText: string;
  garbageType: string;
  severity: string;
  status?: ReportStatus;
  aiConfidenceScore: number;
  resolvedAt?: string;
};

type UpdateReportBody = {
  userId?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  garbageType?: string;
  severity?: string;
  status?: ReportStatus;
  aiConfidenceScore?: number;
  resolvedAt?: string | null;
};

export async function createReportHandler(
  request: FastifyRequest<{ Body: CreateReportBody }>,
  reply: FastifyReply,
) {
  const {
    userId,
    imageUrl,
    latitude,
    longitude,
    addressText,
    garbageType,
    severity,
    status,
    aiConfidenceScore,
    resolvedAt,
  } = request.body;

  const statusValue = status ?? null;
  const resolvedAtValue = resolvedAt ? new Date(resolvedAt) : null;

  try {
    const inserted = await request.server.prisma.$queryRaw<{ id: number }[]>`
      INSERT INTO reports (
        user_id,
        image_url,
        location,
        address_text,
        garbage_type,
        severity,
        status,
        ai_confidence_score,
        resolved_at
      )
      VALUES (
        ${userId},
        ${imageUrl},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${addressText},
        ${garbageType},
        ${severity},
        COALESCE(${statusValue}::"ReportStatus", 'pending'::"ReportStatus"),
        ${aiConfidenceScore},
        ${resolvedAtValue}
      )
      RETURNING id
    `;

    const createdId = inserted[0]?.id;

    if (!createdId) {
      return reply.code(500).send({ message: "Failed to create report" });
    }

    const report = await request.server.prisma.report.findUnique({ where: { id: createdId } });

    if (!report) {
      return reply.code(500).send({ message: "Failed to load created report" });
    }

    return reply.code(201).send(report);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function listReportsHandler(_request: FastifyRequest, reply: FastifyReply) {
  const reports = await reply.server.prisma.report.findMany();
  return reply.send(reports);
}

export async function getReportByIdHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const report = await request.server.prisma.report.findUnique({ where: { id } });

  if (!report) {
    return reply.code(404).send({ message: "Report not found" });
  }

  return reply.send(report);
}

export async function updateReportHandler(
  request: FastifyRequest<{ Body: UpdateReportBody }>,
  reply: FastifyReply,
) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const {
    userId,
    imageUrl,
    latitude,
    longitude,
    addressText,
    garbageType,
    severity,
    status,
    aiConfidenceScore,
    resolvedAt,
  } = request.body;

  const userIdValue = userId ?? null;
  const imageUrlValue = imageUrl ?? null;
  const latitudeValue = latitude ?? null;
  const longitudeValue = longitude ?? null;
  const addressTextValue = addressText ?? null;
  const garbageTypeValue = garbageType ?? null;
  const severityValue = severity ?? null;
  const statusValue = status ?? null;
  const aiConfidenceScoreValue = aiConfidenceScore ?? null;
  const resolvedAtDateValue = typeof resolvedAt === "string" ? new Date(resolvedAt) : null;
  const clearResolvedAt = resolvedAt === null;
  const hasResolvedAtUpdate = typeof resolvedAt === "string" || resolvedAt === null;

  try {
    const updated = await request.server.prisma.$queryRaw<{ id: number }[]>`
      UPDATE reports
      SET
        user_id = COALESCE(${userIdValue}, user_id),
        image_url = COALESCE(${imageUrlValue}, image_url),
        location = CASE
          WHEN ${latitudeValue} IS NOT NULL AND ${longitudeValue} IS NOT NULL
            THEN ST_SetSRID(ST_MakePoint(${longitudeValue}, ${latitudeValue}), 4326)::geography
          ELSE location
        END,
        address_text = COALESCE(${addressTextValue}, address_text),
        garbage_type = COALESCE(${garbageTypeValue}, garbage_type),
        severity = COALESCE(${severityValue}, severity),
        status = COALESCE(${statusValue}::"ReportStatus", status),
        ai_confidence_score = COALESCE(${aiConfidenceScoreValue}, ai_confidence_score),
        resolved_at = CASE
          WHEN ${hasResolvedAtUpdate} = FALSE THEN resolved_at
          WHEN ${clearResolvedAt} = TRUE THEN NULL
          ELSE ${resolvedAtDateValue}
        END
      WHERE id = ${id}
      RETURNING id
    `;

    const updatedId = updated[0]?.id;

    if (!updatedId) {
      return reply.code(404).send({ message: "Report not found" });
    }

    const report = await request.server.prisma.report.findUnique({ where: { id: updatedId } });

    if (!report) {
      return reply.code(500).send({ message: "Failed to load updated report" });
    }

    return reply.send(report);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function deleteReportHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  try {
    const deletedRows = await request.server.prisma.$executeRaw`
      DELETE FROM reports
      WHERE id = ${id}
    `;

    if (deletedRows === 0) {
      return reply.code(404).send({ message: "Report not found" });
    }

    return reply.code(204).send();
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}