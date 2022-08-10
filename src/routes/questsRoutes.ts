import express from "express";
import { check, oneOf } from "express-validator";
import {
  createQuest,
  createStep,
  deleteQuest,
  deleteStep,
  getQuest,
  getQuests,
  getSteps,
  updateQuest,
  updateStep,
} from "../controllers/questsController";

const questRouter = express.Router();

questRouter.get("/", getQuests);

questRouter.get("/:questId", getQuest);

const postQuestValidation = [
  check("name", "Name must not be empty.").not().isEmpty(),
  check("name", "Name must be a string.").isString(),
  check("link", "Link must be a string.").optional().isString(),
  check("status", "Status must be a boolean.").optional().isBoolean(),
];

questRouter.post("/", postQuestValidation, createQuest);

const updateQuestValidation = [
  oneOf(
    [check("name").exists(), check("link").exists(), check("status").exists()],
    "No inputs passed, please check your data."
  ),
  check("name", "Name must be a string and not empty.")
    .optional()
    .not()
    .isEmpty()
    .isString(),
  check("link", "Link must be a string.").optional().isString(),
  check("status", "Status must be a boolean.").optional().isBoolean(),
];

questRouter.patch("/:questId", updateQuestValidation, updateQuest);

questRouter.delete("/:questId", deleteQuest);

questRouter.get("/steps/:questId", getSteps);

const postStepValidation = [
  check("text", "text must not be empty.").not().isEmpty(),
  check("text", "text must be a string.").isString(),
  check("link", "Link must be a string.").optional().isString(),
  check("status", "Status must be a boolean.").optional().isBoolean(),
];

questRouter.post("/steps/:questId", postStepValidation, createStep);

const updateStepValidation = [
  oneOf(
    [check("text").exists(), check("link").exists(), check("status").exists()],
    "No inputs passed, please check your data."
  ),
  check("text", "Text must be a string and not empty.")
    .optional()
    .not()
    .isEmpty()
    .isString(),
  check("link", "Link must be a string.").optional().isString(),
  check("status", "Status must be a boolean.").optional().isBoolean(),
];

questRouter.patch("/steps/:stepId", updateStepValidation, updateStep);

questRouter.delete("/steps/:stepId", deleteStep);

export default questRouter;
