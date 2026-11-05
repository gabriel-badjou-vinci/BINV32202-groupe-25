import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { APPLICATION, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const apply = (studentId: number, offerId: number, message?: string) =>
  request(app)
    .post(`/offers/${offerId}/applications`)
    .set("Authorization", tokenFor("STUDENT", studentId))
    .send(message === undefined ? {} : { message });

describe("POST /offers/:offerId/applications", () => {
  it("crée une candidature avec un message obligatoire", async () => {
    const response = await apply(STUDENT.LUCAS_DUPONT, OFFER.INTERNAL_CHATBOT, "  Mon message  ");

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.INTERNAL_CHATBOT,
      studentId: STUDENT.LUCAS_DUPONT,
      message: "Mon message",
      status: "IN_PROGRESS",
    });
  });

  it.each([undefined, "", "   "])("accepte un message absent ou vide (%s)", async (message) => {
    const response = await apply(STUDENT.LUCAS_DUPONT, OFFER.INTERNAL_CHATBOT, message);

    expect(response.status).toBe(201);
    expect(response.body.message).toBeNull();
  });

  it("refuse un message trop long", async () => {
    const response = await apply(STUDENT.LUCAS_DUPONT, OFFER.INTERNAL_CHATBOT, "x".repeat(1001));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });

  it("refuse une offre non publiée", async () => {
    const response = await apply(STUDENT.LUCAS_DUPONT, OFFER.CLOUD_MIGRATION, "Message");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("OFFER_NOT_ELIGIBLE");
  });

  it("refuse une candidature active en doublon", async () => {
    const response = await apply(STUDENT.LUCAS_DUPONT, OFFER.FLEET_APP, "Nouveau message");

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_EXISTS");
  });

  it("autorise une nouvelle candidature après retrait", async () => {
    const first = await apply(STUDENT.INES_HADDAD, OFFER.BILLING_API, "Nouvelle candidature");
    expect(first.status).toBe(201);

    const withdrawn = await request(app)
      .post(`/applications/${first.body.id}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.INES_HADDAD));
    expect(withdrawn.status).toBe(200);
    expect(withdrawn.body.status).toBe("WITHDRAWN");

    const second = await apply(STUDENT.INES_HADDAD, OFFER.BILLING_API, "Seconde candidature");
    expect(second.status).toBe(201);
    expect(second.body.id).not.toBe(first.body.id);
  });
});

describe("POST /applications/:applicationId/withdraw", () => {
  it("retire sa candidature en cours", async () => {
    const response = await request(app)
      .post(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("WITHDRAWN");
  });

  it("refuse le retrait de la candidature d'un autre étudiant", async () => {
    const response = await request(app)
      .post(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.INES_HADDAD));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("APPLICATION_NOT_FOUND");
  });

  it("refuse le retrait d'une candidature déjà traitée", async () => {
    const response = await request(app)
      .post(`/applications/${APPLICATION.MATEUSZ_CLOUD_MIGRATION}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_NOT_WITHDRAWABLE");
  });
});

describe("GET /applications", () => {
  it("retourne uniquement les candidatures de l'étudiant", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({
        id: APPLICATION.MATEUSZ_CLOUD_MIGRATION,
        offerId: OFFER.CLOUD_MIGRATION,
        studentId: STUDENT.MATEUSZ_KOWALSKI,
        offerTitle: "Migration d'une application vers le cloud",
        companyShortName: "Datavia",
        academicYear: "2026-2027",
        period: "P2",
        status: "SELECTED",
      }),
    ]);
  });

  it.each([
    ["ADMIN", 1],
    ["CONTACT", 4],
  ] as const)("refuse la consultation au profil %s", async (kind, id) => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor(kind, id));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("retourne une liste vide pour un étudiant sans candidature", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.IOANA_POPESCU));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
