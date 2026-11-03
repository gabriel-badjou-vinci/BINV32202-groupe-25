import { toApplication } from "../mappers/application.mapper.ts";
import type { Application } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

interface OffersLookup {
  findStatus: (offerId: number) => string | undefined;
}

export const createApplicationsService = (
  repository: ApplicationsRepository,
  offers: OffersLookup,
) => ({
  apply: (viewer: User, offerId: number, message: string): Application => {
    if (!isStudent(viewer)) {
      throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut candidater");
    }
    if (offers.findStatus(offerId) !== "PUBLISHED") {
      throw new HttpError(400, "OFFER_NOT_ELIGIBLE", "L'offre n'est pas publiée");
    }
    if (repository.findActive(offerId, viewer.id)) {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà une candidature en cours");
    }
    return toApplication(repository.insert(offerId, viewer.id, message));
  },

  withdraw: (viewer: User, applicationId: number): Application => {
    if (!isStudent(viewer)) {
      throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut retirer une candidature");
    }
    const application = repository.findById(applicationId);
    if (!application || application.student_id !== viewer.id) {
      throw new HttpError(404, "APPLICATION_NOT_FOUND", "Candidature introuvable");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(409, "APPLICATION_NOT_WITHDRAWABLE", "Cette candidature ne peut plus être retirée");
    }
    const withdrawn = repository.withdraw(applicationId);
    if (!withdrawn) {
      throw new HttpError(409, "APPLICATION_NOT_WITHDRAWABLE", "Cette candidature ne peut plus être retirée");
    }
    return toApplication(withdrawn);
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
