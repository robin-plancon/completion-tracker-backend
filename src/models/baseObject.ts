import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const Schema = mongoose.Schema;

const baseObjectSchema = new Schema({
  categoryId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  name: { type: String, required: true, unique: true },
  link: { type: String, required: false },
  status: { type: Boolean, required: true },
});

baseObjectSchema.plugin(uniqueValidator);

module.exports = mongoose.model("BaseObject", baseObjectSchema);
