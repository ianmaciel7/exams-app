"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import {
  type Attempt,
  autoQuality,
  examDurationSeconds,
  graceExpired,
  grade,
  objectInput,
  plainText,
  quality,
  type RecallObject,
  SESSION_EXPIRED,
  type Snapshot,
  type Space,
  type StudyRecord,
  type StudySession,
  schedule,
} from "@/domain/recall";
import { firebase } from "@/lib/firebase/admin";
import { authorized, idSchema, user } from "@/lib/firebase/session";

export async function login(idToken: string) {
  const { auth } = firebase();
  const decoded = await auth.verifyIdToken(
    z.string().min(1).max(10000).parse(idToken),
  );
  if (Date.now() / 1000 - decoded.auth_time > 300)
    throw new Error("Please sign in again.");
  const expiresIn = 5 * 86400000;
  const session = await auth.createSessionCookie(idToken, { expiresIn });
  (await cookies()).set("recall-session", session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresIn / 1000,
  });
}
export async function logout() {
  (await cookies()).delete("recall-session");
}

export async function snapshot(selected = ""): Promise<Snapshot> {
  const caller = await user();
  const { db } = firebase();
  const spacesResult = await db
    .collection("spaces")
    .where("members", "array-contains", caller.uid)
    .get();
  const spaces = spacesResult.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id }) as Space,
  );
  const spaceId = spaces.some((space) => space.id === selected)
    ? selected
    : (spaces[0]?.id ?? "");
  if (!spaceId)
    return {
      uid: caller.uid,
      email: caller.email ?? "",
      spaces,
      spaceId,
      objects: [],
      records: {},
    };
  const [objects, records] = await Promise.all([
    db.collection("objects").where("spaceId", "==", spaceId).get(),
    db
      .collection("spaces")
      .doc(spaceId)
      .collection("study")
      .doc(caller.uid)
      .collection("records")
      .get(),
  ]);
  return {
    uid: caller.uid,
    email: caller.email ?? "",
    spaces,
    spaceId,
    objects: objects.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }) as RecallObject)
      .filter(
        (obj) =>
          !obj.reported ||
          obj.ownerId === caller.uid ||
          spaces.find((space) => space.id === spaceId)?.ownerId === caller.uid,
      )
      .sort((a, b) => b.updatedAt - a.updatedAt),
    records: Object.fromEntries(
      records.docs.map((doc) => [doc.id, doc.data() as StudyRecord]),
    ),
  };
}
export async function createSpace(name: string) {
  const caller = await user();
  const doc = await firebase()
    .db.collection("spaces")
    .add({
      name: z.string().trim().min(1).max(80).parse(name),
      ownerId: caller.uid,
      members: [caller.uid],
    });
  return doc.id;
}
export async function addMember(spaceId: string, email: string) {
  const { caller, space } = await authorized(spaceId);
  if (space.ownerId !== caller.uid)
    throw new Error("Only the Space owner can add members.");
  const member = await firebase().auth.getUserByEmail(z.email().parse(email));
  const { FieldValue } = await import("firebase-admin/firestore");
  await firebase()
    .db.collection("spaces")
    .doc(spaceId)
    .update({ members: FieldValue.arrayUnion(member.uid) });
}
export async function saveObject(
  spaceId: string,
  raw: unknown,
  objectId?: string,
  version?: number,
) {
  const { caller } = await authorized(spaceId);
  const input = objectInput.parse(raw);
  const { db } = firebase();
  const ref = objectId
    ? db.collection("objects").doc(idSchema.parse(objectId))
    : db.collection("objects").doc();
  await db.runTransaction(async (tx) => {
    const existing = await tx.get(ref);
    if (
      objectId &&
      (!existing.exists ||
        existing.data()?.spaceId !== spaceId ||
        existing.data()?.ownerId !== caller.uid)
    )
      throw new Error("Object not found or not editable.");
    if (existing.exists && existing.data()?.version !== version)
      throw new Error(
        "This object changed. Reload before saving; your draft is still here.",
      );
    if (existing.exists && existing.data()?.kind !== input.kind)
      throw new Error("An object's type cannot be changed.");
    const examRef = db.collection("exam_owners").doc(caller.uid);
    if (input.kind === "exam") {
      const exam = await tx.get(examRef);
      if (exam.exists && exam.data()?.objectId !== ref.id)
        throw new Error(
          "You can own one exam. Edit your existing exam instead.",
        );
    }
    const links = [...new Set(input.links)].filter((id) => id !== ref.id);
    for (const targetId of links) {
      const target = await tx.get(db.collection("objects").doc(targetId));
      if (
        !target.exists ||
        target.data()?.spaceId !== spaceId ||
        target.data()?.archived ||
        target.data()?.reported
      )
        throw new Error("A linked object is unavailable in this Space.");
    }
    const previousEdges = await tx.get(
      db.collection("object_links").where("sourceId", "==", ref.id),
    );
    const value = {
      ...input,
      links,
      id: ref.id,
      spaceId,
      ownerId: caller.uid,
      version: (existing.data()?.version ?? 0) + 1,
      updatedAt: Date.now(),
      archived: existing.data()?.archived ?? false,
      reported: existing.data()?.reported ?? false,
      text: plainText(input.body),
    };
    tx.set(ref, value);
    tx.set(ref.collection("revisions").doc(String(value.version)), value);
    for (const edge of previousEdges.docs) tx.delete(edge.ref);
    for (const targetId of links)
      tx.set(db.collection("object_links").doc(`${ref.id}_${targetId}`), {
        spaceId,
        sourceId: ref.id,
        targetId,
        relationType: "references",
      });
    if (input.kind === "exam") tx.set(examRef, { objectId: ref.id });
  });
  return ref.id;
}
export async function changeObject(
  spaceId: string,
  objectId: string,
  action: "archive" | "restore" | "report" | "resolve",
) {
  const { caller, space } = await authorized(spaceId);
  const ref = firebase().db.collection("objects").doc(idSchema.parse(objectId));
  await firebase().db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.data();
    if (!data || data.spaceId !== spaceId) throw new Error("Object not found.");
    if (
      action === "resolve"
        ? space.ownerId !== caller.uid
        : action !== "report" && data.ownerId !== caller.uid
    )
      throw new Error("You cannot perform this action.");
    if (!["archive", "restore", "report", "resolve"].includes(action))
      throw new Error("Invalid action.");
    const next = {
      ...data,
      ...(action === "report" || action === "resolve"
        ? { reported: action === "report" }
        : { archived: action === "archive" }),
      version: data.version + 1,
      updatedAt: Date.now(),
    };
    tx.set(ref, next);
    tx.set(ref.collection("revisions").doc(String(next.version)), next);
  });
}

