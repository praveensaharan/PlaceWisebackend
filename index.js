const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jo780ce.mongodb.net/blog`;
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error(`Error connecting to the database:\n${err}`);
  });
const JobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  cpi: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  ctc: {
    type: String,
    required: true,
  },
  gross: {
    type: String,
    required: true,
  },
  test: {
    type: String,
    required: true,
  },
  interview: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Job = mongoose.model("Job", JobSchema);

const CommentSchema = new mongoose.Schema({
  blogPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  author: {
    type: String,
    default: "Anonymous",
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model("Comment", CommentSchema);

app.get("/", (req, res) => {
  res.send("App is working");
});
app.post("/register", async (req, res) => {
  try {
    const jobData = new Job(req.body); // Create a new job document using the request body
    let result = await jobData.save(); // Save the job data to the database

    result = result.toObject();
    if (result) {
      delete result.password;
      console.log(result);
      res.json(result); // Send the result object as JSON response
    } else {
      console.log("User already registered");
      res.status(400).send("User already registered"); // Send an appropriate error response
    }
  } catch (e) {
    console.error("Error saving data:", e);
    res.status(500).send("Something went wrong"); // Send an appropriate error response
  }
});

app.get("/jobs", async (req, res) => {
  try {
    const jobList = await Job.find(); // Retrieve all job documents from the database
    res.json(jobList); // Send the job list as JSON response
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).send("Something went wrong");
  }
});
app.get("/blog/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log("Job ID:", jobId);
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).send("Something went wrong");
  }
});

app.get("/commentsget/:blogPostId", async (req, res) => {
  const { blogPostId } = req.params;
  try {
    const comments = await Comment.find({ blogPostId });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send("Something went wrong");
  }
});

// Insert a comment for a specific blog post
app.post("/comments/:blogPostId", async (req, res) => {
  const { blogPostId } = req.params;
  const { author, content } = req.body;

  try {
    const comment = new Comment({
      blogPostId,
      author,
      content,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error inserting comment:", error);
    res.status(500).send("Something went wrong");
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
