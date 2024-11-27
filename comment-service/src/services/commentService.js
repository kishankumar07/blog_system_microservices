import { promisify } from "util";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import Comment from "../models/commentModel.js";
import path from "path";

import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
const POST_PROTO_PATH = path.join(__dirname,'../proto/post.proto')

const packageDefinition = protoLoader.loadSync(POST_PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const postProto = grpc.loadPackageDefinition(packageDefinition).post;

    const POST_SERVICE_HOST = process.env.POST_SERVICE_HOST || "localhost";
    const POST_SERVICE_PORT = process.env.POST_SERVICE_PORT || "50051";
    const POST_SERVICE_URL = `${POST_SERVICE_HOST}:${POST_SERVICE_PORT}`;

    
    // Create Post Service Client
    const postClient = new postProto.PostService(
      POST_SERVICE_URL,
      grpc.credentials.createInsecure()
    );

    //Promisify the gRPC method to avoid using callback
    const getPostById = promisify(postClient.getPostById).bind(postClient)


export const createComment = async (call, callback) => {
      const { postId, author, content } = call.request;
    
      try {
        
        await getPostById({ id: postId });
    
       
        const newComment = await Comment.create({ postId, author, content });
    
        callback(null, { comment: newComment.toJSON() });
      } catch (error) {
            
        if (error.code === grpc.status.NOT_FOUND) {
          console.error("Error validating postId at createComment method of comment-service:", error.message || error);

          return callback({
            code: grpc.status.NOT_FOUND,
            message: "Post not found. Unable to create comment.",
          });
        }
    
        console.error("Error creating comment:", error.message || error);
        callback({
          code: grpc.status.INTERNAL,
          message: "Failed to create comment. Please try again.",
        });
      }
    };
    

// Get Comments for a Specific Post
export const getCommentsForPost = async (call, callback) => {
  try {
    const { postId } = call.request;

    const comments = await Comment.find({ postId });
    if (!comments || comments.length === 0) {
      console.warn(`No comments found for postId '${postId}' at comment-service.`);
      return callback({
        code: grpc.status.NOT_FOUND,
        message: `No comments found for the post with id '${postId}'.`,
      });
    }

    callback(null, { comments: comments.map((comment) => comment.toObject()) });

  } catch (error) {
    console.error(
      "Error fetching comments for post at getCommentsForPost of comment-service:",
      error.message || error
    );
    callback(
      {
        code: grpc.status.INTERNAL,
        message: "Failed to fetch comments. Please try again later.",
      },
      null
    );
  }
};

// Delete a Comment
export const deleteComment = async (call, callback) => {
  try {
    const { id } = call.request;

    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) {
      return callback({ code: grpc.status.NOT_FOUND, message: "Comment not found" }, null);
    }

    callback(null, { message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment at deleteComment of comment-service:", error);
    callback({ code: grpc.status.INTERNAL, message: "Failed to delete comment" }, null);
  }
};
