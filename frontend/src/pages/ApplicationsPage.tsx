import { useState } from "react";
import ApplicationTable from "../components/ApplicationTable.tsx";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import { useApplications } from "../hooks/useApplications.ts";
import type { ApplicationListItem } from "../models/application.ts";
import { withdrawApplication } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, reload } = useApplications(token, onUnauthorized);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const handleWithdraw = async (application: ApplicationListItem) => {
    setWithdrawingId(application.id);
    setWithdrawError(null);
    try {
      await withdrawApplication(token, application.id);
      reload();
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      else if (reason instanceof Error) setWithdrawError(reason.message);
      else setWithdrawError("Retrait de la candidature impossible");
    } finally {
      setWithdrawingId(null);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (isLoading) return <LoadingState />;

  return (
    <section>
      <h1>Mes candidatures</h1>
      {withdrawError && <ErrorState message={withdrawError} />}
      {applications.length === 0 ? (
        <EmptyState message="Vous n'avez aucune candidature." />
      ) : (
        <ApplicationTable
          applications={applications}
          onWithdraw={handleWithdraw}
          withdrawingId={withdrawingId}
        />
      )}
    </section>
  );
};

export default ApplicationsPage;