export async function submitAnswer(
  spaceId: string,
  objectId: string,
  answers: string[],
  attemptId: string,
) {
  const { caller } = await authorized(spaceId);
  idSchema.parse(objectId);
  idSchema.parse(attemptId);
  z.array(z.string().max(500)).max(20).parse(answers);
  const { db } = firebase();
  const base = db
    .collection("spaces")
    .doc(spaceId)
    .collection("study")
    .doc(caller.uid);
  return db.runTransaction(async (tx) => {
    const attemptRef = base.collection("attempts").doc(attemptId);
    const prior = await tx.get(attemptRef);
    if (prior.exists) {
      if (prior.data()?.objectId !== objectId)
        throw new Error("Attempt identifier already used.");
      return prior.data() as Attempt;
    }
    const question = await tx.get(db.collection("objects").doc(objectId));
    const data = question.data() as RecallObject | undefined;
    if (
      !data ||
      data.spaceId !== spaceId ||
      data.kind !== "question" ||
      data.archived ||
      data.reported
    )
      throw new Error("Question unavailable.");
    objectInput.parse(data);
    const recordRef = base.collection("records").doc(objectId);
    const record = await tx.get(recordRef);
    const correct = grade(data, answers);
    // The record as it stood before this attempt is kept on the attempt so a
    // later self-grade (rateAttempt) can recompute the schedule from the same
    // base instead of compounding on top of the auto-graded one.
    const result: Attempt = {
      correct,
      expected: data.answers,
      objectId,
      answeredAt: Date.now(),
      previous: (record.data() as StudyRecord | undefined) ?? null,
      quality: autoQuality(correct),
    };
    tx.set(
      recordRef,
      schedule(result.previous ?? undefined, result.quality, result.answeredAt),
    );
    tx.set(attemptRef, result);
    return result;
  });
}

export async function rateAttempt(
  spaceId: string,
  attemptId: string,
  qualityGrade: number,
) {
  const { caller } = await authorized(spaceId);
  idSchema.parse(attemptId);
  quality.parse(qualityGrade);
  const base = firebase()
    .db.collection("spaces")
    .doc(spaceId)
    .collection("study")
    .doc(caller.uid);
  await firebase().db.runTransaction(async (tx) => {
    const attemptRef = base.collection("attempts").doc(attemptId);
    const attempt = (await tx.get(attemptRef)).data() as Attempt | undefined;
    if (!attempt) throw new Error("Attempt not found.");
    tx.set(
      base.collection("records").doc(attempt.objectId),
      schedule(attempt.previous ?? undefined, qualityGrade, attempt.answeredAt),
    );
    tx.update(attemptRef, { quality: qualityGrade });
  });
}

