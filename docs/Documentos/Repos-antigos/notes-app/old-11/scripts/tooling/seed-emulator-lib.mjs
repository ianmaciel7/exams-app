// Pure helpers for seeding the local Firebase emulators with a Google-linked
// user and a sample exam. The Auth emulator's "Sign-in with Google" widget only
// lists accounts that carry the `google.com` provider, so users are created
// through `signInWithIdp` with a mock id_token instead of `signUp`.

export const AUTH_URL = "http://127.0.0.1:9099";
export const FIRESTORE_HOST = "http://127.0.0.1:8080";
export const DEFAULT_USER = { email: "demo@notesapp.dev", name: "Demo User" };
export const SPACE_ID = "demo-space";
export const EXAM_ID = "gcp-cdl";

// The emulator treats this bearer token as an admin and skips security rules.
export const ADMIN_HEADERS = {
  Authorization: "Bearer owner",
  "Content-Type": "application/json",
};

export function toRestValue(value) {
  if (value === null) {
    return { nullValue: null };
  }
  if (typeof value === "string") {
    return { stringValue: value };
  }
  if (typeof value === "boolean") {
    return { booleanValue: value };
  }
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toRestValue) } };
  }
  return { mapValue: { fields: toRestFields(value) } };
}

export function toRestFields(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, toRestValue(value)])
  );
}

/** OIDC claim names (snake_case) kept out of declared identifiers. */
const CLAIMS = { emailVerified: "email_verified" };

/** Mock Google credential body understood by the Auth emulator. */
export function googleIdpPostBody({ email, name }) {
  const idToken = JSON.stringify({
    sub: `google-${email}`,
    email,
    [CLAIMS.emailVerified]: true,
    name,
  });
  return `providerId=google.com&id_token=${idToken}`;
}

