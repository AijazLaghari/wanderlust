import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define post schema
const postSchema = new mongoose.Schema({
  authorName: String,
  title: String,
  imageLink: String,
  categories: [String],
  description: String,
  isFeaturedPost: Boolean,
  timeOfPost: { type: Date, default: Date.now },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId() // Add default value
  },
});

// Create post model
const Post = mongoose.model('Post', postSchema);

// Load sample posts data from the JSON file
const samplePostsPath = path.join(__dirname, 'data', 'sample_posts.json');
console.log('Looking for sample posts at:', samplePostsPath);

// Read and parse the JSON file
const samplePostsJson = JSON.parse(fs.readFileSync(samplePostsPath, 'utf8'));

// Convert the JSON data to proper format for MongoDB
const samplePosts = samplePostsJson.map(post => {
  // Extract the ObjectId string from the MongoDB export format
  const id = post._id?.$oid;
  
  // Convert timeOfPost from MongoDB format if it exists
  const timeOfPost = post.timeOfPost?.$date ? new Date(post.timeOfPost.$date) : new Date();
  
  // Return formatted post object
  return {
    ...(id ? { _id: new mongoose.Types.ObjectId(id) } : {}),
    authorName: post.authorName,
    title: post.title,
    imageLink: post.imageLink,
    categories: post.categories,
    description: post.description,
    isFeaturedPost: post.isFeaturedPost,
    timeOfPost: timeOfPost,
    authorId: new mongoose.Types.ObjectId(), // Generate a new authorId if not present
  };
});

// Connect to MongoDB and add sample posts
mongoose.connect('mongodb://localhost:27017/wanderlust')
  .then(async () => {
    console.log('Connected to MongoDB');

    // Delete existing posts
    await Post.deleteMany({});
    console.log('Deleted existing posts');

    // Add sample posts
    const result = await Post.insertMany(samplePosts);
    console.log(`Added ${result.length} sample posts to the database`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  })
  .catch(err => {
    console.error('Error:', err);
  }); 