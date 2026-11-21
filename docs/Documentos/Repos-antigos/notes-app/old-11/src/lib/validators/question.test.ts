import { describe, expect, it } from "vitest";
import {
  caseStudyFixture,
  dragAndDropFixture,
  fillBlankFixture,
  hotspotFixture,
  matchingFixture,
  multipleChoiceFixture,
  QUESTION_FIXTURES,
  singleChoiceFixture,
  trueFalseFixture,
} from "@/lib/exam/question-fixtures";
import { QUESTION_TYPES } from "@/types/question";
import { validateQuestionProperties } from "./question";

function fieldErrorsOf(input: unknown) {
  return validateQuestionProperties(input).fieldErrors;
}

describe("validateQuestionProperties: valid questions", () => {
  it.each(QUESTION_TYPES)("accepts a valid %s question", (type) => {
    const result = validateQuestionProperties(QUESTION_FIXTURES[type]);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(QUESTION_FIXTURES[type]);
  });

  it("trims text and keeps optional metadata", () => {
    const result = validateQuestionProperties({
      ...singleChoiceFixture,
      prompt: "  Which one?  ",
      source: { label: "Official guide", url: "https://example.com/guide" },
      difficulty: "hard",
      tags: ["gcp"],
      promptImage: { url: "https://example.com/a.png", alt: "Diagram" },
    });
    expect(result.success).toBe(true);
    expect(result.data?.prompt).toBe("Which one?");
    expect(result.data?.difficulty).toBe("hard");
    expect(result.data?.tags).toEqual(["gcp"]);
    expect(result.data?.promptImage?.alt).toBe("Diagram");
  });

  it("accepts an image on an option and none on the other types", () => {
    const result = validateQuestionProperties({
      ...singleChoiceFixture,
      options: [
        {
          id: "a",
          text: "One",
          imageUrl: "https://example.com/1.png",
          imageAlt: "First",
        },
        { id: "b", text: "Two" },
      ],
      correctAnswer: "a",
    });
    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("promptImage");
  });

  it("accepts a reveal-only case study without parts", () => {
    const result = validateQuestionProperties({
      ...caseStudyFixture,
      parts: [],
      correctAnswer: {},
    });
    expect(result.success).toBe(true);
  });

  it("accepts polygon hotspot areas", () => {
    const result = validateQuestionProperties({
      ...hotspotFixture,
      areas: [
        {
          id: "lb",
          label: "Load balancer",
          shape: {
            kind: "polygon",
            points: [
              { x: 0, y: 0 },
              { x: 50, y: 0 },
              { x: 25, y: 50 },
            ],
          },
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("validateQuestionProperties: invalid input", () => {
  it("rejects non-object input", () => {
    expect(validateQuestionProperties(undefined).error).toBe("invalidInput");
    expect(validateQuestionProperties([]).error).toBe("invalidInput");
  });

  it("rejects an unknown or missing type", () => {
    expect(fieldErrorsOf({ ...singleChoiceFixture, type: "essay" })).toEqual({
      type: "invalidType",
    });
    expect(fieldErrorsOf({ prompt: "x" })).toEqual({ type: "invalidType" });
  });

  it("reports every missing common field", () => {
    const result = validateQuestionProperties({
      type: "fill-blank",
      correctAnswer: ["x"],
    });
    expect(result.error).toBe("validationFailed");
    expect(result.fieldErrors).toEqual({
      prompt: "promptRequired",
      examId: "examIdRequired",
      orderIndex: "invalidOrderIndex",
    });
  });

  it("rejects a negative or fractional order index", () => {
    expect(
      fieldErrorsOf({ ...fillBlankFixture, orderIndex: -1 })?.orderIndex
    ).toBe("invalidOrderIndex");
    expect(
      fieldErrorsOf({ ...fillBlankFixture, orderIndex: 1.5 })?.orderIndex
    ).toBe("invalidOrderIndex");
  });

  it("rejects malformed optional metadata", () => {
    const errors = fieldErrorsOf({
      ...fillBlankFixture,
      promptImage: { url: "javascript:alert(1)", alt: "x" },
      source: { label: "" },
      difficulty: "impossible",
      tags: [1],
      explanation: "text",
    });
    expect(errors).toEqual({
      promptImage: "invalidImage",
      source: "invalidSource",
      difficulty: "invalidMetadata",
      tags: "invalidMetadata",
      explanation: "invalidExplanation",
    });
  });

  it("rejects an unknown provenance and non-https references", () => {
    expect(
      fieldErrorsOf({
        ...fillBlankFixture,
        explanation: { text: "x", referenceUrls: [], answerProvenance: "?" },
      })?.explanation
    ).toBe("invalidProvenance");
    expect(
      fieldErrorsOf({
        ...fillBlankFixture,
        explanation: {
          text: "x",
          referenceUrls: ["http://insecure.example"],
          answerProvenance: "user",
        },
      })?.explanation
    ).toBe("invalidExplanation");
  });

  it("accepts a same-origin image path but not a protocol-relative one", () => {
    const withImage = (url: string) =>
      validateQuestionProperties({
        ...fillBlankFixture,
        promptImage: { url, alt: "Diagram" },
      }).success;
    expect(withImage("/seed/diagram.svg")).toBe(true);
    expect(withImage("//evil.example/x.png")).toBe(false);
  });

  it("rejects image URLs that are not https", () => {
    expect(
      fieldErrorsOf({
        ...fillBlankFixture,
        promptImage: { url: "data:image/png;base64,AAAA", alt: "x" },
      })?.promptImage
    ).toBe("invalidImage");
    expect(
      fieldErrorsOf({
        ...fillBlankFixture,
        promptImage: { url: "https://example.com/a.png" },
      })?.promptImage
    ).toBe("invalidImage");
  });
});

describe("validateQuestionProperties: fields incompatible with the type", () => {
  it("rejects choice fields on fill-blank", () => {
    expect(
      fieldErrorsOf({ ...fillBlankFixture, options: [{ id: "a", text: "A" }] })
    ).toEqual({ options: "incompatibleField" });
  });

  it("rejects areas on a single-choice question", () => {
    expect(
      fieldErrorsOf({ ...singleChoiceFixture, areas: hotspotFixture.areas })
    ).toEqual({ areas: "incompatibleField" });
  });

  it("rejects the legacy fields", () => {
    const errors = fieldErrorsOf({
      ...singleChoiceFixture,
      statement: "old",
      format: "single_choice",
      correctOptionIds: ["b"],
    });
    expect(errors).toEqual({
      statement: "incompatibleField",
      format: "incompatibleField",
      correctOptionIds: "incompatibleField",
    });
  });
});

describe("validateQuestionProperties: choice questions", () => {
  it("requires at least two options", () => {
    expect(
      fieldErrorsOf({
        ...singleChoiceFixture,
        options: [{ id: "a", text: "A" }],
        correctAnswer: "a",
      })?.options
    ).toBe("minOptionsRequired");
  });

  it("rejects malformed options", () => {
    for (const options of ["x", [null], [{ id: "", text: "A" }]]) {
      expect(fieldErrorsOf({ ...singleChoiceFixture, options })?.options).toBe(
        "invalidOptions"
      );
    }
  });

  it("rejects duplicate option ids", () => {
    expect(
      fieldErrorsOf({
        ...singleChoiceFixture,
        options: [
          { id: "a", text: "A" },
          { id: "a", text: "B" },
        ],
        correctAnswer: "a",
      })?.options
    ).toBe("duplicateId");
  });

  it("rejects a correct answer that references no option", () => {
    expect(
      fieldErrorsOf({ ...singleChoiceFixture, correctAnswer: "zzz" })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({ ...singleChoiceFixture, correctAnswer: ["a", "b"] })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
  });

  it("allows several correct answers only in multiple-choice", () => {
    expect(
      validateQuestionProperties(multipleChoiceFixture).data?.correctAnswer
    ).toEqual(["a", "c"]);
    expect(
      fieldErrorsOf({ ...multipleChoiceFixture, correctAnswer: [] })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({ ...multipleChoiceFixture, correctAnswer: ["a", "a"] })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({ ...multipleChoiceFixture, correctAnswer: ["a", "zzz"] })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
  });

  it("requires exactly the fixed true and false options", () => {
    for (const options of [
      [{ id: "true", text: "True" }],
      [
        { id: "true", text: "True" },
        { id: "false", text: "False" },
        { id: "maybe", text: "Maybe" },
      ],
      [
        { id: "yes", text: "Yes" },
        { id: "no", text: "No" },
      ],
    ]) {
      expect(fieldErrorsOf({ ...trueFalseFixture, options })?.options).toBe(
        "trueFalseOptionsInvalid"
      );
    }
  });

  it("requires true-false to have exactly one correct value", () => {
    expect(
      fieldErrorsOf({ ...trueFalseFixture, correctAnswer: "maybe" })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({ ...trueFalseFixture, correctAnswer: ["true", "false"] })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
  });

  it("requires at least one accepted answer for fill-blank", () => {
    expect(
      fieldErrorsOf({ ...fillBlankFixture, correctAnswer: [] })?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({ ...fillBlankFixture, correctAnswer: ["  "] })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({ ...fillBlankFixture, correctAnswer: "Run" })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
  });
});

describe("validateQuestionProperties: matching and drag-and-drop", () => {
  it("requires every left item to be mapped to an existing right item", () => {
    expect(
      fieldErrorsOf({ ...matchingFixture, correctAnswer: { l1: "r1" } })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({
        ...matchingFixture,
        correctAnswer: { l1: "r1", l2: "zzz" },
      })?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({
        ...matchingFixture,
        correctAnswer: { l1: "r1", l2: "r2", l3: "r3" },
      })?.correctAnswer
    ).toBe("invalidCorrectAnswer");
  });

  it("rejects duplicate and missing matching items", () => {
    expect(
      fieldErrorsOf({
        ...matchingFixture,
        leftItems: [
          { id: "l1", text: "A" },
          { id: "l1", text: "B" },
        ],
      })?.leftItems
    ).toBe("duplicateId");
    expect(
      fieldErrorsOf({
        ...matchingFixture,
        rightItems: [{ id: "r1", text: "A" }],
      })?.rightItems
    ).toBe("invalidItems");
  });

  it("requires every slot to hold a distinct existing item", () => {
    expect(
      fieldErrorsOf({ ...dragAndDropFixture, correctAnswer: { s1: "i1" } })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({
        ...dragAndDropFixture,
        correctAnswer: { s1: "i1", s2: "i1" },
      })?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({
        ...dragAndDropFixture,
        correctAnswer: { s1: "i1", s2: "zzz" },
      })?.correctAnswer
    ).toBe("invalidCorrectAnswer");
  });

  it("rejects duplicate or missing slots and items", () => {
    expect(
      fieldErrorsOf({
        ...dragAndDropFixture,
        slots: [
          { id: "s1", label: "A" },
          { id: "s1", label: "B" },
        ],
      })?.slots
    ).toBe("duplicateId");
    expect(fieldErrorsOf({ ...dragAndDropFixture, slots: [] })?.slots).toBe(
      "invalidSlots"
    );
    expect(
      fieldErrorsOf({
        ...dragAndDropFixture,
        items: [
          { id: "i1", text: "A" },
          { id: "i1", text: "B" },
        ],
      })?.items
    ).toBe("duplicateId");
  });
});

describe("validateQuestionProperties: hotspot", () => {
  it("requires an image", () => {
    const { image: _image, ...withoutImage } = hotspotFixture;
    expect(fieldErrorsOf(withoutImage)?.image).toBe("imageRequired");
    expect(
      fieldErrorsOf({ ...hotspotFixture, image: { url: "", alt: "" } })?.image
    ).toBe("invalidImage");
  });

  it("requires at least one area and a correct area that exists", () => {
    expect(fieldErrorsOf({ ...hotspotFixture, areas: [] })?.areas).toBe(
      "invalidAreas"
    );
    expect(
      fieldErrorsOf({ ...hotspotFixture, correctAnswer: ["zzz"] })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({ ...hotspotFixture, correctAnswer: [] })?.correctAnswer
    ).toBe("invalidCorrectAnswer");
  });

  it("accepts several correct areas", () => {
    expect(
      validateQuestionProperties({
        ...hotspotFixture,
        correctAnswer: ["lb", "db"],
      }).success
    ).toBe(true);
  });

  it("rejects duplicate area ids and out-of-range geometry", () => {
    const area = hotspotFixture.areas[0];
    expect(
      fieldErrorsOf({ ...hotspotFixture, areas: [area, area] })?.areas
    ).toBe("duplicateId");
    for (const shape of [
      { kind: "rect", x: 90, y: 0, width: 20, height: 10 },
      { kind: "circle", cx: 50, cy: 50, r: 0 },
      { kind: "circle", cx: 95, cy: 50, r: 10 },
      { kind: "polygon", points: [{ x: 0, y: 0 }] },
      {
        kind: "polygon",
        points: [
          { x: 0, y: 10 },
          { x: 50, y: 10 },
          { x: 80, y: 10 },
        ],
      },
      { kind: "blob" },
    ]) {
      expect(
        fieldErrorsOf({
          ...hotspotFixture,
          areas: [{ id: "lb", label: "LB", shape }],
          correctAnswer: ["lb"],
        })?.areas
      ).toBe("invalidAreas");
    }
  });
});

describe("validateQuestionProperties: case study", () => {
  it("requires a title, context, and sections", () => {
    expect(
      fieldErrorsOf({
        ...caseStudyFixture,
        title: "",
        context: "",
        sections: [],
      })
    ).toEqual({
      title: "invalidTitle",
      context: "invalidContext",
      sections: "invalidSections",
    });
  });

  it("rejects duplicate section and part ids", () => {
    expect(
      fieldErrorsOf({
        ...caseStudyFixture,
        sections: [
          { id: "s", title: "A", content: "a" },
          { id: "s", title: "B", content: "b" },
        ],
      })?.sections
    ).toBe("duplicateId");
    const [first] = caseStudyFixture.parts;
    expect(
      fieldErrorsOf({
        ...caseStudyFixture,
        parts: [first, first],
        correctAnswer: { p1: "a" },
      })?.parts
    ).toBe("invalidParts");
  });

  it("requires a valid answer for every part", () => {
    expect(
      fieldErrorsOf({ ...caseStudyFixture, correctAnswer: { p1: "a" } })
        ?.correctAnswer
    ).toBe("invalidCorrectAnswer");
    expect(
      fieldErrorsOf({
        ...caseStudyFixture,
        correctAnswer: { p1: "zzz", p2: ["x"] },
      })?.correctAnswer
    ).toBe("invalidCorrectAnswer");
  });

  it("rejects options on a fill-blank part and nested case studies", () => {
    expect(
      fieldErrorsOf({
        ...caseStudyFixture,
        parts: [
          {
            id: "p2",
            type: "fill-blank",
            prompt: "x",
            options: [{ id: "a", text: "A" }],
          },
        ],
        correctAnswer: { p2: ["x"] },
      })?.parts
    ).toBe("invalidParts");
    expect(
      fieldErrorsOf({
        ...caseStudyFixture,
        parts: [{ id: "p1", type: "case-study", prompt: "x" }],
        correctAnswer: { p1: "a" },
      })?.parts
    ).toBe("invalidParts");
  });
});
