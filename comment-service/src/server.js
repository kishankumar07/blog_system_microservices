import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { createComment, getCommentsForPost, deleteComment } from "./services/commentService.js";
import { connectDB } from '../config/dbConnect.js'

import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
const PROTO_PATH = path.join(__dirname,'./proto/comment.proto')
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true, 
  oneofs: true,
});
const commentProto = grpc.loadPackageDefinition(packageDefinition).comment;

connectDB()

// Initialize gRPC Server
const server = new grpc.Server();

// Add Comment Service
server.addService(commentProto.CommentService.service, {
  CreateComment: createComment,
  GetCommentsForPost: getCommentsForPost,
  DeleteComment: deleteComment,
});



// Start Server
const PORT = process.env.COMMENT_SERVICE_PORT || 50052;
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log(`Comment Service running on port ${PORT}`);
  }
);









