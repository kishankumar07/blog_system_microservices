import express from "express";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";

const router = express.Router();

import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

const POST_PROTO_PATH = path.join(__dirname, "../proto/post.proto");

const packageDefinition = protoLoader.loadSync(POST_PROTO_PATH, { keepCase: true });
const PostService = grpc.loadPackageDefinition(packageDefinition).post.PostService;

// Use environment variables for service host and port
const POST_SERVICE_HOST = process.env.POST_SERVICE_HOST || "localhost";
const POST_SERVICE_PORT = process.env.POST_SERVICE_PORT || "50051";
const POST_SERVICE_URL = `${POST_SERVICE_HOST}:${POST_SERVICE_PORT}`;

// Connect to Post Service
const postServiceClient = new PostService(
  POST_SERVICE_URL ,
  grpc.credentials.createInsecure()
);

// Middleware to parse JSON requests
router.use(express.json());

// gRPC Client Integration

// Create Post
router.post("/", (req, res) => {
  const { title, content,author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ error: "Title, content, and author are required." });
  }

  postServiceClient.CreatePost({ title, content,author }, (err, response) => {
    if (err) {
      console.error("gRPC Error at POST /posts:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('this is the newPost at /posts:',response.post)
    res.status(201).json(response);
  });
});

// Get Post By ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Invalid post ID format" });
  }

  postServiceClient.GetPostById({ id }, (err, response) => {
    if (err) {
      console.error("gRPC Error at GET /posts/:id :", err.message);
      if (err.code === grpc.status.NOT_FOUND) {
        return res.status(404).json({ error: "Post not found" });
      }

      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(200).json(response);
  });
});

// Get All Posts
router.get("/", (req, res) => {
  postServiceClient.GetAllPosts({}, (err, response) => {
    if (err) {
      console.error("gRPC Error from GET /posts of postRoutes:", err.message);
      if (err.code === grpc.status.NOT_FOUND) {
        return res.status(404).json({ error: "Not found",message:"No posts found in the database" });
      }
      return res.status(500).json({ error: "Internal Server Error" , message:"Error fetching all posts" });
    }
    res.json(response.posts); // Assuming the response contains an array of posts
  });
});


// Delete Post
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  postServiceClient.DeletePost({ id }, (err, response) => {
    if (err) {
      console.error("gRPC Error at delete /posts:id:", err.message);
      if (err.code === grpc.status.NOT_FOUND) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: response.message });
  });
});

export default router;
