import express from "express";
import { check, oneOf } from "express-validator";
import {
  createObject,
  deleteObject,
  getAllObjects,
  getObjectsFromCategory,
  updateObject,
} from "../controllers/objectsController";

const objectsRouter = express.Router();

objectsRouter.get("/", getAllObjects);

objectsRouter.get("/:categoryId", getObjectsFromCategory);

const postObjectValidation = [
  check("categoryId", "category must not be empty.").not().isEmpty(),
  check("name", "name must not be empty.").not().isEmpty(),
  check("name", "name must be a string.").isString(),
  check("link", "link must be an URL.").optional().isURL(),
  check("status", "status must be a boolean.").optional().isBoolean(),
  check("location", "location must be a string.").optional().isString(),
  check("details", "details must be a string.").optional().isString(),
];

objectsRouter.post("/", postObjectValidation, createObject);

const updateObjectValidation = [
  oneOf([
    check("name").exists(),
    check("link").exists(),
    check("status").exists(),
    check("location").exists(),
    check("details").exists(),
  ]),
  check("name", "name must be a string and not empty.").optional().not().isEmpty().isString(),
  check("link", "link must be an URL.").optional().isURL(),
  check("status", "status must be a boolean.").optional().isBoolean(),
  check("location", "location must be a string.").optional().isString(),
  check("details").optional().isString()

];

objectsRouter.patch("/:objectId", updateObjectValidation, updateObject);

objectsRouter.delete("/:objectId", deleteObject);

export default objectsRouter;
