"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var validate_selections_1 = require("../lib/av_client/validate_selections");
var chai_1 = require("chai");
var errors_1 = require("../lib/av_client/errors");
var contestOne = {
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
            maxMarks: 1,
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
                reference: "option-1",
                code: 1,
                title: { en: "Option 1" },
                subtitle: { en: "Option 1" },
                description: { en: "Option 1" },
            },
            {
                reference: "option-3",
                code: 3,
                title: { en: "Option 3" },
                subtitle: { en: "Option 3" },
                description: { en: "Option 3" },
            },
        ],
    },
};
var contestTwo = {
    address: "",
    author: "",
    parentAddress: "",
    previousAddress: "",
    registeredAt: "",
    signature: "",
    type: "ContestConfigItem",
    content: {
        reference: "contest-2",
        markingType: {
            minMarks: 1,
            maxMarks: 2,
            blankSubmission: "active_choice",
            encoding: {
                codeSize: 1,
                maxSize: 2,
                cryptogramCount: 1,
            },
        },
        resultType: {
            name: "does not matter right now",
        },
        title: { en: "Contest 2" },
        subtitle: { en: "Contest 2" },
        description: { en: "Contest 2" },
        options: [
            {
                reference: "option-a",
                code: 1,
                title: { en: "Option a" },
                subtitle: { en: "Option a" },
                description: { en: "Option a" },
            },
        ],
    },
};
describe("validateContestSelection", function () {
    context("when given a valid contest selection", function () {
        var contestSelection = {
            reference: "contest-1",
            piles: [{
                    multiplier: 1,
                    optionSelections: [{ reference: "option-1" }],
                }]
        };
        it("does not throw error", function () {
            (0, chai_1.expect)(function () {
                (0, validate_selections_1.validateContestSelection)(contestOne, contestSelection, 1);
            }).to.not.throw();
        });
    });
    context("when given a contest selection with wrong reference", function () {
        var contestSelection = {
            reference: "wrong-contest-reference",
            piles: [{
                    multiplier: 1,
                    optionSelections: [{ reference: "option-1" }],
                }]
        };
        it("throws an error", function () {
            (0, chai_1.expect)(function () {
                (0, validate_selections_1.validateContestSelection)(contestOne, contestSelection, 1);
            }).to.throw(errors_1.CorruptSelectionError, "Contest selection is not matching contest config");
        });
    });
    context("when given a contest selection with no selections and blank disabled", function () {
        var contestSelection = {
            reference: "contest-1",
            piles: [{
                    multiplier: 1,
                    optionSelections: [],
                }]
        };
        it("throws an error", function () {
            (0, chai_1.expect)(function () {
                (0, validate_selections_1.validateContestSelection)(contestOne, contestSelection, 1);
            }).to.throw(errors_1.CorruptSelectionError, "Blank submissions are not allowed in this contest");
        });
    });
    context("when given a contest selection with no selections and blank enabled", function () {
        var contestSelection = {
            reference: "contest-2",
            piles: [{
                    multiplier: 1,
                    optionSelections: [],
                }]
        };
        it("does not throw an error", function () {
            (0, chai_1.expect)(function () {
                (0, validate_selections_1.validateContestSelection)(contestTwo, contestSelection, 1);
            }).to.not.throw();
        });
    });
    context("when given a contest selection with two selections", function () {
        var contestSelection = {
            reference: "contest-1",
            piles: [{
                    multiplier: 1,
                    optionSelections: [{ reference: "option-1" }, { reference: "option-3" }],
                }]
        };
        it("throws an error", function () {
            (0, chai_1.expect)(function () {
                (0, validate_selections_1.validateContestSelection)(contestOne, contestSelection, 1);
            }).to.throw(errors_1.CorruptSelectionError, "Contest selection does not contain a valid amount of option selections");
        });
    });
    context("when given a contest selection with wrong options", function () {
        var contestSelection = {
            reference: "contest-1",
            piles: [{
                    multiplier: 1,
                    optionSelections: [{ reference: "option-2" }],
                }]
        };
        it("throws an error", function () {
            (0, chai_1.expect)(function () {
                (0, validate_selections_1.validateContestSelection)(contestOne, contestSelection, 1);
            }).to.throw(errors_1.CorruptSelectionError, "Option config not found");
        });
    });
    context("using contest where up to 2 options can be selected", function () {
        context("when given a contest selection with duplicate option selections", function () {
            var contestSelection = {
                reference: "contest-2",
                piles: [{
                        multiplier: 1,
                        optionSelections: [
                            { reference: "option-a" },
                            { reference: "option-a" },
                        ],
                    }]
            };
            it("throws an error", function () {
                (0, chai_1.expect)(function () {
                    (0, validate_selections_1.validateContestSelection)(contestTwo, contestSelection, 1);
                }).to.throw(errors_1.CorruptSelectionError, "Same option selected multiple times");
            });
        });
    });
});
describe("validateBallotSelection", function () {
    var _a;
    var ballotConfig = {
        address: "",
        author: "",
        parentAddress: "",
        previousAddress: "",
        registeredAt: "",
        signature: "",
        type: "BallotConfigItem",
        content: {
            reference: "ballot-1",
            voterGroup: "4",
            contestReferences: ["contest-1", "contest-2"],
        },
    };
    var votingRoundConfig = {
        address: "",
        author: "",
        parentAddress: "",
        previousAddress: "",
        content: {
            status: "open",
            reference: "voting-round-1",
            contestReferences: ["contest-1", "contest-2"],
        },
        registeredAt: "",
        signature: "",
        type: "VotingRoundConfigItem",
    };
    var contestConfigs = (_a = {},
        _a[contestOne.content.reference] = contestOne,
        _a[contestTwo.content.reference] = contestTwo,
        _a);
    context("when given a valid ballot selection", function () {
        var ballotSelection = {
            reference: "ballot-1",
            contestSelections: [
                {
                    reference: "contest-1",
                    piles: [{
                            multiplier: 1,
                            optionSelections: [{ reference: "option-1" }],
                        }]
                },
                {
                    reference: "contest-2",
                    piles: [{
                            multiplier: 1,
                            optionSelections: [{ reference: "option-a" }],
                        }]
                },
            ],
        };
        it("does not throw errors", function () {
            (0, chai_1.expect)(function () {
                (0, validate_selections_1.validateBallotSelection)(ballotConfig, contestConfigs, ballotSelection, votingRoundConfig, 1);
            }).to.not.throw();
        });
    });
    context("when given a ballot selection with wrong reference", function () {
        var ballotSelection = {
            reference: "wrong-reference",
            contestSelections: [
                {
                    reference: "contest-1",
                    piles: [{
                            multiplier: 1,
                            optionSelections: [{ reference: "option-1" }],
                        }]
                },
                {
                    reference: "contest-2",
                    piles: [{
                            multiplier: 1,
                            optionSelections: [{ reference: "option-a" }],
                        }]
                },
            ],
        };
        it("throws errors", function () {
            (0, chai_1.expect)(function () {
                (0, validate_selections_1.validateBallotSelection)(ballotConfig, contestConfigs, ballotSelection, votingRoundConfig, 1);
            }).to.throw(errors_1.CorruptSelectionError, "Ballot selection does not match ballot config");
        });
    });
    context("when given ballot selection with missing contests according to voting round", function () {
        var votingRoundConfig = {
            address: "",
            author: "",
            parentAddress: "",
            previousAddress: "",
            content: {
                status: "open",
                reference: "voting-round-1",
                contestReferences: ["contest-1", "contest-2"],
            },
            registeredAt: "",
            signature: "",
            type: "VotingRoundConfigItem",
        };
        var ballotSelection = {
            reference: "ballot-1",
            contestSelections: [
                {
                    reference: "contest-1",
                    piles: [{
                            multiplier: 1,
                            optionSelections: [{ reference: "option-1" }],
                        }]
                },
            ],
        };
        it("throws errors", function () {
            (0, chai_1.expect)(function () {
                (0, validate_selections_1.validateBallotSelection)(ballotConfig, contestConfigs, ballotSelection, votingRoundConfig, 1);
            }).to.throw(errors_1.CorruptSelectionError, "Contest selections do not match the contests allowed by the ballot or voting round");
        });
        context("when given ballot selection with missing contests according to ballot config", function () {
            var votingRoundConfig = {
                address: "",
                author: "",
                parentAddress: "",
                previousAddress: "",
                content: {
                    status: "open",
                    reference: "voting-round-1",
                    contestReferences: ["contest-1"],
                },
                registeredAt: "",
                signature: "",
                type: "VotingRoundConfigItem",
            };
            var ballotSelection = {
                reference: "ballot-1",
                contestSelections: [
                    {
                        reference: "contest-1",
                        piles: [{
                                multiplier: 1,
                                optionSelections: [{ reference: "option-1" }],
                            }]
                    },
                ],
            };
            it("accepts the selection", function () {
                (0, chai_1.expect)(function () {
                    (0, validate_selections_1.validateBallotSelection)(ballotConfig, contestConfigs, ballotSelection, votingRoundConfig, 1);
                }).to.not.throw();
            });
            context("when given a ballot selection with duplicate contest votes", function () {
                var ballotSelection = {
                    reference: "ballot-1",
                    contestSelections: [
                        {
                            reference: "contest-1",
                            piles: [{
                                    multiplier: 1,
                                    optionSelections: [{ reference: "option-1" }],
                                }]
                        },
                        {
                            reference: "contest-1",
                            piles: [{
                                    multiplier: 1,
                                    optionSelections: [{ reference: "option-1" }],
                                }]
                        },
                    ],
                };
                it("throws errors", function () {
                    (0, chai_1.expect)(function () {
                        (0, validate_selections_1.validateBallotSelection)(ballotConfig, contestConfigs, ballotSelection, votingRoundConfig, 1);
                    }).to.throw(errors_1.CorruptSelectionError, "Contest selections do not match the contests allowed by the ballot or voting round");
                });
            });
            context("when given a contest outside the voting round but inside ballot", function () {
                var ballotSelection = {
                    reference: "ballot-1",
                    contestSelections: [
                        {
                            reference: "contest-1",
                            piles: [{
                                    multiplier: 1,
                                    optionSelections: [{ reference: "option-1" }],
                                }]
                        },
                        {
                            reference: "contest-2",
                            piles: [{
                                    multiplier: 1,
                                    optionSelections: [{ reference: "option-1" }],
                                }]
                        },
                    ],
                };
                var votingRoundConfig = {
                    address: "",
                    author: "",
                    parentAddress: "",
                    previousAddress: "",
                    content: {
                        status: "open",
                        reference: "voting-round-1",
                        contestReferences: ["contest-1"],
                    },
                    registeredAt: "",
                    signature: "",
                    type: "VotingRoundConfigItem",
                };
                it("throws errors", function () {
                    (0, chai_1.expect)(function () {
                        (0, validate_selections_1.validateBallotSelection)(ballotConfig, contestConfigs, ballotSelection, votingRoundConfig, 1);
                    }).to.throw(errors_1.CorruptSelectionError, "Contest selections do not match the contests allowed by the ballot or voting round");
                });
            });
        });
    });
});
//# sourceMappingURL=validate_selections.test.js.map