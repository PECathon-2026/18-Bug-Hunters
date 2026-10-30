import { Suspense } from "react";
import { CelestialScrollClient } from "@/components/celestial/CelestialScrollClient";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "The Celestial Scroll",
};

export default function CelestialScrollPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Module II"
        title="The Celestial Scroll"
        description="Source-backed and calculated astronomy events. Live feeds are labelled live; curated calendars are labelled curated. Times are shown in UTC unless noted."
      />
      <Suspense fallback={<LoadingState />}>
        <CelestialScrollClient />
      </Suspense>
    </div>
  );
}
