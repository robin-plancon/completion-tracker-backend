import express from "express";
import { check, oneOf } from "express-validator";
import {
  getCategories,
  createCategory,
  getCategory,
  getChildsCategories,
  updateCategory,
  deleteCategory,
  getRootCategories,
  getCategoriesTree,
} from "../controllers/categoriesController";

const categoryRouter = express.Router();

categoryRouter.get("/", getCategories);

categoryRouter.get("/tree", getCategoriesTree);

categoryRouter.get("/root", getRootCategories);

categoryRouter.get("/:categoryId", getCategory);

categoryRouter.get("/:parentCategoryId/childs", getChildsCategories);

const postCategoryValidation = [
  check("name", "Name must be a string and not empty.").not().isEmpty().isString(),
  check("link", "Link must be a string.").optional().isString(),
  check("status", "Status must be a boolean.").optional().isBoolean(),
];

categoryRouter.post("/", postCategoryValidation, createCategory);

const updateCategoryValidation = [
  oneOf(
    [
      check("name").exists(),
      check("link").exists(),
      check("status").exists(),
      check("parent").exists()
    ],
    "No inputs passed, please check your data."
  ),
  check("name", "Name must be a string and not empty.").optional().not().isEmpty().isString(),
  check("link", "Link must be a string.").optional().isString(),
  check("status", "Status must be a boolean.").optional().isBoolean(),
];

categoryRouter.patch("/:categoryId", updateCategoryValidation, updateCategory);

categoryRouter.delete("/:categoryId", deleteCategory);

export default categoryRouter;
