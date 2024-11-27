import Post from "../models/postModel.js";
import grpc from '@grpc/grpc-js'

export const createPost = async (call, callback) => {
  try {
    // console.log('Request received from createPost of api-gateway-swagger-ui:', call.request);

    const { title, content, author } = call.request;
    const newPost = await Post.create({ title, content, author });
    console.log('this is the newPost:',newPost)
    callback(null, { post: newPost.toJSON() });
  } catch (error) {
    console.error("Error creating post at createPost of postService:", error);
    callback(error, null);
  }
};

export const getPostById = async (call, callback) => {
  try {
    const { id } = call.request;
    const post = await Post.findById(id);
    if (!post) {
      return callback({ code: grpc.status.NOT_FOUND, message: "Post not found" });
    }
    callback(null, { post: post.toJSON() });
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: "Internal server error",
    });
  }
};

export const getAllPosts = async (call, callback) => {
  try {
    const posts = await Post.find({});

    if (posts.length === 0) {
      const error = {
        code: grpc.status.NOT_FOUND, 
        message: "No posts found in the database."
      };
      return callback(error, null);
    }


    callback(null, { posts: posts.map((post) => post.toJSON()) });
  } catch (error) {
    console.error("Error fetching all posts:", error);
    const serverError = {
      code: grpc.status.INTERNAL,
      message: "An error occurred while fetching posts."
    };
    callback(serverError, null);
  }
};

export const deletePost = async (call, callback) => {
  try {
    const { id } = call.request;
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return callback({ code: grpc.status.NOT_FOUND, message: "Post not found" });
    }
    callback(null, { message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    callback({ code: grpc.status.INTERNAL, message: "Internal server error" });
  }
};
