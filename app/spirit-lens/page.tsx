import { Suspense } from "react";
import { SpiritLensClient } from "@/components/spirit-lens/SpiritLensClient";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "The Spirit Lens",
};

export default function SpiritLensPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Module III"
        title="The Spirit Lens"
        description="Upload astronomical images for qualitative AI restoration and candidate object detection. Neural restoration can invent apparent detail — it is not scientifically validated measurement."
      />
      <Suspense fallback={<LoadingState />}>
        <SpiritLensClient />
      </Suspense>
    </div>
  );
}
