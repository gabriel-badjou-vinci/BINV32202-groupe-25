import { useState, type FormEvent } from "react";

export interface OfferDateRange {
  startDate: string;
  endDate: string;
}

interface OfferDateFilterProps {
  value: OfferDateRange;
  onSubmit: (value: OfferDateRange) => void;
}

const OfferDateFilter = ({ value, onSubmit }: OfferDateFilterProps) => {
  const [draft, setDraft] = useState(value);

  const updateDraft = (field: keyof OfferDateRange, fieldValue: string) => {
    const next = { ...draft, [field]: fieldValue };
    setDraft(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(draft);
  };

  const reset = () => {
    const emptyRange = { startDate: "", endDate: "" };
    setDraft(emptyRange);
    onSubmit(emptyRange);
  };

  return (
    <form className="offer-date-filter" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="offer-start-date">Date de début</label>
        <input
          id="offer-start-date"
          type="date"
          value={draft.startDate}
          onChange={(event) => updateDraft("startDate", event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="offer-end-date">Date de fin</label>
        <input
          id="offer-end-date"
          type="date"
          value={draft.endDate}
          onChange={(event) => updateDraft("endDate", event.target.value)}
        />
      </div>
      <button className="button button-primary" type="submit">
        Filtrer
      </button>
      <button className="button button-secondary" type="button" onClick={reset}>
        Réinitialiser
      </button>
    </form>
  );
};

export default OfferDateFilter;
