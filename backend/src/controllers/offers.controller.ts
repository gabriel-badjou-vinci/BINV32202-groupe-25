import { Router } from "express";
import { toOfferDto } from "../mappers/offer.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import type { OffersService } from "../services/offers.service.ts";
import { canListOffers } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseDate = (value: unknown, name: string): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new HttpError(400, "INVALID_QUERY", `Le paramètre ${name} doit être une date AAAA-MM-JJ`);
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, "INVALID_QUERY", `Le paramètre ${name} doit être une date valide`);
  }
  return value;
};

export const createOffersRouter = (offersService: OffersService) => {
  const router = Router();

  router.get("/", authorize(canListOffers), (req, res) => {
    const startDate = parseDate(req.query.startDate, "startDate");
    const endDate = parseDate(req.query.endDate, "endDate");
    if (startDate !== undefined && endDate !== undefined && startDate > endDate) {
      throw new HttpError(
        400,
        "INVALID_QUERY",
        "Le paramètre startDate doit être antérieur ou égal à endDate",
      );
    }

    res.json(
      offersService.listOffers(getCurrentUser(req), { startDate, endDate }).map(toOfferDto),
    );
  });

  return router;
};
