import { useState, type FormEvent } from "react";
import type { Offer } from "../models/offer.ts";
import { applyToOffer } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";

interface OfferApplicationFormProps {
  offer: Offer;
  token: string;
  onUnauthorized: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

const OfferApplicationForm = ({
  offer,
  token,
  onUnauthorized,
  onCancel,
  onSuccess,
}: OfferApplicationFormProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await applyToOffer(token, offer.id, message.trim() || undefined);
      onSuccess();
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      else setError(reason instanceof Error ? reason.message : "Candidature impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="application-form" onSubmit={handleSubmit}>
      <h2>Candidater à « {offer.title} »</h2>
      <label htmlFor="application-message">Message (facultatif)</label>
      <textarea
        id="application-message"
        value={message}
        maxLength={1000}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
      />
      {error && <p role="alert">{error}</p>}
      <button className="button button-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Envoi…" : "Envoyer ma candidature"}
      </button>
      <button className="button button-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
        Annuler
      </button>
    </form>
  );
};

export default OfferApplicationForm;
