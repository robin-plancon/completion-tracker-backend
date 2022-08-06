import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const Schema = mongoose.Schema;

interface Icategory {
  name: string;
  link?: string;
  parent?: Icategory;
}

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  link: { type: String, required: false, default: undefined },
  parent: {
    type: mongoose.Types.ObjectId,
    require: false,
    ref: "Category",
    default: undefined,
  },
});

categorySchema.plugin(uniqueValidator);

const Category = mongoose.model<Icategory>("Category", categorySchema);

export default Category;
