"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/lib/markdown-components";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Home,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Lesson,
  LESSONS,
  getNextLesson,
  getPreviousLesson,
  useCompletedLessons,
} from "@/lib/lessonProgress";
import {
  getStepBySlug,
  TOTAL_STEPS as TOTAL_WIZARD_STEPS,
  useCompletedSteps,
} from "@/lib/wizardSteps";
import {
  useConfetti,
  getCompletionMessage,
  CompletionToast,
  FinalCelebrationModal,
} from "@/components/learn/confetti-celebration";

interface Props {
  lesson: Lesson;
  content: string;
}

// Reading progress hook
function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return progress;
}

// Minimal, Stripe-inspired sidebar
function LessonSidebar({
  currentLessonId,
  completedLessons,
}: {
  currentLessonId: number;
  completedLessons: number[];
}) {
  const progressPercent = Math.round((completedLessons.length / LESSONS.length) * 100);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/40 bg-background lg:block">
      <div className="flex h-full flex-col">
        {/* Clean header */}
        <div className="p-6 pb-4">
          <Link
            href="/learn"
            className="group flex items-center gap-2.5 text-foreground/90 transition-colors hover:text-foreground"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 transition-all duration-200 group-hover:bg-primary/15 group-hover:scale-105">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight">
              Learning Hub
            </span>
          </Link>
        </div>

        {/* Minimal progress bar */}
        <div className="mx-6 mb-6">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
            <span>{completedLessons.length}/{LESSONS.length} lessons</span>
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Clean lesson list */}
        <nav className="flex-1 overflow-y-auto px-3 scrollbar-hide">
          <ul className="space-y-0.5">
            {LESSONS.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isCurrent = lesson.id === currentLessonId;

              return (
                <li key={lesson.id}>
                  <Link
                    href={`/learn/${lesson.slug}`}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-150 ${
                      isCurrent
                        ? "bg-primary/8 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium transition-all duration-200 ${
                        isCompleted
                          ? "bg-emerald-500/15 text-emerald-500"
                          : isCurrent
                            ? "bg-primary/15 text-primary"
                            : "bg-muted/80 text-muted-foreground group-hover:bg-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      ) : (
                        <span className="tabular-nums">{lesson.id + 1}</span>
                      )}
                    </div>
                    <span className="truncate">{lesson.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Minimal footer */}
        <div className="p-4 border-t border-border/40">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-[13px] text-muted-foreground rounded-lg transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function LessonContent({ lesson, content }: Props) {
  const router = useRouter();
  const [completedLessons, markComplete] = useCompletedLessons();
  const [completedSteps] = useCompletedSteps();
  const readingProgress = useReadingProgress();
  const isCompleted = completedLessons.includes(lesson.id);
  const prevLesson = getPreviousLesson(lesson.id);
  const nextLesson = getNextLesson(lesson.id);
  const isWizardComplete = completedSteps.length === TOTAL_WIZARD_STEPS;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);
  const { celebrate } = useConfetti();

  // Refs for timeout cleanup
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const wizardStepSlugByLesson: Record<string, string> = {
    welcome: "launch-onboarding",
    "ssh-basics": "ssh-connect",
    "agent-commands": "accounts",
  };
  const wizardStepSlug = wizardStepSlugByLesson[lesson.slug] ?? "os-selection";
  const wizardStep = getStepBySlug(wizardStepSlug);
  const wizardStepTitle = wizardStep?.title ?? "Setup Wizard";

  const handleMarkComplete = useCallback(() => {
    if (isCompleted) {
      if (nextLesson) {
        router.push(`/learn/${nextLesson.slug}`);
      }
      return;
    }

    markComplete(lesson.id);
    const isFinalLesson = !nextLesson;

    celebrate(isFinalLesson);
    setToastMessage(getCompletionMessage(isFinalLesson));
    setShowToast(true);

    timeoutsRef.current.push(setTimeout(() => setShowToast(false), 2500));

    if (isFinalLesson) {
      timeoutsRef.current.push(setTimeout(() => setShowFinalCelebration(true), 500));
    } else {
      timeoutsRef.current.push(setTimeout(() => {
        router.push(`/learn/${nextLesson.slug}`);
      }, 1500));
    }
  }, [lesson.id, markComplete, nextLesson, router, celebrate, isCompleted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "h":
          if (prevLesson) router.push(`/learn/${prevLesson.slug}`);
          break;
        case "ArrowRight":
        case "l":
          if (nextLesson) router.push(`/learn/${nextLesson.slug}`);
          break;
        case "c":
          if (!isCompleted) handleMarkComplete();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevLesson, nextLesson, isCompleted, handleMarkComplete, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle reading progress */}
      <div className="fixed left-0 right-0 top-0 z-50 h-[2px] bg-transparent">
        <div
          className="h-full bg-primary/60 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Celebration components */}
      <CompletionToast message={toastMessage} isVisible={showToast} />
      <FinalCelebrationModal
        isOpen={showFinalCelebration}
        onClose={() => setShowFinalCelebration(false)}
        onGoToDashboard={() => {
          setShowFinalCelebration(false);
          router.push("/learn");
        }}
      />

      <div className="flex">
        {/* Desktop sidebar */}
        <LessonSidebar
          currentLessonId={lesson.id}
          completedLessons={completedLessons}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur-sm px-4 py-3 lg:hidden">
            <Link
              href="/learn"
              className="flex items-center gap-2 text-muted-foreground text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Lessons</span>
            </Link>
            <div className="text-xs text-muted-foreground tabular-nums">
              {lesson.id + 1} / {LESSONS.length}
            </div>
          </div>

          {/* Content area with constrained width */}
          <div className="px-6 py-10 md:px-12 md:py-16 lg:px-16 lg:py-20">
            <div className="mx-auto max-w-[680px]">
              {/* Lesson header */}
              <header className="mb-12">
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="tabular-nums">Lesson {lesson.id + 1}</span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {lesson.duration}
                  </span>
                  {isCompleted && (
                    <>
                      <span className="text-border">·</span>
                      <span className="flex items-center gap-1.5 text-emerald-500">
                        <Check className="h-3.5 w-3.5" />
                        Complete
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                  {lesson.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {lesson.description}
                </p>
              </header>

              {/* Setup prompt */}
              {!isWizardComplete && (
                <div className="mb-10 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        New here?
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Complete the setup wizard first to get the most from these lessons.
                      </p>
                      <Link
                        href={`/wizard/${wizardStepSlug}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        Go to {wizardStepTitle}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium markdown content */}
              <article className="prose prose-neutral dark:prose-invert max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-3
                prose-h4:text-lg prose-h4:mt-8 prose-h4:mb-2
                prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:mb-6
                prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-code:text-[13px] prose-code:font-normal prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-li:text-muted-foreground prose-li:leading-[1.8]
                prose-ul:my-6 prose-ol:my-6
                prose-blockquote:border-l-2 prose-blockquote:border-primary/30 prose-blockquote:bg-muted/30 prose-blockquote:py-0.5 prose-blockquote:pl-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-muted-foreground
              ">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {content}
                </ReactMarkdown>
              </article>

              {/* Completion CTA */}
              <div className="mt-16 pt-8 border-t border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {isCompleted ? "Ready to continue?" : "Finished reading?"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isCompleted
                        ? nextLesson
                          ? "Move on to the next lesson."
                          : "You've completed all lessons!"
                        : "Mark this lesson complete to track your progress."}
                    </p>
                  </div>
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isCompleted && !nextLesson}
                    size="lg"
                    className={`shrink-0 ${
                      isCompleted
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : ""
                    }`}
                  >
                    {isCompleted ? (
                      nextLesson ? (
                        <>
                          Next Lesson
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          All Complete
                        </>
                      )
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Desktop navigation */}
              <nav className="hidden lg:flex items-center justify-between mt-12 pt-8 border-t border-border/40">
                {prevLesson ? (
                  <Link
                    href={`/learn/${prevLesson.slug}`}
                    className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
                      <ChevronLeft className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground mb-0.5">Previous</div>
                      <div className="font-medium text-foreground">{prevLesson.title}</div>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {nextLesson && (
                  <Link
                    href={`/learn/${nextLesson.slug}`}
                    className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
                  >
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-0.5">Next</div>
                      <div className="font-medium text-foreground">{nextLesson.title}</div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* Mobile bottom spacing */}
          <div className="h-24 lg:hidden" />
        </main>
      </div>

      {/* Mobile navigation bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/40 bg-background/95 backdrop-blur-sm lg:hidden pb-safe">
        <div className="flex items-center gap-2 p-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            disabled={!prevLesson}
            asChild={!!prevLesson}
          >
            {prevLesson ? (
              <Link href={`/learn/${prevLesson.slug}`} aria-label="Previous">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>

          <Button
            className={`h-11 flex-1 font-medium ${
              isCompleted ? "bg-emerald-600 hover:bg-emerald-700" : ""
            }`}
            onClick={handleMarkComplete}
            disabled={isCompleted && !nextLesson}
          >
            {isCompleted ? (
              nextLesson ? (
                <>Next<ArrowRight className="ml-1.5 h-4 w-4" /></>
              ) : (
                <>Complete<Check className="ml-1.5 h-4 w-4" /></>
              )
            ) : (
              <>Mark Complete<Check className="ml-1.5 h-4 w-4" /></>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            disabled={!nextLesson}
            asChild={!!nextLesson}
          >
            {nextLesson ? (
              <Link href={`/learn/${nextLesson.slug}`} aria-label="Next">
                <ChevronRight className="h-5 w-5" />
              </Link>
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
