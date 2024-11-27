import grpc from "@grpc/grpc-js";
import path from 'path'
import protoLoader from '@grpc/proto-loader'
import {connectDB} from '../config/dbConnect.js'
import { createPost,getPostById,getAllPosts,deletePost } from './services/postService.js'

import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const POST_PROTO_PATH = path.join(__dirname, '../../proto/post.proto');

// Load the protocol buffer definition
const packageDefinition = protoLoader.loadSync(POST_PROTO_PATH, {
  keepCase: true, // Keep field case as defined in proto
  longs: String,  // Convert long values to strings
  enums: String,  // Convert enums to strings
  defaults: true, // Use default values for optional fields
  oneofs: true,   // Include oneof fields
});


const postProto = grpc.loadPackageDefinition(packageDefinition).post;

connectDB()

const server = new grpc.Server();

server.addService((postProto).PostService.service, {
  CreatePost : createPost,
  GetPostById: getPostById,
  GetAllPosts : getAllPosts,
  DeletePost : deletePost
});

const PORT = process.env.POST_SERVICE_PORT || 50051;

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err,bindPort) => {
  if (err) {
    console.error("Error starting server:", err);
    return;
  }
  console.log(`Post Service is running on port ${bindPort}`);
  
}); 