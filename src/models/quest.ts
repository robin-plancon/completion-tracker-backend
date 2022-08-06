import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const Schema = mongoose.Schema;

interface Iquest {
  name: string,
  link?: string,
  status: boolean,
  steps: [
    {
      text: string,
      link?: string,
      status?: boolean
    }
  ]
}

const questSchema = new Schema({
  // categoryId: {
  //   type: mongoose.Types.ObjectId,
  //   required: true,
  //   ref: "Category",
  // },
  name: { type: String, required: true, unique: true },
  link: { type: String, required: false },
  status: { type: Boolean, required: true, default: false },
  steps: [{ 
    text: { type: String, required: true},
    link: { type: String, required: false},
    status: {type: Boolean, required: true, default: false}
  }],
});

questSchema.plugin(uniqueValidator);

const Quest = mongoose.model<Iquest>("Quest", questSchema);

export = Quest;
