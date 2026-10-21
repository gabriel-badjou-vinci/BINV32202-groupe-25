import type { Offer } from "../models/offer.ts";
import { API_URL, readJson } from "../utils/api.ts";
import { isOfferList } from "../utils/guards.ts";
import type { OfferDateRange } from "../components/OfferDateFilter.tsx";

export const getOffers = async (
  token: string,
  dateRange: OfferDateRange = { startDate: "", endDate: "" },
  signal?: AbortSignal,
): Promise<Offer[]> => {
  const params = new URLSearchParams();
  if (dateRange.startDate) params.set("startDate", dateRange.startDate);
  if (dateRange.endDate) params.set("endDate", dateRange.endDate);
  const query = params.toString();
  const response = await fetch(`${API_URL}/offers${query ? `?${query}` : ""}`, {
    headers: { Authorization: token },
    signal,
  });
  return readJson(response, isOfferList, "Chargement des offres impossible");
};
