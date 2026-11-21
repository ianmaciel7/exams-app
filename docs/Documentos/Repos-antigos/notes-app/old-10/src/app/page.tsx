import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CircleHelp,
  FileText,
  Link2,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const recent = [
  {
    icon: CircleHelp,
    label: "What is eventual consistency?",
    type: "Question",
    tone: "bg-coral",
  },
  {
    icon: FileText,
    label: "Distributed systems notes",
    type: "Note",
    tone: "bg-accent-teal",
  },
  {
    icon: BookOpen,
    label: "AWS Solutions Architect",
    type: "Exam",
    tone: "bg-accent-amber",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
          <a
            href="#top"
            className="flex items-center gap-3 text-sm font-medium tracking-tight text-ink"
          >
            <span
              className="text-xl leading-none text-coral"
              aria-hidden="true"
            >
              ✳
            </span>
            <span>Recall</span>
          </a>
          <nav
            className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"
            aria-label="Primary navigation"
          >
            <a className="text-ink" href="#space">
              Space
            </a>
            <a href="#study">Study</a>
            <a href="#graph">Graph</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              nativeButton={false}
              variant="ghost"
              size="sm"
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
            <Button
              nativeButton={false}
              size="sm"
              className="bg-coral text-white hover:bg-coral-active"
              render={<Link href="/space" />}
            >
              Open space
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="max-w-xl">
            <Badge
              variant="outline"
              className="mb-6 border-coral/40 bg-surface-soft text-coral"
            >
              PRIVATE STUDY SPACE
            </Badge>
            <h1 className="display-face text-5xl leading-[1.05] text-ink sm:text-6xl">
              Make your knowledge work together.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-body">
              Recall brings questions, notes, citations, and review into one
              calm, connected space.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                nativeButton={false}
                size="lg"
                className="h-11 bg-coral px-5 text-white hover:bg-coral-active"
                render={<Link href="/login" />}
              >
                Create a space <ArrowRight data-icon="inline-end" />
              </Button>
              <Button
                nativeButton={false}
                size="lg"
                variant="outline"
                className="h-11 border-hairline bg-canvas"
                render={<Link href="#space" />}
              >
                See how it works
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Free for every member of your private Space.
            </p>
          </div>
          <Card
            id="graph"
            className="rounded-2xl border-0 bg-surface-dark p-2 text-white shadow-none"
          >
            <CardHeader className="flex-row items-center justify-between px-5 pb-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="size-2 rounded-full bg-coral" /> Personal Space
              </div>
              <span
                className="flex size-7 items-center justify-center text-white/70"
                aria-hidden="true"
              >
                <Search className="size-4" />
              </span>
            </CardHeader>
            <CardContent className="grid gap-3 px-3 pb-3 sm:grid-cols-[1fr_0.8fr]">
              <div className="rounded-xl bg-surface-dark-elevated p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/45">
                    Today
                  </span>
                  <Plus className="size-4 text-coral" />
                </div>
                <h2 className="display-face mt-8 text-3xl text-white">
                  Keep learning visible.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Your recent objects, connected in one view.
                </p>
                <div className="mt-8 flex items-center gap-2 text-xs text-white/55">
                  <Link2 className="size-3.5 text-coral" /> 12 connected objects
                </div>
              </div>
              <div className="rounded-xl bg-surface-dark-elevated p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Recent
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {recent.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-lg bg-white/[0.04] p-3"
                      >
                        <span
                          className={`flex size-8 items-center justify-center rounded-lg ${item.tone} text-white`}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm text-white/90">
                            {item.label}
                          </div>
                          <div className="mt-0.5 text-xs text-white/45">
                            {item.type}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section
          id="space"
          className="border-t border-hairline bg-surface-soft"
        >
          <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-coral">
                One connected space
              </p>
              <h2 className="display-face mt-4 text-4xl text-ink">
                Study with the whole picture in view.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Brain,
                  title: "Think in objects",
                  text: "Turn every question, note, and citation into a reusable building block.",
                },
                {
                  icon: Link2,
                  title: "Connect the dots",
                  text: "Link related ideas in both directions and see the context around each one.",
                },
                {
                  icon: Check,
                  title: "Review what matters",
                  text: "Use spaced repetition to bring missed questions back at the right time.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <Card
                  key={title}
                  className="border-0 bg-surface-card shadow-none"
                >
                  <CardHeader>
                    <Icon className="size-5 text-coral" />
                    <CardTitle className="mt-4 text-xl text-ink">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="leading-7 text-body">
                    {text}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section
          id="study"
          className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:flex-row sm:items-center sm:justify-between lg:px-8"
        >
          <div>
            <h2 className="display-face text-3xl text-ink">
              Ready when you are.
            </h2>
            <p className="mt-2 text-body">
              Start with one Space and let your knowledge grow from there.
            </p>
          </div>
          <Button
            nativeButton={false}
            className="w-fit bg-coral text-white hover:bg-coral-active"
            render={<Link href="/space" />}
          >
            Open Recall <ArrowRight data-icon="inline-end" />
          </Button>
        </section>
      </main>
      <footer className="bg-surface-dark px-6 py-8 text-sm text-white/55">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:px-2">
          <span className="text-white/80">✳ Recall</span>
          <span>Private by default. Built for thoughtful study.</span>
        </div>
      </footer>
    </div>
  );
}
