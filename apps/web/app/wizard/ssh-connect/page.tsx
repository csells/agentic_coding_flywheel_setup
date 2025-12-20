"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, AlertCircle, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommandCard } from "@/components/command-card";
import { cn } from "@/lib/utils";
import { markStepComplete } from "@/lib/wizardSteps";
import { useVPSIP, useUserOS, useMounted } from "@/lib/userPreferences";

interface TroubleshootingItem {
  error: string;
  causes: string[];
  solutions: string[];
}

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    error: "Permission denied (publickey)",
    causes: [
      "SSH key wasn't added to the VPS during creation",
      "Using the wrong SSH key file",
      "Key file permissions are too open",
    ],
    solutions: [
      "Check your VPS provider's control panel - is your SSH key listed?",
      "Make sure you're using the acfs_ed25519 key file",
      "On Mac/Linux: run chmod 600 ~/.ssh/acfs_ed25519",
    ],
  },
  {
    error: "Connection refused",
    causes: [
      "VPS is still starting up",
      "SSH service not running on the VPS",
      "Firewall blocking port 22",
    ],
    solutions: [
      "Wait 2-5 minutes for the VPS to fully boot",
      "Check your VPS provider's status page",
      "Use the VPS console in your provider's control panel to check",
    ],
  },
  {
    error: "Connection timed out",
    causes: [
      "Wrong IP address",
      "VPS is offline",
      "Network issue between you and the VPS",
    ],
    solutions: [
      "Double-check the IP address in your provider's control panel",
      "Try pinging the IP: ping YOUR_IP",
      "Check if your VPS is running in the control panel",
    ],
  },
  {
    error: "Host key verification failed",
    causes: [
      "You've connected to this IP before with a different VPS",
      "The server was reinstalled",
    ],
    solutions: [
      "Remove the old key: ssh-keygen -R YOUR_IP",
      "Then try connecting again",
    ],
  },
];

function TroubleshootingSection({
  item,
  isExpanded,
  onToggle,
}: {
  item: TroubleshootingItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50"
      >
        <span className="font-medium text-destructive">{item.error}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && (
        <div className="space-y-3 border-t px-3 pb-3 pt-2 text-sm">
          <div>
            <p className="font-medium">Possible causes:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              {item.causes.map((cause, i) => (
                <li key={i}>{cause}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium">Solutions:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              {item.solutions.map((solution, i) => (
                <li key={i}>{solution}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SSHConnectPage() {
  const router = useRouter();
  const [vpsIP] = useVPSIP();
  const [os] = useUserOS();
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const mounted = useMounted();

  // Redirect if missing required data (after hydration)
  useEffect(() => {
    if (mounted) {
      if (vpsIP === null) {
        router.push("/wizard/create-vps");
      } else if (os === null) {
        router.push("/wizard/os-selection");
      }
    }
  }, [mounted, vpsIP, os, router]);

  const handleContinue = useCallback(() => {
    markStepComplete(6);
    setIsNavigating(true);
    router.push("/wizard/run-installer");
  }, [router]);

  if (!mounted || !vpsIP || !os) {
    return (
      <div className="flex items-center justify-center py-12">
        <Terminal className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  const sshCommand = `ssh -i ~/.ssh/acfs_ed25519 ubuntu@${vpsIP}`;
  const sshCommandWindows = `ssh -i $HOME\\.ssh\\acfs_ed25519 ubuntu@${vpsIP}`;
  const sshCommandRoot = `ssh -i ~/.ssh/acfs_ed25519 root@${vpsIP}`;
  const sshCommandRootWindows = `ssh -i $HOME\\.ssh\\acfs_ed25519 root@${vpsIP}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          SSH into your VPS
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect to your new VPS for the first time.
        </p>
      </div>

      {/* IP confirmation */}
      <Card className="border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-800 dark:text-blue-200">
            Connecting to:{" "}
            <code className="font-mono font-bold">{vpsIP}</code>
          </span>
        </div>
      </Card>

      {/* Primary command */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Run this command</h2>
        <CommandCard
          command={sshCommand}
          windowsCommand={sshCommandWindows}
          description="Connect as ubuntu user"
          showCheckbox
          persistKey="ssh-connect-ubuntu"
        />
      </div>

      {/* Host key prompt */}
      <Card className="p-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="space-y-2">
            <p className="font-medium">First-time connection prompt</p>
            <p className="text-sm text-muted-foreground">
              You&apos;ll see a message about &quot;authenticity of host&quot;.
              Type <code className="rounded bg-muted px-1">yes</code> and press
              Enter. This is normal for first-time connections.
            </p>
          </div>
        </div>
      </Card>

      {/* Fallback to root */}
      <div className="space-y-3">
        <h3 className="font-semibold">
          If &quot;ubuntu&quot; doesn&apos;t work, try root:
        </h3>
        <p className="text-sm text-muted-foreground">
          Some providers use &quot;root&quot; as the default user instead of
          &quot;ubuntu&quot;. If you get &quot;Permission denied&quot; with
          ubuntu, try this:
        </p>
        <CommandCard
          command={sshCommandRoot}
          windowsCommand={sshCommandRootWindows}
          description="Connect as root user (fallback)"
        />
      </div>

      {/* Success indicator */}
      <Card className="border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
        <div className="flex gap-3">
          <Check className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              You&apos;re connected when you see:
            </p>
            <code className="mt-1 block text-sm text-green-700 dark:text-green-300">
              ubuntu@vps:~$ <span className="animate-pulse">_</span>
            </code>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              You should see a prompt with your username and &quot;vps&quot; or
              the server hostname.
            </p>
          </div>
        </div>
      </Card>

      {/* Troubleshooting */}
      <div className="space-y-3">
        <h2 className="font-semibold">Having trouble?</h2>
        <div className="space-y-2">
          {TROUBLESHOOTING.map((item) => (
            <TroubleshootingSection
              key={item.error}
              item={item}
              isExpanded={expandedError === item.error}
              onToggle={() =>
                setExpandedError((prev) =>
                  prev === item.error ? null : item.error
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Continue button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleContinue} disabled={isNavigating} size="lg">
          {isNavigating ? "Loading..." : "I'm connected, continue"}
        </Button>
      </div>
    </div>
  );
}
