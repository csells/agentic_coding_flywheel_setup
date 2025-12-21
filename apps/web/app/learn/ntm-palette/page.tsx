"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Home,
  LayoutGrid,
  Play,
  Search,
  Send,
  Settings,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CommandCard, CodeBlock } from "@/components/command-card";

interface CommandCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  commands: Array<{
    command: string;
    description: string;
    flags?: string[];
  }>;
}

const categories: CommandCategory[] = [
  {
    id: "spawn",
    name: "Spawning Agents",
    icon: <Play className="h-5 w-5" />,
    description: "Create new agent sessions with different configurations",
    commands: [
      {
        command: "ntm spawn myproject --cc=2 --cod=1 --gmi=1",
        description: "Spawn 2 Claude, 1 Codex, 1 Gemini agents",
        flags: ["--cc=N", "--cod=N", "--gmi=N"],
      },
      {
        command: "ntm spawn myproject --cc=3",
        description: "Spawn 3 Claude agents only",
      },
      {
        command: "ntm new myproject",
        description: "Create new empty session (alias for spawn with no agents)",
      },
    ],
  },
  {
    id: "send",
    name: "Sending Prompts",
    icon: <Send className="h-5 w-5" />,
    description: "Broadcast prompts to specific agents or all agents",
    commands: [
      {
        command: 'ntm send myproject "your prompt here"',
        description: "Send prompt to all agents in session",
      },
      {
        command: 'ntm send myproject --cc "Claude-specific prompt"',
        description: "Send prompt only to Claude agents",
      },
      {
        command: 'ntm send myproject --cod "Codex-specific prompt"',
        description: "Send prompt only to Codex agents",
      },
      {
        command: 'ntm send myproject --gmi "Gemini-specific prompt"',
        description: "Send prompt only to Gemini agents",
      },
    ],
  },
  {
    id: "manage",
    name: "Session Management",
    icon: <LayoutGrid className="h-5 w-5" />,
    description: "Attach, list, and manage agent sessions",
    commands: [
      {
        command: "ntm attach myproject",
        description: "Attach to session (view all agent panes)",
      },
      {
        command: "ntm list",
        description: "List all active sessions",
      },
      {
        command: "ntm status myproject",
        description: "Show session status and agent health",
      },
      {
        command: "ntm kill myproject",
        description: "Terminate all agents in session",
      },
    ],
  },
  {
    id: "palette",
    name: "Command Palette",
    icon: <Terminal className="h-5 w-5" />,
    description: "Interactive TUI for quick command access",
    commands: [
      {
        command: "ntm palette",
        description: "Open command palette (fuzzy search all commands)",
      },
      {
        command: "ntm palette myproject",
        description: "Open palette for specific session",
      },
      {
        command: "ntm dashboard",
        description: "Open real-time dashboard view",
      },
    ],
  },
  {
    id: "robot",
    name: "Robot Mode (Automation)",
    icon: <Settings className="h-5 w-5" />,
    description: "Machine-readable output for scripting and automation",
    commands: [
      {
        command: "ntm --robot-status myproject",
        description: "JSON output of session status",
      },
      {
        command: "ntm --robot-plan",
        description: "JSON output of planned actions",
      },
      {
        command: "ntm list --json",
        description: "List sessions in JSON format",
      },
    ],
  },
];

function CategoryCard({ category }: { category: CommandCategory }) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/30 bg-muted/30 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {category.icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>

      {/* Commands */}
      <div className="space-y-3 p-4">
        {category.commands.map((cmd, i) => (
          <CommandCard
            key={i}
            command={cmd.command}
            description={cmd.description}
          />
        ))}
      </div>
    </Card>
  );
}

export default function NtmPalettePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      commands: category.commands.filter(
        (cmd) =>
          cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.commands.length > 0);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-cosmic opacity-50" />
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-20" />

      <div className="relative mx-auto max-w-4xl px-6 py-8 md:px-12 md:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Learning Hub</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">Home</span>
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-500/20">
              <LayoutGrid className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            NTM Commands
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Named Tmux Manager (NTM) is your agent cockpit. Spawn agents, send
            prompts, and manage sessions from one powerful CLI.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border/50 bg-card/50 py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Quick start */}
        <Card className="mb-10 border-sky-500/20 bg-sky-500/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
              <Zap className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <h2 className="mb-1 font-semibold">Quick Start</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Start a new project with multiple agents in seconds:
              </p>
              <CodeBlock
                code={`# Create a session with 2 Claude, 1 Codex, 1 Gemini
ntm spawn myproject --cc=2 --cod=1 --gmi=1

# Attach to watch agents work
ntm attach myproject

# Send a prompt to all agents
ntm send myproject "Let's build something amazing"`}
                language="bash"
              />
            </div>
          </div>
        </Card>

        {/* Command categories */}
        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          ) : (
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No commands match your search.
              </p>
            </div>
          )}
        </div>

        {/* Related */}
        <Card className="mt-10 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-primary" />
            Related References
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/learn/agent-commands"
              className="flex items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Terminal className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Agent Commands</div>
                <div className="text-sm text-muted-foreground">
                  Claude, Codex, Gemini shortcuts
                </div>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/workflow"
              className="flex items-center gap-3 rounded-lg border border-border/50 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <LayoutGrid className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Flywheel Workflow</div>
                <div className="text-sm text-muted-foreground">
                  Full multi-agent ecosystem
                </div>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Back to{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Learning Hub &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
