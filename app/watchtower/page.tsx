import { Suspense } from "react";
import { WatchtowerClient } from "@/components/watchtower/WatchtowerClient";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "The Watchtower",
};

export default function WatchtowerPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Module I"
        title="The Watchtower"
        description="Select a location, retrieve forecast sky conditions, and review an explainable Night Honor Score. Map candidates are labelled curated when not from a live discovery service."
      />
      <Suspense fallback={<LoadingState />}>
        <WatchtowerClient />
      </Suspense>
    </div>
  );
}