// One sample per question type (ADR 0018). `examId` and `orderIndex` are added
// when the documents are built; nothing here uses the legacy ExamTopics shape.
const QUESTIONS = [
  {
    id: "q1",
    type: "single-choice",
    prompt:
      "Your company is migrating an on-premises web application to Google Cloud. The development team wants to deploy microservices packaged as containers without managing virtual machines or Kubernetes cluster infrastructure, while ensuring that costs scale to zero during non-business hours. Which service should you recommend?",
    options: [
      {
        id: "a",
        text: "Cloud Run",
        explanation:
          "Cloud Run is a fully managed serverless compute platform that runs containers directly and automatically scales instances up or down to zero based on traffic.",
      },
      {
        id: "b",
        text: "Compute Engine with Managed Instance Groups",
        explanation:
          "Compute Engine requires operating system management, patching, and baseline VM maintenance.",
      },
      {
        id: "c",
        text: "Google Kubernetes Engine (GKE) Standard",
        explanation:
          "GKE Standard requires ongoing cluster administration, node pool management, and worker node resource costs.",
      },
      {
        id: "d",
        text: "App Engine Flexible Environment",
        explanation:
          "App Engine Flexible runs containers on underlying Compute Engine VMs with slower scaling and minimum instance costs.",
      },
    ],
    correctAnswer: "a",
    explanation: {
      text: "Cloud Run provides a fully managed serverless runtime for containerized applications with automated scale-to-zero capability.",
      referenceUrls: [
        "https://cloud.google.com/run/docs/overview/what-is-cloud-run",
      ],
      answerProvenance: "official",
    },
  },
  {
    id: "q2",
    type: "multiple-choice",
    prompt:
      "Your organization needs to build an event-driven data ingestion pipeline that scales automatically and requires minimal operational overhead. Which two Google Cloud services are fully serverless? (Choose two.)",
    options: [
      {
        id: "a",
        text: "Cloud Run",
        explanation: "Serverless container compute service.",
      },
      {
        id: "b",
        text: "Compute Engine",
        explanation:
          "Infrastructure-as-a-Service (IaaS) requiring VM management.",
      },
      {
        id: "c",
        text: "Cloud Functions",
        explanation: "Event-driven serverless Functions-as-a-Service (FaaS).",
      },
      {
        id: "d",
        text: "Persistent Disk",
        explanation:
          "Block storage attached to Compute Engine virtual machines.",
      },
      {
        id: "e",
        text: "Cloud Bare Metal",
        explanation:
          "Dedicated hardware infrastructure for specialized enterprise workloads.",
      },
    ],
    correctAnswer: ["a", "c"],
    explanation: {
      text: "Cloud Run and Cloud Functions are both fully managed serverless compute offerings in Google Cloud that execute workloads without server management.",
      referenceUrls: ["https://cloud.google.com/serverless"],
      answerProvenance: "official",
    },
  },
  {
    id: "q3",
    type: "true-false",
    prompt:
      "According to Google Cloud best practices, Cloud Run automatically scales to zero container instances when there are no incoming requests, eliminating compute charges during idle periods.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctAnswer: "true",
    explanation: {
      text: "Scaling to zero when idle is a core characteristic of Cloud Run, ensuring customers only pay when requests are actively being processed.",
      referenceUrls: [
        "https://cloud.google.com/run/docs/configuring/min-instances",
      ],
      answerProvenance: "official",
    },
  },
  {
    id: "q4",
    type: "fill-blank",
    prompt:
      "Your company requires a lightweight, event-driven serverless platform to execute background code triggered by Cloud Storage bucket events and Pub/Sub messages without provisioning infrastructure. Complete the official Google Cloud service name: Cloud ____.",
    correctAnswer: ["Functions", "functions", "Function", "function"],
    explanation: {
      text: "Cloud Functions is Google Cloud's event-driven serverless execution environment.",
      referenceUrls: [
        "https://cloud.google.com/functions/docs/concepts/overview",
      ],
      answerProvenance: "official",
    },
  },
  {
    id: "q5",
    type: "matching",
    prompt:
      "An architect is designing an enterprise workload on Google Cloud. Match each Google Cloud service with its primary service category.",
    leftItems: [
      { id: "l1", text: "Cloud Run" },
      { id: "l2", text: "Cloud SQL" },
      { id: "l3", text: "Cloud Storage" },
    ],
    rightItems: [
      { id: "r1", text: "Serverless Compute" },
      { id: "r2", text: "Managed Relational Database" },
      { id: "r3", text: "Unstructured Object Storage" },
      { id: "r4", text: "Software-Defined Networking" },
    ],
    correctAnswer: { l1: "r1", l2: "r2", l3: "r3" },
    explanation: {
      text: "Cloud Run provides serverless container compute, Cloud SQL provides fully managed relational databases (MySQL/PostgreSQL/SQL Server), and Cloud Storage provides object storage.",
      referenceUrls: ["https://cloud.google.com/products"],
      answerProvenance: "official",
    },
  },
  {
    id: "q6",
    type: "drag-and-drop",
    prompt:
      "You are deploying a secure, multi-tier web application architecture on Google Cloud. Place the architectural components in the correct sequence along the inbound request handling flow (from user ingress to backend data persistence).",
    items: [
      { id: "i1", text: "External Application Load Balancer" },
      { id: "i2", text: "Cloud Run Microservice" },
      { id: "i3", text: "Cloud SQL Database" },
      { id: "i4", text: "Pub/Sub Asynchronous Queue" },
    ],
    slots: [
      { id: "s1", label: "Ingress Tier (First)" },
      { id: "s2", label: "Compute Tier (Second)" },
      { id: "s3", label: "Persistence Tier (Third)" },
    ],
    correctAnswer: { s1: "i1", s2: "i2", s3: "i3" },
    explanation: {
      text: "Client requests enter via the External Application Load Balancer, route to the serverless container on Cloud Run, which queries the Cloud SQL relational database.",
      referenceUrls: [
        "https://cloud.google.com/architecture/serverless-three-tier-web-app",
      ],
      answerProvenance: "official",
    },
  },
  {
    id: "q7",
    type: "hotspot",
    prompt:
      "Review the three-tier web application architecture diagram below. Identify and select the component responsible for storing relational transactional data.",
    image: {
      url: "/seed/architecture.svg",
      alt: "Diagram with an external load balancer on the left, a compute service in the middle, and a database on the right",
    },
    areas: [
      {
        id: "lb",
        label: "Load balancer",
        shape: { kind: "rect", x: 5, y: 35, width: 20, height: 30 },
      },
      {
        id: "svc",
        label: "Compute Service",
        shape: { kind: "rect", x: 40, y: 35, width: 20, height: 30 },
      },
      {
        id: "db",
        label: "Transactional Database",
        shape: { kind: "rect", x: 75, y: 35, width: 20, height: 30 },
        explanation:
          "The database tier (Cloud SQL) stores persistent relational data for the application.",
      },
    ],
    correctAnswer: ["db"],
    explanation: {
      text: "The database component at the right end of the request pipeline provides transactional persistence.",
      referenceUrls: ["https://cloud.google.com/sql/docs"],
      answerProvenance: "official",
    },
  },
  {
    id: "q8",
    type: "case-study",
    prompt:
      "Analyze the company requirements and constraints to select the appropriate architectural solutions.",
    title: "Case Study: RetailCo Modernization & Scalability",
    context:
      "RetailCo operates an on-premises web application that experiences severe traffic fluctuations during seasonal promotional events. Infrastructure maintenance and server patching are consuming excessive engineering hours.",
    sections: [
      {
        id: "business-requirements",
        title: "Business Requirements",
        content:
          "The company must reduce operational overhead, eliminate payments for idle compute resources during low-traffic periods, and maintain 99.99% availability during traffic spikes.",
      },
      {
        id: "technical-constraints",
        title: "Technical Constraints",
        content:
          "The engineering team has packaged the application into lightweight container images. The team does not have dedicated Kubernetes administrators and requires a solution that scales down to zero instances when there are no requests.",
      },
    ],
    parts: [
      {
        id: "p1",
        type: "single-choice",
        prompt:
          "Your organization needs to deploy the containerized web application in accordance with the technical constraints and business goals. Which Google Cloud service should you recommend?",
        options: [
          {
            id: "a",
            text: "Cloud Run",
            explanation:
              "Cloud Run is a fully managed serverless platform that runs containers directly, scales to zero when idle, and requires zero cluster management.",
          },
          {
            id: "b",
            text: "Google Kubernetes Engine (GKE) Standard",
            explanation:
              "GKE Standard requires managing cluster nodes, upgrades, and incurs ongoing control plane/worker baseline costs.",
          },
          {
            id: "c",
            text: "Compute Engine with Managed Instance Groups",
            explanation:
              "Compute Engine VMs require OS updates, patching, and do not scale to zero instances immediately without baseline infrastructure costs.",
          },
          {
            id: "d",
            text: "Bare Metal Solution",
            explanation:
              "Bare Metal Solution is designed for specialized legacy enterprise workloads and requires maximum operational overhead.",
          },
        ],
        explanation:
          "Cloud Run satisfies all criteria: it is serverless, executes containerized workloads without infrastructure management, and scales automatically to zero.",
      },
      {
        id: "p2",
        type: "single-choice",
        prompt:
          "To distribute incoming global user requests across multiple Cloud Run regions with integrated Google Cloud Armor DDoS protection and SSL termination, which networking component should you configure?",
        options: [
          {
            id: "a",
            text: "External Application Load Balancer",
            explanation:
              "Correct. A global External Application Load Balancer routes traffic to multi-region serverless backends like Cloud Run and integrates with Cloud Armor.",
          },
          {
            id: "b",
            text: "Network Load Balancer (passthrough)",
            explanation:
              "Incorrect. Network Load Balancers operate at Layer 4 and cannot terminate SSL or route directly to serverless container backends.",
          },
          {
            id: "c",
            text: "Cloud NAT Gateway",
            explanation:
              "Incorrect. Cloud NAT is only for outbound traffic from private resources, not inbound global ingress.",
          },
          {
            id: "d",
            text: "Cloud VPN Tunnel",
            explanation:
              "Incorrect. Cloud VPN connects on-premises networks securely to Google Cloud VPCs, not public web traffic.",
          },
        ],
        explanation:
          "A Global External Application Load Balancer routes traffic to serverless Network Endpoint Groups (NEGs) pointing to Cloud Run across regions.",
      },
    ],
    correctAnswer: { p1: "a", p2: "a" },
  },
  {
    id: "q9",
    type: "dropdown",
    prompt:
      "A systems architect is selecting Google Cloud storage and analytics products for an enterprise application. From each drop-down menu, select the option that satisfies the operational requirements.",
    dropdowns: [
      {
        id: "dd1",
        label: "Globally consistent relational transactions with 99.999% SLA",
        options: [
          { id: "spanner", text: "Cloud Spanner" },
          { id: "csql", text: "Cloud SQL" },
          { id: "cstore", text: "Cloud Storage" },
        ],
      },
      {
        id: "dd2",
        label:
          "Serverless petabyte-scale enterprise data warehouse with SQL support",
        options: [
          { id: "bq", text: "BigQuery" },
          { id: "bt", text: "Cloud Bigtable" },
          { id: "dp", text: "Cloud Dataproc" },
        ],
      },
    ],
    correctAnswer: { dd1: "spanner", dd2: "bq" },
    explanation: {
      text: "Cloud Spanner offers globally distributed ACID transactions with up to 99.999% availability, and BigQuery is Google's fully managed serverless enterprise data warehouse.",
      referenceUrls: [
        "https://cloud.google.com/spanner",
        "https://cloud.google.com/bigquery",
      ],
      answerProvenance: "official",
    },
  },
  {
    id: "q10",
    type: "ordering",
    prompt:
      "You need to automate continuous integration and deployment for a Cloud Run containerized application using Cloud Build. Place the build pipeline steps in the correct operational sequence from first to last.",
    items: [
      { id: "build", text: "Build container image using Dockerfile" },
      { id: "test", text: "Execute automated unit and integration tests" },
      { id: "push", text: "Push container image to Artifact Registry" },
      {
        id: "deploy",
        text: "Deploy new revision to Cloud Run with traffic routing",
      },
    ],
    correctAnswer: ["test", "build", "push", "deploy"],
    explanation: {
      text: "Best practice CI/CD runs automated test suites first, packages verified code into container images, stores artifacts in Artifact Registry, and finally releases to Cloud Run.",
      referenceUrls: [
        "https://cloud.google.com/build/docs/deploying-builds/deploy-cloud-run",
      ],
      answerProvenance: "official",
    },
  },
  {
    id: "q11",
    type: "matrix",
    prompt:
      "For each statement regarding Google Cloud IAM best practices, select Yes if the statement is true, or No if it is false.",
    columns: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    rows: [
      {
        id: "r1",
        prompt:
          "Principle of Least Privilege requires granting predefined or custom roles instead of basic roles (Owner, Editor, Viewer).",
      },
      {
        id: "r2",
        prompt:
          "Service account user keys should be committed to public Git repositories for easy developer access.",
      },
      {
        id: "r3",
        prompt:
          "IAM Conditions allow access permissions to be constrained based on date/time, request IP, or resource destination.",
      },
    ],
    correctAnswer: { r1: "yes", r2: "no", r3: "yes" },
    explanation: {
      text: "Google Cloud strongly advises against using primitive/basic roles in production and forbids storing service account keys in source control. IAM Conditions provide attribute-based access control.",
      referenceUrls: ["https://cloud.google.com/iam/docs/understanding-roles"],
      answerProvenance: "official",
    },
  },
  {
    id: "q12",
    type: "simulation",
    prompt:
      "A developer must configure and deploy a container image to Google Cloud Run in the us-central1 region with public unauthenticated invocations allowed.",
    scenarioDescription:
      "Use the Google Cloud CLI to deploy service 'web-service' with image 'gcr.io/demo/web-service:v1' allowing unauthenticated access in region 'us-central1'.",
    terminalPrompt: "admin@cloudshell:~$",
    allowedCommands: [
      "gcloud run deploy web-service --image gcr.io/demo/web-service:v1 --region us-central1 --allow-unauthenticated",
    ],
    correctAnswer: [
      "gcloud run deploy web-service --image gcr.io/demo/web-service:v1 --region us-central1 --allow-unauthenticated",
    ],
    explanation: {
      text: "The command 'gcloud run deploy' deploys container images to Cloud Run; '--allow-unauthenticated' permits public traffic, and '--region' sets the location.",
      referenceUrls: [
        "https://cloud.google.com/sdk/gcloud/reference/run/deploy",
      ],
      answerProvenance: "official",
    },
  },
];

