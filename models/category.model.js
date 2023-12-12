import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  deletedStatus: {
    type: String,
    enum: ['Deleted','Not Deleted'],
    default: 'Not Deleted'
},
});

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
