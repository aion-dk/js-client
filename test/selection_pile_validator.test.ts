import SelectionPileValidator from "../lib/validators/selectionPileValidator";

import { expect } from "chai";
import {
  ContestConfig,
} from "../lib/av_client/types";

const contestOne: ContestConfig = {
  address: "",
  author: "",
  parentAddress: "",
  previousAddress: "",
  registeredAt: "",
  signature: "",
  type: "ContestConfigItem",
  content: {
    reference: "contest-1",
    markingType: {
      minMarks: 1,
      maxMarks: 3,
      blankSubmission: "disabled",
      encoding: {
        codeSize: 1,
        maxSize: 1,
        cryptogramCount: 1,
      },
    },
    resultType: {
      name: "does not matter right now",
    },
    title: { en: "Contest 1" },
    subtitle: { en: "Contest 1" },
    description: { en: "Contest 1" },
    options: [
      {
        reference: "parent-1",
        code: 1,
        title: { en: "Parent 1" },
        subtitle: { en: "Parent 1" },
        description: { en: "Parent 1" },
        maxChooseableSuboptions: 2,
        children: [
          {
            reference: "child-1",
            code: 11,
            title: { en: "Child 1" },
            subtitle: { en: "Child 1" },
            description: { en: "Child 1" },
          },
          {
            reference: "child-2",
            code: 12,
            title: { en: "Child 2" },
            subtitle: { en: "Child 2" },
            description: { en: "Child 2" },
          },
          {
            reference: "child-3",
            code: 13,
            title: { en: "Child 3" },
            subtitle: { en: "Child 3" },
            description: { en: "Child 3" },
          }
        ]
      },
      {
        reference: "parent-2",
        code: 3,
        title: { en: "Parent 2" },
        subtitle: { en: "Parent 2" },
        description: { en: "Parent 2" },
        exclusive: true,
      },
    ],
  },
};

const optionSelections = [
  { reference: "parent-1" }
]

const selectionPile = {
  multiplier: 1,
  optionSelections: optionSelections,
  explicitBlank: false
}

const validator = new SelectionPileValidator(contestOne.content)

describe.only("validate", () => {
  context("when given a valid selectionPile", () => {
    it("returns no errors", () => {
      expect(validator.validate(selectionPile)).to.have.lengthOf(0)
    });
  });

  context("when given too many selections", () => {
    const optionSelections = [
      { reference: "parent-1"},
      { reference: "parent-1" },
      { reference: "child-1" },
      { reference: "child-2" }
    ]

    const selectionPile = {
      multiplier: 1,
      optionSelections: optionSelections,
      explicitBlank: false
    }

    it("returns 'too_many' error", () => {
      expect(validator.validate(selectionPile)).to.have.lengthOf(1)
      expect(validator.validate(selectionPile)[0].message).to.equal("too_many")
    });
  })

  context("with invalid reference", () => {
    const optionSelections = [{ reference: "invalid"}]
    const selectionPile = {
      multiplier: 1,
      optionSelections: optionSelections,
      explicitBlank: false
    }

    it("returns 'invalid_reference' error", () => {
      expect(validator.validate(selectionPile)).to.have.lengthOf(1)
      expect(validator.validate(selectionPile)[0].message).to.equal("invalid_reference")
    });
  })

  context("with blank not exclusive reference", () => {
    const optionSelections = [ { reference: "blank" }, { reference: "parent-1" }]
    const selectionPile = {
      multiplier: 1,
      optionSelections: optionSelections,
      explicitBlank: true
    }

    it("returns 'blank' error", () => {
      expect(validator.validate(selectionPile)).to.have.lengthOf(1)
      expect(validator.validate(selectionPile)[0].message).to.equal("blank")
    });
  })

  context("with exclusive not exclusive reference", () => {
    const optionSelections = [ { reference: "parent-1" }, { reference: "parent-2" }]
    const selectionPile = {
      multiplier: 1,
      optionSelections: optionSelections,
      explicitBlank: false
    }

    it("returns 'blank' error", () => {
      expect(validator.validate(selectionPile)).to.have.lengthOf(1)
      expect(validator.validate(selectionPile)[0].message).to.equal("exclusive")
    });
  })

  context("with exceeded list limit", () => {
    const optionSelections = [ { reference: "child-1" }, { reference: "child-2" }, { reference: "child-3" } ]
    const selectionPile = {
      multiplier: 1,
      optionSelections: optionSelections,
      explicitBlank: false
    }

    it("returns 'blank' error", () => {
      expect(validator.validate(selectionPile)).to.have.lengthOf(1)
      expect(validator.validate(selectionPile)[0].message).to.equal("exceeded_list_limit")
    });
  })
});