export async function startSession(
  spaceId: string,
  scope: string,
  count: number,
  mode: "practice" | "simulated_exam",
  // FR-11: simulated_exam additionally requires a user-configured time limit;
  // practice mode ignores this and never carries a deadline.
  durationSeconds?: number,
) {
  const data = await snapshot(spaceId);
  if (data.spaceId !== spaceId) throw new Error("Space not found.");
  z.number().int().min(1).max(100).parse(count);
  z.enum(["practice", "simulated_exam"]).parse(mode);
  const duration =
    mode === "simulated_exam"
      ? examDurationSeconds.parse(durationSeconds)
      : null;
  const scopeObject = data.objects.find((obj) => obj.id === scope);
  const questions = data.objects
    .filter(
      (obj) =>
        obj.kind === "question" &&
        !obj.archived &&
        !obj.reported &&
        (scope === "all" ||
          (scope === "due" &&
            (!data.records[obj.id] ||
              data.records[obj.id].due <= Date.now())) ||
          (scopeObject &&
            (scopeObject.links.includes(obj.id) ||
              obj.links.includes(scopeObject.id)))),
    )
    .slice(0, count);
  if (!questions.length)
    throw new Error(
      "No questions match this scope. Add questions or choose another scope.",
    );
  const ref = firebase().db.collection("sessions").doc();
  const session: StudySession = {
    id: ref.id,
    spaceId,
    uid: data.uid,
    mode,
    questions,
    answers: {},
    deadline: duration != null ? Date.now() + duration * 1000 : null,
    results: null,
  };
  await ref.set(session);
  return session;
}
export async function loadSession(sessionId: string): Promise<StudySession> {
  const caller = await user();
  const doc = await firebase()
    .db.collection("sessions")
    .doc(idSchema.parse(sessionId))
    .get();
  const session = doc.data() as StudySession | undefined;
  if (!session || session.uid !== caller.uid)
    throw new Error("Session not found.");
  await authorized(session.spaceId);
  return session;
}
export async function saveSessionAnswer(
  sessionId: string,
  objectId: string,
  answers: string[],
) {
  const session = await loadSession(sessionId);
  idSchema.parse(objectId);
  z.array(z.string().max(500)).max(20).parse(answers);
  if (!session.questions.some((question) => question.id === objectId))
    throw new Error("Question not in this session.");
  const ref = firebase().db.collection("sessions").doc(sessionId);
  await firebase().db.runTransaction(async (tx) => {
    const current = (await tx.get(ref)).data() as StudySession;
    if (current.results)
      throw new Error("Session has ended. Submit saved answers.");
    // spec.md §2.4.3: an answer arriving within `deadline + EXAM_GRACE_MS` is
    // still accepted (a slow network shouldn't forfeit a real answer); one
    // arriving after the grace window is rejected with a recognizable code so
    // the client can show a clear "time's up" message instead of a generic one.
    if (graceExpired(current.deadline, Date.now()))
      throw new Error(
        `${SESSION_EXPIRED}: Time's up. The exam's grace window has closed, so this answer wasn't saved.`,
      );
    tx.update(ref, { [`answers.${objectId}`]: answers });
  });
}
export async function finishSession(sessionId: string) {
  const session = await loadSession(sessionId);
  const { db } = firebase();
  const ref = db.collection("sessions").doc(sessionId);
  return db.runTransaction(async (tx) => {
    const current = (await tx.get(ref)).data() as StudySession;
    if (current.results) return current.results;
    // spec.md §2.4.3: a late finish is "trimmed to answers recorded prior to
    // expiration," not rejected outright. saveSessionAnswer above already
    // refuses any write once `graceExpired(current.deadline, ...)` is true, so
    // `current.answers` can never contain anything saved after the grace
    // window closed — scoring off it here is the trim, by construction, for
    // both an on-time finish and one that arrives arbitrarily late.
    const base = db
      .collection("spaces")
      .doc(session.spaceId)
      .collection("study")
      .doc(session.uid);
    const records = await Promise.all(
      current.questions.map((question) =>
        tx.get(base.collection("records").doc(question.id)),
      ),
    );
    const results = current.questions.map((question) => ({
      objectId: question.id,
      correct: grade(question, current.answers[question.id] ?? []),
      expected: question.answers,
    }));
    results.forEach((result, index) => {
      // Practice answers were already scheduled by submitAnswer, using these stable IDs.
      if (current.mode === "simulated_exam")
        tx.set(
          records[index].ref,
          schedule(
            records[index].data() as StudyRecord | undefined,
            autoQuality(result.correct),
            Date.now(),
          ),
        );
    });
    tx.update(ref, { results });
    return results;
  });
}
