import express from "express";
import { check, oneOf } from "express-validator";
import {
  createBoss,
  deleteBoss,
  getBoss,
  getBosses,
  updateBoss,
} from "../controllers/bossesController";

const bossRouter = express.Router();

bossRouter.get("/", getBosses);

bossRouter.get("/:bossId", getBoss);

const postBossValidation = [
  check("name", "Name must be a string and not empty.")
    .not()
    .isEmpty()
    .isString(),
  check("link", "Link must be a string.").optional().isString(),
  check("status", "Status must be a boolean.").optional().isBoolean(),
  check("location", "Location must be a string and not empty.")
    .not()
    .isEmpty()
    .isString(),
];

bossRouter.post("/", postBossValidation, createBoss);

const updateBossValidation = [
  oneOf(
    [
      check("name").exists(),
      check("link").exists(),
      check("status").exists(),
      check("location").exists(),
    ],
    "No inputs passed, please check your data."
  ),
  check("name", "Name must be a string and not empty.")
    .optional()
    .not()
    .isEmpty()
    .isString(),
  check("link", "Link must be a string.").optional().isString(),
  check("status", "Status must be a boolean.").optional().isBoolean(),
  check("location", "Location must be a string and not empty.")
    .optional()
    .not()
    .isEmpty()
    .isString(),
];

bossRouter.patch("/:bossId", updateBossValidation, updateBoss);

bossRouter.delete("/:bossId", deleteBoss);

export default bossRouter;
