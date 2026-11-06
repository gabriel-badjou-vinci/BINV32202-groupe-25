import { useState } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferApplicationForm from "../components/OfferApplicationForm.tsx";
import OfferDateFilter, { type OfferDateRange } from "../components/OfferDateFilter.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useOffers } from "../hooks/useOffers.ts";
import type { User } from "../models/user.ts";
import type { Offer } from "../models/offer.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const [dateRange, setDateRange] = useState<OfferDateRange>({ startDate: "", endDate: "" });
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [applicationSent, setApplicationSent] = useState(false);
  const { offers, isLoading, error } = useOffers(token, onUnauthorized, dateRange);

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (offers.length === 0) return <EmptyState message="Aucune offre à afficher." />;
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        <OfferTable
          offers={offers}
          isStudent={user.kind === "STUDENT"}
          onApply={(offer) => {
            setApplicationSent(false);
            setSelectedOffer(offer);
          }}
        />
        {selectedOffer && user.kind === "STUDENT" && (
          <OfferApplicationForm
            offer={selectedOffer}
            token={token}
            onUnauthorized={onUnauthorized}
            onCancel={() => setSelectedOffer(null)}
            onSuccess={() => {
              setSelectedOffer(null);
              setApplicationSent(true);
            }}
          />
        )}
        {applicationSent && <p role="status">Votre candidature a été envoyée.</p>}
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <OfferDateFilter value={dateRange} onSubmit={setDateRange} />
      {renderContent()}
    </section>
  );
};

export default OffersPage;
