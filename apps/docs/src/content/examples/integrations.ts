import { createDetector } from "profanity-kit";
import * as v from "valibot";
import * as yup from "yup";
import { z } from "zod";

const detector = createDetector();

export const zodComment = z.string().refine(detector.isClean);
export const valibotComment = v.pipe(
  v.string(),
  v.check(detector.isClean, "Please remove prohibited language.")
);
export const yupComment = yup
  .string()
  .test(
    "clean-language",
    "Please remove prohibited language.",
    (value) => value === undefined || detector.isClean(value)
  );
