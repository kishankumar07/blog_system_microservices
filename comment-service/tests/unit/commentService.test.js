import { createComment } from '../../src/services/commentService.js';
import { promisify } from 'util';
import grpc from '@grpc/grpc-js';
import Comment from '../../src/models/commentModel.js';

// Mock the external dependencies
jest.mock('@grpc/grpc-js', () => ({
  status: {
    NOT_FOUND: 5,
    INTERNAL: 13
  }
}));

jest.mock('../../src/models/commentModel.js', () => ({
  create: jest.fn()
}));

// Mock postService's getPostById method
jest.mock('util', () => ({
  promisify: jest.fn()
}));

const mockGetPostById = jest.fn();
promisify.mockReturnValue(mockGetPostById);

describe('createComment', () => {
  let callback;

  beforeEach(() => {
    callback = jest.fn(); // Initialize the callback mock before each test
  });

  it('should create a comment when post exists', async () => {
    // Arrange
    const mockPost = { id: '123', title: 'Test Post' }; // Mock post data
    const newComment = { postId: '123', author: 'Author', content: 'This is a comment' };
    mockGetPostById.mockResolvedValue(mockPost); // Simulate successful post retrieval
    Comment.create.mockResolvedValue(newComment); // Mock successful comment creation

    const call = {
      request: {
        postId: '123',
        author: 'Author',
        content: 'This is a comment',
      },
    };

    // Act
    await createComment(call, callback);

    // Assert
    expect(mockGetPostById).toHaveBeenCalledWith({ id: '123' }); // Ensure the post was fetched
    expect(Comment.create).toHaveBeenCalledWith(newComment); // Ensure the comment was created
    expect(callback).toHaveBeenCalledWith(null, { comment: newComment }); // Check the callback response
  });

  it('should return NOT_FOUND if post does not exist', async () => {
    // Arrange
    mockGetPostById.mockRejectedValue({ code: grpc.status.NOT_FOUND }); // Simulate post not found

    const call = {
      request: {
        postId: '999',
        author: 'Author',
        content: 'This is a comment',
      },
    };

    // Act
    await createComment(call, callback);

    // Assert
    expect(callback).toHaveBeenCalledWith(
      { code: grpc.status.NOT_FOUND, message: 'Post not found. Unable to create comment.' },
      null
    );
  });

  it('should return INTERNAL error when there is an unexpected error', async () => {
    // Arrange
    mockGetPostById.mockRejectedValue(new Error('Unexpected error')); // Simulate an unexpected error
    const call = {
      request: {
        postId: '123',
        author: 'Author',
        content: 'This is a comment',
      },
    };

    // Act
    await createComment(call, callback);

    // Assert
    expect(callback).toHaveBeenCalledWith(
      { code: grpc.status.INTERNAL, message: 'Failed to create comment. Please try again.' },
      null
    );
  });
});
