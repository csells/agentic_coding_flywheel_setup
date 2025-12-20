"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface CommandCardProps {
  /** The default command to display */
  command: string;
  /** Mac-specific command (if different from default) */
  macCommand?: string;
  /** Windows-specific command (if different from default) */
  windowsCommand?: string;
  /** Description text shown above the command */
  description?: string;
  /** Whether to show the "I ran this" checkbox */
  showCheckbox?: boolean;
  /** Unique ID for persisting checkbox state in localStorage */
  persistKey?: string;
  /** Callback when checkbox is checked */
  onComplete?: () => void;
  /** Additional class names */
  className?: string;
}

type OS = "mac" | "windows" | "linux";

function detectOS(): OS {
  if (typeof window === "undefined") return "mac";

  // Check localStorage first for user preference
  const stored = localStorage.getItem("acfs-user-os");
  if (stored === "mac" || stored === "windows" || stored === "linux") {
    return stored;
  }

  // Auto-detect from user agent
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  return "linux";
}

export function CommandCard({
  command,
  macCommand,
  windowsCommand,
  description,
  showCheckbox = false,
  persistKey,
  onComplete,
  className,
}: CommandCardProps) {
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [os, setOS] = useState<OS>("mac");

  // Detect OS on mount
  useEffect(() => {
    setOS(detectOS());
  }, []);

  // Load persisted completion state
  useEffect(() => {
    if (persistKey && typeof window !== "undefined") {
      const stored = localStorage.getItem(`acfs-command-${persistKey}`);
      if (stored === "true") {
        setCompleted(true);
      }
    }
  }, [persistKey]);

  // Get the appropriate command for the current OS
  const displayCommand = (() => {
    if (os === "mac" && macCommand) return macCommand;
    if (os === "windows" && windowsCommand) return windowsCommand;
    return command;
  })();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = displayCommand;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [displayCommand]);

  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      setCompleted(checked);
      if (persistKey && typeof window !== "undefined") {
        localStorage.setItem(`acfs-command-${persistKey}`, String(checked));
      }
      if (checked && onComplete) {
        onComplete();
      }
    },
    [persistKey, onComplete]
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      {description && (
        <p className="px-4 pt-4 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="flex items-stretch">
        <div className="flex flex-1 items-center gap-2 bg-muted/50 px-4 py-3">
          <Terminal className="h-4 w-4 shrink-0 text-muted-foreground" />
          <code className="flex-1 break-all font-mono text-sm">
            {displayCommand}
          </code>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-12 shrink-0 rounded-none border-l"
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy command"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      {showCheckbox && (
        <div className="flex items-center gap-2 border-t px-4 py-3">
          <Checkbox
            id={persistKey || "command-completed"}
            checked={completed}
            onCheckedChange={handleCheckboxChange}
          />
          <label
            htmlFor={persistKey || "command-completed"}
            className="cursor-pointer text-sm text-muted-foreground"
          >
            I ran this command
          </label>
        </div>
      )}
    </Card>
  );
}
