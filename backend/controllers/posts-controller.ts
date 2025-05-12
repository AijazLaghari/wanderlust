import Post from '../models/post.js';
import User from '../models/user.js';
import { deleteDataFromCache, storeDataInCache } from '../utils/cache-posts.js';
import { HTTP_STATUS, REDIS_KEYS, RESPONSE_MESSAGES, validCategories } from '../utils/constants.js';

// Using any types to resolve type issues
type Request = any;
type Response = any;

export const createPostHandler = async (req: Request, res: Response) => {
  try {
    const {
      title,
      authorName,
      imageLink,
      categories,
      description,
      isFeaturedPost = false,
    } = req.body;
    const userId = req.user._id;

    // Validation - check if all fields are filled
    if (!title || !authorName || !imageLink || !description || !categories) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS });
    }

    // Validation - check if imageLink is a valid URL
    const imageLinkRegex = /\.(jpg|jpeg|png|webp)$/i;
    if (!imageLinkRegex.test(imageLink)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_IMAGE_URL });
    }

    // Validation - check if categories array has more than 3 items
    if (categories.length > 3) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.POSTS.MAX_CATEGORIES });
    }

    const post = new Post({
      title,
      authorName,
      imageLink,
      description,
      categories,
      isFeaturedPost,
      authorId: req.user._id,
    });

    const [savedPost] = await Promise.all([
      post.save(), // Save the post
      deleteDataFromCache(REDIS_KEYS.ALL_POSTS), // Invalidate cache for all posts
      deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS), // Invalidate cache for featured posts
      deleteDataFromCache(REDIS_KEYS.LATEST_POSTS), // Invalidate cache for latest posts
    ]);

    // updating user doc to include the ObjectId of the created post
    await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });

    res.status(HTTP_STATUS.OK).json(savedPost);
  } catch (err: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err });
  }
};

export const getAllPostsHandler = async (req: Request, res: Response) => {
  try {
    console.log('Fetching all posts from database...');
    const posts = await Post.find();
    console.log(`Found ${posts.length} posts in database`);
    await storeDataInCache(REDIS_KEYS.ALL_POSTS, posts);
    return res.status(HTTP_STATUS.OK).json(posts);
  } catch (err: any) {
    console.error('Error fetching all posts:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getFeaturedPostsHandler = async (req: Request, res: Response) => {
  try {
    console.log('Fetching featured posts from database...');
    const featuredPosts = await Post.find({ isFeaturedPost: true });
    console.log(`Found ${featuredPosts.length} featured posts in database`);
    await storeDataInCache(REDIS_KEYS.FEATURED_POSTS, featuredPosts);
    res.status(HTTP_STATUS.OK).json(featuredPosts);
  } catch (err: any) {
    console.error('Error fetching featured posts:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getPostByCategoryHandler = async (req: Request, res: Response) => {
  const category = req.params.category;
  try {
    // Validation - check if category is valid
    if (!validCategories.includes(category)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY });
    }

    const categoryPosts = await Post.find({ categories: category });
    res.status(HTTP_STATUS.OK).json(categoryPosts);
  } catch (err: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getLatestPostsHandler = async (req: Request, res: Response) => {
  try {
    console.log('Fetching latest posts from database...');
    const latestPosts = await Post.find().sort({ timeOfPost: -1 });
    console.log(`Found ${latestPosts.length} latest posts in database`);
    await storeDataInCache(REDIS_KEYS.LATEST_POSTS, latestPosts);
    res.status(HTTP_STATUS.OK).json(latestPosts);
  } catch (err: any) {
    console.error('Error fetching latest posts:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getPostByIdHandler = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    // Validation - check if post exists
    if (!post) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
    }

    res.status(HTTP_STATUS.OK).json(post);
  } catch (err: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const updatePostHandler = async (req: Request, res: Response) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Validation - check if post exists
    if (!updatedPost) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
    }
    // invalidate the redis cache
    await deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
      await deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
      await deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
      await res.status(HTTP_STATUS.OK).json(updatedPost);
  } catch (err: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const deletePostByIdHandler = async (req: Request, res: Response) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    // Validation - check if post exists
    if (!post) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.POSTS.NOT_FOUND });
    }
    await User.findByIdAndUpdate(post.authorId, { $pull: { posts: req.params.id } });

    // invalidate the redis cache
    await deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
      await deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
      await deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
      res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.POSTS.DELETED });
  } catch (err: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getRelatedPostsByCategories = async (req: Request, res: Response) => {
  const { categories } = req.query;
  if (!categories) {
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY });
  }
  try {
    const filteredCategoryPosts = await Post.find({
      categories: { $in: categories },
    });
    res.status(HTTP_STATUS.OK).json(filteredCategoryPosts);
  } catch (err: any) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};
