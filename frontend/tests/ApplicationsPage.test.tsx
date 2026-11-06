import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 1,
    offerId: 6,
    studentId: 3,
    offerTitle: "Migration d'une application vers le cloud",
    companyShortName: "Datavia",
    academicYear: "2026-2027",
    period: "P2",
    message: "Mon expérience Docker",
    status: "SELECTED",
    appliedAt: "2026-09-22 12:00:00",
  },
  {
    id: 2,
    offerId: 3,
    studentId: 3,
    offerTitle: "API REST de facturation",
    companyShortName: "Orbis",
    academicYear: "2026-2027",
    period: "P2",
    message: null,
    status: "IN_PROGRESS",
    appliedAt: "2026-10-04 14:50:00",
  },
  {
    id: 3,
    offerId: 1,
    studentId: 3,
    offerTitle: "Application React de gestion de flotte",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    message: null,
    status: "REJECTED",
    appliedAt: "2026-10-05 14:50:00",
  },
  {
    id: 4,
    offerId: 3,
    studentId: 3,
    offerTitle: "API REST de facturation",
    companyShortName: "Orbis",
    academicYear: "2026-2027",
    period: "P2",
    message: null,
    status: "WITHDRAWN",
    appliedAt: "2026-09-30 10:30:00",
  },
] as const;

describe("ApplicationsPage", () => {
  it("affiche les candidatures et les quatre statuts en français", async () => {
    stubFetch({ "/api/applications": () => Response.json(applications) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Migration d'une application vers le cloud")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Retenue")).toBeInTheDocument();
    expect(screen.getByText("Non retenue")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
    expect(screen.getAllByText("Aucun message")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Retirer" })).toBeInTheDocument();
  });

  it("affiche l'état vide", async () => {
    stubFetch({ "/api/applications": () => Response.json([]) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Vous n'avez aucune candidature.")).toBeInTheDocument();
  });

  it("retire une candidature en cours puis recharge la liste", async () => {
    const fetchMock = stubFetch({
      "/api/applications/2/withdraw": () => Response.json({ ...applications[1], status: "WITHDRAWN" }),
      "/api/applications": () => Response.json(applications),
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Mes candidatures");

    fireEvent.click(screen.getByRole("button", { name: "Retirer" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/applications/2/withdraw",
      expect.objectContaining({ method: "POST", headers: { Authorization: "jeton" } }),
    ));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });

  it("redirige vers la connexion quand la liste renvoie 401", async () => {
    const onUnauthorized = vi.fn();
    stubFetch({ "/api/applications": () => new Response(null, { status: 401 }) });

    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