/** Documents (relative to the Firestore root) for one user's sample exam. */
export function buildExamSeed({ uid, now }) {
  const spacePath = `users/${uid}/spaces/${SPACE_ID}`;
  const base = {
    schemaVersion: 4,
    spaceId: SPACE_ID,
    lifecycleState: "active",
    stateVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
  const documents = [
    {
      path: spacePath,
      data: {
        id: SPACE_ID,
        ownerId: uid,
        name: "Cloud Study",
        description: "",
        icon: "folder",
        schemaVersion: 1,
        stateVersion: 1,
        createdAt: now,
        updatedAt: now,
      },
    },
    {
      path: `${spacePath}/objects/${EXAM_ID}`,
      data: {
        ...base,
        objectTypeId: "exam",
        title: "Google Cloud Digital Leader",
        properties: {
          provider: "Google Cloud",
          code: "CDL",
          totalQuestionsCount: QUESTIONS.length,
          passingScorePercentage: 70,
          questionIds: QUESTIONS.map((question) => question.id),
        },
      },
    },
  ];

  for (const [orderIndex, { id, ...fields }] of QUESTIONS.entries()) {
    const properties = { ...fields, examId: EXAM_ID, orderIndex };
    documents.push(
      {
        path: `${spacePath}/objects/${id}`,
        data: {
          ...base,
          objectTypeId: "question",
          title: `Question ${orderIndex + 1}`,
          properties,
        },
      },
      {
        // Placeholder memory values satisfy firestore.rules (difficulty 1..10);
        // scheduleCard ignores them while the card is New.
        path: `${spacePath}/cards/card-${id}`,
        data: {
          schemaVersion: 4,
          spaceId: SPACE_ID,
          questionId: id,
          cardIndex: 0,
          state: 0,
          due: now,
          stability: 0,
          difficulty: 5,
          elapsedDays: 0,
          scheduledDays: 0,
          reps: 0,
          lapses: 0,
          lastReview: null,
          stateVersion: 1,
          updatedAt: now,
        },
      }
    );
  }

  return documents;
}

async function ensureOk(response, label) {
  if (!response.ok) {
    throw new Error(
      `${label} failed: ${response.status} ${await response.text()}`
    );
  }
  return response;
}

/**
 * Creates (or links) the Google identity for `email` and returns its uid.
 * An existing account with the same email keeps its uid, so seeded data stays
 * attached to the account you already use.
 */
export async function ensureGoogleUser({ fetchFn, user }) {
  const response = await ensureOk(
    await fetchFn(
      `${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=seed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestUri: "http://localhost",
          returnSecureToken: true,
          returnIdpCredential: true,
          postBody: googleIdpPostBody(user),
        }),
      }
    ),
    `signInWithIdp(${user.email})`
  );
  return (await response.json()).localId;
}

export async function writeDocument({ fetchFn, projectId, path, data }) {
  const url = `${FIRESTORE_HOST}/v1/projects/${projectId}/databases/(default)/documents/${path}`;
  await ensureOk(
    await fetchFn(url, {
      method: "PATCH",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ fields: toRestFields(data) }),
    }),
    `write ${path}`
  );
}

/** Seeds every user; returns `{ email, uid, url }` per user. */
export async function seedEmulator({
  fetchFn = fetch,
  projectId,
  users,
  now = new Date(),
}) {
  const results = [];
  for (const user of users) {
    const uid = await ensureGoogleUser({ fetchFn, user });
    for (const { path, data } of buildExamSeed({ uid, now })) {
      await writeDocument({ fetchFn, projectId, path, data });
    }
    results.push({
      email: user.email,
      uid,
      url: `/${SPACE_ID}/exams/${EXAM_ID}`,
    });
  }
  return results;
}

/** Parses repeated `--email <address>` flags; falls back to the demo user. */
export function parseUsers(argv) {
  const users = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--email" && argv[index + 1]) {
      const email = argv[index + 1];
      users.push({ email, name: email.split("@")[0] });
      index += 1;
    }
  }
  return users.length > 0 ? users : [DEFAULT_USER];
}
