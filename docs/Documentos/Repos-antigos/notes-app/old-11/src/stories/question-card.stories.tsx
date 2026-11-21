import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { QuestionCard } from "@/components/notes-app/question/question-card";
import { AuthContext } from "@/lib/auth-context";
import {
  caseStudyFixture,
  dragAndDropFixture,
  fillBlankFixture,
  hotspotFixture,
  makeQuestionObject,
  matchingFixture,
  multipleChoiceFixture,
  singleChoiceFixture,
  trueFalseFixture,
} from "@/lib/exam/question-fixtures";
import messages from "@/messages/en.json";
import type { QuestionProperties } from "@/types/question";

/** Signed-out context: answers are graded locally and nothing is written. */
function StoryProviders({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <AuthContext
        value={{ user: null, isLoading: false, signOutUser: async () => {} }}
      >
        <div className="max-w-2xl p-4">{children}</div>
      </AuthContext>
    </NextIntlClientProvider>
  );
}

function Story({ properties }: { properties: QuestionProperties }) {
  return (
    <StoryProviders>
      <QuestionCard
        spaceId="space-1"
        question={makeQuestionObject(properties, "question-1")}
        card={null}
        index={0}
        total={12}
      />
    </StoryProviders>
  );
}

/** Click an option to see instant feedback, the option notes, and the explanation. */
export const SingleChoice = () => <Story properties={singleChoiceFixture} />;

/** A single-choice question whose prompt and options carry images. */
export const WithImages = () => (
  <Story
    properties={{
      ...singleChoiceFixture,
      promptImage: {
        url: "https://placehold.co/960x540/png",
        alt: "Placeholder architecture diagram",
      },
      options: [
        {
          id: "a",
          text: "Compute Engine",
          imageUrl: "https://placehold.co/320x180/png",
          imageAlt: "Placeholder virtual machine",
        },
        { id: "b", text: "Cloud Run" },
      ],
    }}
  />
);

/** Select every correct option, then confirm with "Check answer". */
export const MultipleChoice = () => (
  <Story properties={multipleChoiceFixture} />
);

export const TrueFalse = () => <Story properties={trueFalseFixture} />;

/** Case, spacing, and Unicode form are ignored; accents are not. */
export const FillBlank = () => <Story properties={fillBlankFixture} />;

export const Matching = () => <Story properties={matchingFixture} />;

/** Drag items into slots, or use the select in each slot with the keyboard. */
export const DragAndDrop = () => <Story properties={dragAndDropFixture} />;

export const Hotspot = () => (
  <Story
    properties={{
      ...hotspotFixture,
      image: {
        url: "https://placehold.co/960x540/png",
        alt: "Placeholder architecture diagram",
      },
    }}
  />
);

export const CaseStudy = () => <Story properties={caseStudyFixture} />;

/** A case study without questions can only be read, then revealed. */
export const CaseStudyRevealOnly = () => (
  <Story properties={{ ...caseStudyFixture, parts: [], correctAnswer: {} }} />
);
