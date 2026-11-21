import type { QuestionObject } from "@/types/object";
import type {
  QuestionProperties,
  QuestionPropertiesOf,
  QuestionType,
} from "@/types/question";

const base = { examId: "exam-1", orderIndex: 0 };

export const singleChoiceFixture: QuestionPropertiesOf<"single-choice"> = {
  ...base,
  type: "single-choice",
  prompt: "Which service runs stateless containers without servers?",
  options: [
    { id: "a", text: "Compute Engine", explanation: "You manage the VMs." },
    { id: "b", text: "Cloud Run" },
    { id: "c", text: "Cloud SQL" },
  ],
  correctAnswer: "b",
  explanation: {
    text: "Cloud Run is serverless.",
    referenceUrls: ["https://cloud.google.com/run/docs"],
    answerProvenance: "official",
  },
};

export const multipleChoiceFixture: QuestionPropertiesOf<"multiple-choice"> = {
  ...base,
  type: "multiple-choice",
  prompt: "Select every serverless product.",
  options: [
    { id: "a", text: "Cloud Run" },
    { id: "b", text: "Compute Engine" },
    { id: "c", text: "Cloud Functions" },
  ],
  correctAnswer: ["a", "c"],
};

export const trueFalseFixture: QuestionPropertiesOf<"true-false"> = {
  ...base,
  type: "true-false",
  prompt: "Cloud Run scales to zero.",
  options: [
    { id: "true", text: "True" },
    { id: "false", text: "False" },
  ],
  correctAnswer: "true",
};

export const fillBlankFixture: QuestionPropertiesOf<"fill-blank"> = {
  ...base,
  type: "fill-blank",
  prompt: "The managed container platform is Cloud ____.",
  correctAnswer: ["Run", "Cloud Run"],
};

export const matchingFixture: QuestionPropertiesOf<"matching"> = {
  ...base,
  type: "matching",
  prompt: "Match each service with its category.",
  leftItems: [
    { id: "l1", text: "Cloud Run" },
    { id: "l2", text: "Cloud SQL" },
  ],
  rightItems: [
    { id: "r1", text: "Compute" },
    { id: "r2", text: "Database" },
    { id: "r3", text: "Networking" },
  ],
  correctAnswer: { l1: "r1", l2: "r2" },
};

export const dragAndDropFixture: QuestionPropertiesOf<"drag-and-drop"> = {
  ...base,
  type: "drag-and-drop",
  prompt: "Place each tier in order.",
  items: [
    { id: "i1", text: "Edge" },
    { id: "i2", text: "Service" },
    { id: "i3", text: "Storage" },
  ],
  slots: [
    { id: "s1", label: "First" },
    { id: "s2", label: "Second" },
  ],
  correctAnswer: { s1: "i1", s2: "i2" },
};

export const hotspotFixture: QuestionPropertiesOf<"hotspot"> = {
  ...base,
  type: "hotspot",
  prompt: "Click the load balancer.",
  image: {
    url: "https://example.com/diagram.png",
    alt: "Architecture diagram",
  },
  areas: [
    {
      id: "lb",
      label: "Load balancer",
      shape: { kind: "rect", x: 10, y: 10, width: 20, height: 20 },
    },
    {
      id: "db",
      label: "Database",
      shape: { kind: "circle", cx: 70, cy: 70, r: 10 },
    },
  ],
  correctAnswer: ["lb"],
};

export const caseStudyFixture: QuestionPropertiesOf<"case-study"> = {
  ...base,
  type: "case-study",
  prompt: "Answer the questions about the company.",
  title: "Acme migration",
  context: "Acme runs a monolith on-premises.",
  sections: [
    { id: "overview", title: "Overview", content: "Acme sells widgets." },
    { id: "goals", title: "Goals", content: "Reduce operational cost." },
  ],
  parts: [
    {
      id: "p1",
      type: "single-choice",
      prompt: "Which approach lowers operations?",
      options: [
        { id: "a", text: "Serverless" },
        { id: "b", text: "More VMs" },
      ],
    },
    { id: "p2", type: "fill-blank", prompt: "Name the cost model." },
  ],
  correctAnswer: { p1: "a", p2: ["pay per use"] },
};

export const dropdownFixture: QuestionPropertiesOf<"dropdown"> = {
  ...base,
  type: "dropdown",
  prompt: "Select the appropriate storage solution for each requirement.",
  dropdowns: [
    {
      id: "dd1",
      label: "Object Storage",
      options: [
        { id: "cs", text: "Cloud Storage" },
        { id: "pd", text: "Persistent Disk" },
      ],
    },
    {
      id: "dd2",
      label: "Relational Database",
      options: [
        { id: "csql", text: "Cloud SQL" },
        { id: "bt", text: "Bigtable" },
      ],
    },
  ],
  correctAnswer: { dd1: "cs", dd2: "csql" },
};

export const orderingFixture: QuestionPropertiesOf<"ordering"> = {
  ...base,
  type: "ordering",
  prompt: "Order the CI/CD pipeline steps.",
  items: [
    { id: "step1", text: "Commit Code" },
    { id: "step2", text: "Run Tests" },
    { id: "step3", text: "Deploy to Production" },
  ],
  correctAnswer: ["step1", "step2", "step3"],
};

export const matrixFixture: QuestionPropertiesOf<"matrix"> = {
  ...base,
  type: "matrix",
  prompt: "Indicate whether each statement about Cloud Run is True or False.",
  columns: [
    { id: "col_true", label: "True" },
    { id: "col_false", label: "False" },
  ],
  rows: [
    { id: "r1", prompt: "Cloud Run can scale to zero instances." },
    { id: "r2", prompt: "Cloud Run requires Kubernetes management." },
  ],
  correctAnswer: { r1: "col_true", r2: "col_false" },
};

export const simulationFixture: QuestionPropertiesOf<"simulation"> = {
  ...base,
  type: "simulation",
  prompt: "Deploy a container image to Cloud Run using the command line.",
  scenarioDescription: "Deploy image gcr.io/demo/app to service my-app.",
  terminalPrompt: "user@cloudshell:~$",
  allowedCommands: ["gcloud run deploy my-app --image gcr.io/demo/app"],
  correctAnswer: ["gcloud run deploy my-app --image gcr.io/demo/app"],
};

export const QUESTION_FIXTURES: Record<QuestionType, QuestionProperties> = {
  "single-choice": singleChoiceFixture,
  "multiple-choice": multipleChoiceFixture,
  "true-false": trueFalseFixture,
  "fill-blank": fillBlankFixture,
  dropdown: dropdownFixture,
  matching: matchingFixture,
  ordering: orderingFixture,
  "drag-and-drop": dragAndDropFixture,
  hotspot: hotspotFixture,
  matrix: matrixFixture,
  simulation: simulationFixture,
  "case-study": caseStudyFixture,
};

export function makeQuestionObject(
  properties: QuestionProperties,
  id = "q1"
): QuestionObject {
  return {
    id,
    spaceId: "space-1",
    schemaVersion: 4,
    objectTypeId: "question",
    title: `Question ${id}`,
    lifecycleState: "active",
    stateVersion: 1,
    createdAt: null,
    updatedAt: null,
    properties,
  };
}
