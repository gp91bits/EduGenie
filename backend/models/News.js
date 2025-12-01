import mongoose from "mongoose";

// NEWS Schema
const newsSchema = new mongoose.Schema(
  {
    headline: {
      type: String,
      required: true,
     
    },
    news: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const News = mongoose.model("News", newsSchema);
export default News;
