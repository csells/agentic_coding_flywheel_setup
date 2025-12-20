"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Stepper, StepperMobile } from "@/components/stepper";
import { WIZARD_STEPS, getStepBySlug } from "@/lib/wizardSteps";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current step from URL path
  // e.g., /wizard/os -> "os" -> step 1
  const currentStep = useMemo(() => {
    const slug = pathname.split("/").pop() || "";
    const step = getStepBySlug(slug);
    return step?.id ?? 1;
  }, [pathname]);

  const handleStepClick = useCallback(
    (stepId: number) => {
      const step = WIZARD_STEPS.find((s) => s.id === stepId);
      if (step) {
        router.push(`/wizard/${step.slug}`);
      }
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop layout with sidebar */}
      <div className="mx-auto flex max-w-6xl">
        {/* Stepper sidebar - hidden on mobile */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r p-6 md:block">
          <div className="mb-6">
            <h1 className="text-lg font-semibold">ACFS Setup</h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {WIZARD_STEPS.length}
            </p>
          </div>
          <Stepper currentStep={currentStep} onStepClick={handleStepClick} />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 md:px-12">
          <div className="mx-auto max-w-2xl">{children}</div>
        </main>
      </div>

      {/* Mobile stepper - shown only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 md:hidden">
        <StepperMobile currentStep={currentStep} onStepClick={handleStepClick} />
      </div>
    </div>
  );
}
