import { expect, test, type Locator, type Page } from "@playwright/test";

const APP_URL = "/";

const loginAs = async (page: Page, groupName: string, userName: string) => {
  await page.goto(APP_URL);
  await expect(
    page.getByRole("heading", { level: 1, name: "Connexion de démonstration" }),
  ).toBeVisible();

  const group = page
    .getByRole("heading", { level: 2, name: groupName })
    .locator("..");

  await group.getByRole("button", { name: userName, exact: true }).click();
};

const openOffers = async (page: Page) => {
  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Offres", exact: true })
    .click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Offres de stage" }),
  ).toBeVisible();
};

const offerRow = (page: Page, title: string): Locator =>
  page.getByRole("row").filter({ has: page.getByRole("cell", { name: title, exact: true }) });

test("Scénario 1 - un étudiant consulte uniquement les offres publiées", async ({ page }) => {
  await loginAs(page, "Étudiants", "Lucas Dupont");
  await openOffers(page);

  await expect(page.getByText("Les offres publiées.", { exact: true })).toBeVisible();
  await expect(page.getByText("4 offres", { exact: true })).toBeVisible();

  const publishedOffers = [
    { title: "Application React de gestion de flotte", company: "Lumen Digital" },
    { title: "API REST de facturation", company: "Orbis" },
    { title: "Tableau de bord de qualité des données", company: "Lumen Data" },
    { title: "Assistant conversationnel interne", company: "Nexalis" },
  ];

  const table = page.getByRole("table");
  await expect(table.getByRole("row")).toHaveCount(publishedOffers.length + 1);

  for (const offer of publishedOffers) {
    const row = offerRow(page, offer.title);
    await expect(row).toBeVisible();
    await expect(row.getByRole("cell", { name: offer.company, exact: true })).toBeVisible();
    await expect(row.getByRole("cell", { name: "2026-2027", exact: true })).toBeVisible();
    await expect(row.getByRole("cell", { name: "P2", exact: true })).toBeVisible();
    await expect(row.getByRole("cell", { name: "Publiée", exact: true })).toBeVisible();
    await expect(row.getByRole("button", { name: "Candidater", exact: true })).toBeVisible();
  }

  for (const hiddenTitle of [
    "Refonte du portail client",
    "Automatisation des tests de bout en bout",
    "Migration d'une application vers le cloud",
    "Outil de planification des consultants",
    "Module de rapports PDF",
    "Numérisation d'archives papier",
  ]) {
    await expect(offerRow(page, hiddenTitle)).toHaveCount(0);
  }
});

test("Scénario 2 - un administrateur filtre les offres par intervalle de dates", async ({ page }) => {
  await loginAs(page, "Administrateurs", "Anne Leclercq");
  await openOffers(page);

  await expect(page.getByText("Toutes les offres, tous statuts confondus.", { exact: true })).toBeVisible();

  await page.getByLabel("Date de début").fill("2027-02-08");
  await page.getByLabel("Date de fin").fill("2027-05-28");
  await page.getByRole("button", { name: "Filtrer", exact: true }).click();

  await expect(page.getByText("8 offres", { exact: true })).toBeVisible();

  const matchingTitles = [
    "Outil de planification des consultants",
    "Automatisation des tests de bout en bout",
    "Application React de gestion de flotte",
    "Refonte du portail client",
    "API REST de facturation",
    "Tableau de bord de qualité des données",
    "Migration d'une application vers le cloud",
    "Assistant conversationnel interne",
  ];

  const table = page.getByRole("table");
  await expect(table.getByRole("row")).toHaveCount(matchingTitles.length + 1);

  for (const title of matchingTitles) {
    await expect(offerRow(page, title)).toBeVisible();
  }

  await expect(offerRow(page, "Module de rapports PDF")).toHaveCount(0);
  await expect(offerRow(page, "Numérisation d'archives papier")).toHaveCount(0);

  await page.getByRole("button", { name: "Réinitialiser", exact: true }).click();

  await expect(page.getByLabel("Date de début")).toHaveValue("");
  await expect(page.getByLabel("Date de fin")).toHaveValue("");
  await expect(page.getByText("10 offres", { exact: true })).toBeVisible();
  await expect(page.getByRole("table").getByRole("row")).toHaveCount(11);

  await page.getByLabel("Date de début").fill("2028-01-01");
  await page.getByLabel("Date de fin").fill("2028-01-31");
  await page.getByRole("button", { name: "Filtrer", exact: true }).click();

  await expect(page.getByText("Aucune offre à afficher.", { exact: true })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
});
