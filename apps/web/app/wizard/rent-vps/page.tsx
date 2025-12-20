"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Check, Server, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { markStepComplete } from "@/lib/wizardSteps";

interface ProviderInfo {
  id: string;
  name: string;
  tagline: string;
  url: string;
  pros: string[];
  recommended?: string;
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: "ovh",
    name: "OVH",
    tagline: "European, good value",
    url: "https://www.ovhcloud.com/en/vps/",
    pros: [
      "Great EU data centers",
      "Competitive pricing",
      "Solid network performance",
    ],
    recommended: "VPS Starter or VPS Essential",
  },
  {
    id: "contabo",
    name: "Contabo",
    tagline: "Budget-friendly, high specs",
    url: "https://contabo.com/en/vps/",
    pros: [
      "Very high specs for the price",
      "Good for compute-heavy workloads",
      "EU and US locations",
    ],
    recommended: "Cloud VPS M",
  },
  {
    id: "hetzner",
    name: "Hetzner",
    tagline: "Developer favorite",
    url: "https://www.hetzner.com/cloud/",
    pros: [
      "Excellent reputation with developers",
      "Great API and tooling",
      "EU data centers",
    ],
    recommended: "CX32 or CX42",
  },
];

interface ProviderCardProps {
  provider: ProviderInfo;
  isExpanded: boolean;
  onToggle: () => void;
}

function ProviderCard({ provider, isExpanded, onToggle }: ProviderCardProps) {
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-bold">
            {provider.name[0]}
          </div>
          <div>
            <h3 className="font-semibold">{provider.name}</h3>
            <p className="text-sm text-muted-foreground">{provider.tagline}</p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Why {provider.name}:</h4>
            <ul className="space-y-1">
              {provider.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-muted-foreground">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {provider.recommended && (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm">
                <span className="font-medium">Recommended plan:</span>{" "}
                <span className="text-muted-foreground">
                  {provider.recommended}
                </span>
              </p>
            </div>
          )}

          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Go to {provider.name}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </Card>
  );
}

const SPEC_CHECKLIST = [
  { label: "OS", value: "Ubuntu 25.x (or newest Ubuntu)" },
  { label: "CPU", value: "4-8 vCPU" },
  { label: "RAM", value: "8-16 GB" },
  { label: "Storage", value: "100GB+ NVMe SSD" },
  { label: "Price", value: "~$50/month sweet spot" },
];

export default function RentVPSPage() {
  const router = useRouter();
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleToggleProvider = useCallback((providerId: string) => {
    setExpandedProvider((prev) => (prev === providerId ? null : providerId));
  }, []);

  const handleContinue = useCallback(() => {
    markStepComplete(4);
    setIsNavigating(true);
    router.push("/wizard/create-vps");
  }, [router]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Rent a VPS (~$50/month sweet spot)
        </h1>
        <p className="text-lg text-muted-foreground">
          Pick a VPS provider and rent a server. This is where your coding
          agents will live.
        </p>
      </div>

      {/* Spec checklist */}
      <Card className="p-4">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <Server className="h-5 w-5" />
          What to choose
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {SPEC_CHECKLIST.map((spec) => (
            <div key={spec.label} className="flex gap-2 text-sm">
              <span className="font-medium text-muted-foreground min-w-20">
                {spec.label}:
              </span>
              <span>{spec.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Provider cards */}
      <div className="space-y-4">
        <h2 className="font-semibold">Recommended providers</h2>
        <div className="space-y-3">
          {PROVIDERS.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isExpanded={expandedProvider === provider.id}
              onToggle={() => handleToggleProvider(provider.id)}
            />
          ))}
        </div>
      </div>

      {/* Other providers note */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Using a different provider?</strong>{" "}
          Any provider with Ubuntu VPS and SSH key login works. Just make sure
          you can add your SSH public key during setup.
        </p>
      </div>

      {/* Continue button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleContinue} disabled={isNavigating} size="lg">
          {isNavigating ? "Loading..." : "I rented a VPS"}
        </Button>
      </div>
    </div>
  );
}
