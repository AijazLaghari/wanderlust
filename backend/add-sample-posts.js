import mongoose from 'mongoose';

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
  },
});

// Create post model
const Post = mongoose.model('Post', postSchema);

// Sample posts data
const samplePosts = [
  {
    authorName: 'John Doe',
    title: 'Exploring Paris',
    imageLink: 'https://example.com/paris.jpg',
    categories: ['Europe', 'City', 'Culture'],
    description: 'Experience the magic of Paris with its iconic landmarks and delicious cuisine.',
    isFeaturedPost: true,
    authorId: new mongoose.Types.ObjectId(),
  },
  {
    authorName: 'Jane Smith',
    title: 'Hiking in the Swiss Alps',
    imageLink: 'https://example.com/swiss-alps.jpg',
    categories: ['Europe', 'Mountains', 'Adventure'],
    description: 'Discover the breathtaking views and challenging trails of the Swiss Alps.',
    isFeaturedPost: true,
    authorId: new mongoose.Types.ObjectId(),
  },
  {
    authorName: 'Alex Johnson',
    title: 'Beaches of Thailand',
    imageLink: 'https://example.com/thailand.jpg',
    categories: ['Asia', 'Beach', 'Relaxation'],
    description: 'Relax on the pristine beaches of Thailand with crystal-clear water and white sand.',
    isFeaturedPost: false,
    authorId: new mongoose.Types.ObjectId(),
  },
  {
    authorName: 'Maria Garcia',
    title: 'Exploring Tokyo',
    imageLink: 'https://example.com/tokyo.jpg',
    categories: ['Asia', 'City', 'Culture'],
    description: 'Navigate the vibrant streets of Tokyo and experience Japanese culture.',
    isFeaturedPost: false,
    authorId: new mongoose.Types.ObjectId(),
  },
  {
    authorName: 'Sam Wilson',
    title: 'Safari in Kenya',
    imageLink: 'https://example.com/kenya.jpg',
    categories: ['Africa', 'Wildlife', 'Adventure'],
    description: 'Witness the incredible wildlife of Kenya on an unforgettable safari adventure.',
    isFeaturedPost: true,
    authorId: new mongoose.Types.ObjectId(),
  }
];

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