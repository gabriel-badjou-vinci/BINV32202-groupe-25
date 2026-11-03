import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { HttpError } from "../utils/httpError.ts";

const MAX_MESSAGE_LENGTH = 1000;

const parsePositiveInteger = (value: string, name: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, "INVALID_QUERY", `Le paramètre ${name} doit être un entier positif`);
  }
  return parsed;
};

const parseMessage = (body: unknown): string => {
  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { message?: unknown }).message !== "string"
  ) {
    throw new HttpError(400, "INVALID_BODY", "Le message est obligatoire");
  }
  const message = (body as { message: string }).message.trim();
  if (message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    throw new HttpError(
      400,
      "INVALID_BODY",
      `Le message doit contenir entre 1 et ${MAX_MESSAGE_LENGTH} caractères`,
    );
  }
  return message;
};

export const createApplicationsRouter = (service: ApplicationsService) => {
  const router = Router();

  router.post("/:offerId/applications", (req, res) => {
    const application = service.apply(
      getCurrentUser(req),
      parsePositiveInteger(req.params.offerId, "offerId"),
      parseMessage(req.body),
    );
    res.status(201).json(toApplicationDto(application));
  });

  router.post("/:applicationId/withdraw", (req, res) => {
    const application = service.withdraw(
      getCurrentUser(req),
      parsePositiveInteger(req.params.applicationId, "applicationId"),
    );
    res.json(toApplicationDto(application));
  });

  return router;
};
