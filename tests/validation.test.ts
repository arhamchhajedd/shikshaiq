import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateSubmission } from "../lib/assessment/validation";

describe("validateSubmission", () => {
  test("accepts a valid submission payload", () => {
    const payload = {
      answers: [
        { questionId: "q_fb_01", selectedOptionId: "opt_b" },
        { questionId: "q_fb_02", selectedOptionId: "opt_a", timeSpentSeconds: 12 },
      ],
      personaId: "rohan",
    };

    const res = validateSubmission(payload);
    assert.equal(res.success, true);
    if (res.success) {
      assert.equal(res.data.answers.length, 2);
      assert.equal(res.data.answers[0].questionId, "q_fb_01");
    }
  });

  test("rejects empty answers array", () => {
    const payload = { answers: [] };
    const res = validateSubmission(payload);
    assert.equal(res.success, false);
    if (!res.success) {
      assert.match(res.error, /at least one answer/i);
    }
  });

  test("rejects missing questionId or selectedOptionId", () => {
    const payload = {
      answers: [{ questionId: "", selectedOptionId: "opt_a" }],
    };
    const res = validateSubmission(payload);
    assert.equal(res.success, false);
  });

  test("rejects non-object input", () => {
    assert.equal(validateSubmission(null).success, false);
    assert.equal(validateSubmission("string").success, false);
    assert.equal(validateSubmission(123).success, false);
  });
});
