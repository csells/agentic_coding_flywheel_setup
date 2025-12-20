"use client";

import { useEffect } from "react";
import { PartyPopper, Rocket, BookOpen, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CommandCard } from "@/components/command-card";
import { markStepComplete, setCompletedSteps, TOTAL_STEPS } from "@/lib/wizardSteps";

export default function LaunchOnboardingPage() {
  // Mark all steps complete on reaching this page
  useEffect(() => {
    markStepComplete(10);
    // Mark all steps as completed
    const allSteps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);
    setCompletedSteps(allSteps);
  }, []);

  return (
    <div className="space-y-8">
      {/* Celebration header */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/50">
            <PartyPopper className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Congratulations! You&apos;re all set up!
        </h1>
        <p className="text-lg text-muted-foreground">
          Your VPS is now a powerful coding environment ready for AI-assisted
          development.
        </p>
      </div>

      {/* Launch onboard */}
      <Card className="border-primary/20 bg-primary/5 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Rocket className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Start the onboarding tutorial</h2>
          </div>
          <p className="text-muted-foreground">
            Learn the basics of your new environment with an interactive tutorial:
          </p>
          <CommandCard
            command="onboard"
            description="Launch interactive onboarding"
          />
        </div>
      </Card>

      {/* What you can do now */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">What you can do now</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <h3 className="mb-2 font-medium">Start Claude Code</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Launch your AI coding assistant
            </p>
            <code className="rounded bg-muted px-2 py-1 text-sm">cc</code>
          </Card>
          <Card className="p-4">
            <h3 className="mb-2 font-medium">Use tmux with ntm</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Manage terminal sessions
            </p>
            <code className="rounded bg-muted px-2 py-1 text-sm">ntm new myproject</code>
          </Card>
          <Card className="p-4">
            <h3 className="mb-2 font-medium">Search with ripgrep</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Fast code search
            </p>
            <code className="rounded bg-muted px-2 py-1 text-sm">rg &quot;pattern&quot;</code>
          </Card>
          <Card className="p-4">
            <h3 className="mb-2 font-medium">Git with lazygit</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Visual git interface
            </p>
            <code className="rounded bg-muted px-2 py-1 text-sm">lazygit</code>
          </Card>
        </div>
      </div>

      {/* Resources */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-medium">Learn more</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <a
                  href="https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  ACFS GitHub Repository
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.anthropic.com/claude-code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Claude Code Documentation
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Final message */}
      <div className="rounded-lg border-2 border-dashed border-primary/30 p-6 text-center">
        <p className="text-lg font-medium">
          Happy coding!
        </p>
        <p className="mt-1 text-muted-foreground">
          Your agentic coding flywheel is ready to spin.
        </p>
      </div>
    </div>
  );
}
