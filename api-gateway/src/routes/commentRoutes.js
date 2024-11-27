import express from "express";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { promisify } from 'util'
import path from "path";

const router = express.Router();

import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);
const COMMENT_PROTO_PATH = path.join(__dirname, "../../../proto/comment.proto");
const packageDefinition = protoLoader.loadSync(COMMENT_PROTO_PATH, { keepCase: true });
const CommentService = grpc.loadPackageDefinition(packageDefinition).comment.CommentService;

// Connect to Post Service
const CommentServiceClient = new CommentService(
  process.env.COMMENT_SERVICE_URL || "localhost:50052",
  grpc.credentials.createInsecure()
);

// Middleware to parse JSON requests
router.use(express.json());

  
// Promisify gRPC methods
const createComment = promisify(CommentServiceClient.createComment).bind(CommentServiceClient);
const getCommentsForPost = promisify(CommentServiceClient.getCommentsForPost).bind(CommentServiceClient);
const deleteComment = promisify(CommentServiceClient.deleteComment).bind(CommentServiceClient);


// gRPC Client Integration

/**
 * Route to create a new comment
 * POST /comments
 */
router.post("/", async (req, res) => {
  const { postId, author, content } = req.body;

  try {
    const response = await createComment({ postId, author, content });
    return res.status(201).json(response.comment); 
  } catch (error) {
    console.error("Error creating comment at API Gateway:", error.message || error);
    const statusCode = error.code === grpc.status.NOT_FOUND ? 404 : 500;
    return res.status(statusCode).json({
      error: error.details || "Failed to create comment. Please try again.",
    });
  }
});


/**
 * Route to get comments for a specific post
 * GET /comments/:postId
 */
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  // console.log("postId is :",postId)
  if (!postId || postId === "{postId}") {
    return res.status(400).json({
      error: "Invalid or missing 'postId'. A valid postId is required to fetch comments.",
    });
  }

  try {
    const response = await getCommentsForPost({ postId });
    if (!response.comments || response.comments.length === 0) {
      return res.status(404).json({
        error: `No comments found for the post with id '${postId}'.`,
      });
    }

    return res.status(200).json(response.comments);
  } catch (error) {
    console.error("Error fetching comments at API Gateway:", error.message || error);
    const statusCode = error.code === grpc.status.NOT_FOUND ? 404 : 500;

    return res.status(statusCode).json({
      error: error.message || "Failed to fetch comments. Please try again.",
    });
  }
});


/**
 * Route to delete a specific comment
 * DELETE /comments/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || id === "{id}") {
    return res.status(400).json({
      error: "Invalid or missing 'id'. A valid if is required to delete comments.",
    });
  }


  try {
    const response = await deleteComment({ id });
    return res.status(200).json({ message: response.message }); 
    
  } catch (error) {
    console.error("Error deleting comment at API Gateway:", error.message || error);
    if (error.code === grpc.status.NOT_FOUND) {
      return res.status(404).json({
        error: "Comment not found. Unable to delete.",
      });
    }
    return res.status(500).json({
      error: error.details || "Failed to delete comment. Please try again.",
    });
  }
});




export default router;