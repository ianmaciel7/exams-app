"use client";
import { useEffect, useState } from "react";
import {
  finishSession,
  loadSession,
  saveSessionAnswer,
  startSession,
  submitAnswer,
} from "@/actions/recall";
import {
  RetryQueueBanner,
  useGradeRetryQueue,
} from "@/components/study/retry-queue-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  qualityScale,
  SESSION_EXPIRED,
  type Snapshot,
  type StudySession,
} from "@/domain/recall";

// startSession/saveSessionAnswer prefix a SESSION_EXPIRED code onto their
// error message (spec.md §2.4.3) so the client can recognize the case and
// show a plain-language message rather than the raw code.
function friendlyError(cause: unknown, fallback: string) {
  const message = cause instanceof Error ? cause.message : fallback;
  const prefix = `${SESSION_EXPIRED}: `;
  return message.startsWith(prefix) ? message.slice(prefix.length) : message;
}

export function StudyPanel({
  data,
  onUpdate,
}: {
  data: Snapshot;
  onUpdate: () => Promise<void>;
}) {
  const [session, setSession] = useState<StudySession | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    expected: string[];
  } | null>(null);
  const [rated, setRated] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [mode, setMode] = useState<StudySession["mode"]>("practice");
  const key = `recall-session:${data.uid}:${data.spaceId}`;
  const retryQueue = useGradeRetryQueue(data.spaceId, () => void onUpdate());
  useEffect(() => {
    const id = localStorage.getItem(key);
    if (id)
      loadSession(id)
        .then((value) => {
          setSession(value);
          setAnswers(value.answers[value.questions[0].id] ?? []);
        })
        .catch(() => localStorage.removeItem(key));
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [key]);
  async function finish() {
    if (!session || busy) return;
    setBusy(true);
    setError("");
    try {
      const results = await finishSession(session.id);
      setSession({ ...session, results });
      await onUpdate();
    } catch (cause) {
      setError(friendlyError(cause, "Could not submit. Try again."));
    } finally {
      setBusy(false);
    }
  }
  async function rate(value: number) {
    const current = session?.questions[index];
    if (!session || !current) return;
    setError("");
    // Optimistic: the self-grade shows as recorded immediately. A failed
    // submission (e.g. offline) is queued and retried in the background by
    // useGradeRetryQueue rather than surfaced as a blocking error here.
    setRated(value);
    await retryQueue.submitGrade({
      attemptId: `${session.id}_${current.id}`,
      questionId: current.id,
      quality: value,
    });
  }
  useEffect(() => {
    if (!feedback) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.metaKey) return;
      const value = Number(event.key);
      if (event.key.trim() === "" || Number.isNaN(value) || value > 5) return;
      event.preventDefault();
      void rate(value);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  // A deadline is stored on the server; reload cannot extend an exam.
  useEffect(() => {
    if (
      session?.deadline &&
      now >= session.deadline &&
      !session.results &&
      !busy &&
      !error
    )
      void finish();
  });
  const question = session?.questions[index];
  const banner = <RetryQueueBanner pending={retryQueue.pending} />;
  if (!session)
    return (
      <>
        {banner}
        <Card>
          <CardHeader>
            <CardTitle>Make room for a little practice.</CardTitle>
            <CardDescription>
              Study your own questions. Missed answers return to your review
              queue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                setBusy(true);
                setError("");
                try {
                  const selectedMode = String(
                    form.get("mode"),
                  ) as StudySession["mode"];
                  const value = await startSession(
                    data.spaceId,
                    String(form.get("scope")),
                    Number(form.get("count")),
                    selectedMode,
                    selectedMode === "simulated_exam"
                      ? Number(form.get("duration")) * 60
                      : undefined,
                  );
                  setSession(value);
                  localStorage.setItem(key, value.id);
                } catch (cause) {
                  setError(friendlyError(cause, "Could not start session."));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="scope">Scope</FieldLabel>
                  <select
                    id="scope"
                    name="scope"
                    className="h-11 rounded-lg border border-input bg-background px-3"
                  >
                    <option value="due">Due and new questions</option>
                    <option value="all">All questions</option>
                    {data.objects
                      .filter(
                        (obj) =>
                          ["exam", "tag", "collection"].includes(obj.kind) &&
                          !obj.archived,
                      )
                      .map((obj) => (
                        <option key={obj.id} value={obj.id}>
                          {obj.title}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="count">Question count</FieldLabel>
                  <Input
                    id="count"
                    name="count"
                    type="number"
                    min={1}
                    max={100}
                    defaultValue={10}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="mode">Mode</FieldLabel>
                  <select
                    id="mode"
                    name="mode"
                    className="h-11 rounded-lg border border-input bg-background px-3"
                    value={mode}
                    onChange={(event) =>
                      setMode(event.target.value as StudySession["mode"])
                    }
                  >
                    <option value="practice">
                      Practice · immediate feedback
                    </option>
                    <option value="simulated_exam">
                      Simulated exam · timed, you set the limit
                    </option>
                  </select>
                </Field>
                {mode === "simulated_exam" && (
                  <Field>
                    <FieldLabel htmlFor="duration">
                      Time limit (minutes)
                    </FieldLabel>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min={5}
                      max={240}
                      defaultValue={60}
                      required
                    />
                  </Field>
                )}
                {error && (
                  <p role="alert" className="text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={busy}>
                  {busy ? "Preparing…" : "Begin session"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </>
    );
  if (session.results)
    return (
      <>
        {banner}
        <Card>
          <CardHeader>
            <CardTitle>Session complete</CardTitle>
            <CardDescription>
              {session.results.filter((result) => result.correct).length} of{" "}
              {session.questions.length} correct. Your review schedule has been
              updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {session.results.map((result) => (
              <div key={result.objectId} className="rounded-lg border p-4">
                <p className="font-medium">
                  {result.correct ? "✓" : "↻"}{" "}
                  {
                    session.questions.find(
                      (item) => item.id === result.objectId,
                    )?.title
                  }
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Answer: {result.expected.join(" · ")}
                </p>
              </div>
            ))}
            <Button
              onClick={() => {
                localStorage.removeItem(key);
                setSession(null);
                setIndex(0);
                setAnswers([]);
                setFeedback(null);
                setRated(null);
              }}
            >
              Start another session
            </Button>
          </CardContent>
        </Card>
      </>
    );
  if (!question) return null;
  const expired = Boolean(session.deadline && now >= session.deadline);
  return (
    <>
      {banner}
      <Card>
        <CardHeader>
          <CardDescription>
            Question {index + 1} of {session.questions.length}
            {session.deadline
              ? ` · ${Math.max(0, Math.ceil((session.deadline - now) / 1000))} seconds left`
              : " · Practice"}
          </CardDescription>
          <CardTitle>{question.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <fieldset
            disabled={busy || Boolean(feedback) || expired}
            className="flex flex-col gap-3"
          >
            <legend className="sr-only">Your answer</legend>
            {question.format.includes("choice") ? (
              question.options.map((option) => (
                <label
                  key={option}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-input p-4 has-checked:bg-secondary"
                >
                  <input
                    type={
                      question.format === "single-choice" ? "radio" : "checkbox"
                    }
                    name="answer"
                    value={option}
                    checked={answers.includes(option)}
                    onChange={(event) =>
                      setAnswers(
                        question.format === "single-choice"
                          ? [option]
                          : event.target.checked
                            ? [...answers, option]
                            : answers.filter((answer) => answer !== option),
                      )
                    }
                  />
                  {option}
                </label>
              ))
            ) : question.format === "matching" ? (
              question.options.map((option, optionIndex) => (
                <Field key={option}>
                  <FieldLabel htmlFor={`match-${optionIndex}`}>
                    {option}
                  </FieldLabel>
                  <Input
                    id={`match-${optionIndex}`}
                    value={answers[optionIndex] ?? ""}
                    onChange={(event) => {
                      const next = [...answers];
                      next[optionIndex] = event.target.value;
                      setAnswers(next);
                    }}
                  />
                </Field>
              ))
            ) : (
              <Field>
                <FieldLabel htmlFor="answer">Your answer</FieldLabel>
                <Input
                  id="answer"
                  value={answers[0] ?? ""}
                  onChange={(event) => setAnswers([event.target.value])}
                />
              </Field>
            )}
          </fieldset>
          {feedback && (
            <output className="block rounded-lg bg-secondary p-4">
              <p className="font-medium">
                {feedback.correct
                  ? "That's right."
                  : "Keep this one in your review queue."}
              </p>
              <p className="mt-2">Answer: {feedback.expected.join(" · ")}</p>
              <p className="mt-2 text-sm">{question.text}</p>
            </output>
          )}
          {feedback && (
            <fieldset disabled={busy}>
              <legend className="text-sm font-medium">
                How well did you recall this?
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {qualityScale.map((step) => (
                  <Button
                    key={step.value}
                    type="button"
                    size="sm"
                    variant={rated === step.value ? "default" : "outline"}
                    onClick={() => rate(step.value)}
                  >
                    <span aria-hidden="true" className="opacity-60">
                      {step.value}
                    </span>
                    {step.label}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {rated === null
                  ? "Press 0-5, or skip to keep the auto-graded result."
                  : "Review schedule updated."}
              </p>
            </fieldset>
          )}
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {!feedback && !expired && (
              <Button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    const clean = Array.from(
                      {
                        length:
                          question.format === "matching"
                            ? question.options.length
                            : answers.length,
                      },
                      (_, n) => answers[n] ?? "",
                    );
                    await saveSessionAnswer(session.id, question.id, clean);
                    const updated = {
                      ...session,
                      answers: { ...session.answers, [question.id]: clean },
                    };
                    setSession(updated);
                    if (session.mode === "practice")
                      setFeedback(
                        await submitAnswer(
                          data.spaceId,
                          question.id,
                          clean,
                          `${session.id}_${question.id}`,
                        ),
                      );
                    else if (index < session.questions.length - 1) {
                      setIndex(index + 1);
                      setAnswers(
                        session.answers[session.questions[index + 1].id] ?? [],
                      );
                    } else {
                      const results = await finishSession(session.id);
                      setSession({ ...updated, results });
                      await onUpdate();
                    }
                  } catch (cause) {
                    setError(
                      friendlyError(cause, "Could not save your answer."),
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy
                  ? "Saving…"
                  : session.mode === "practice"
                    ? "Check answer"
                    : index === session.questions.length - 1
                      ? "Save and finish exam"
                      : "Save and continue"}
              </Button>
            )}
            {feedback && (
              <Button
                disabled={busy}
                onClick={() => {
                  if (index === session.questions.length - 1) void finish();
                  else {
                    setIndex(index + 1);
                    setAnswers(
                      session.answers[session.questions[index + 1].id] ?? [],
                    );
                    setFeedback(null);
                    setRated(null);
                  }
                }}
              >
                {index === session.questions.length - 1
                  ? "View results"
                  : "Next question"}
              </Button>
            )}
            {expired && (
              <Button onClick={finish} disabled={busy}>
                Submit saved answers
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Answers are saved when you continue. You can resume this session
            after a reload.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
