import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/wanderlust')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get the Post collection and count documents
    const postCount = await mongoose.connection.collection('posts').countDocuments();
    console.log(`Total number of posts in database: ${postCount}`);
    
    // Count featured posts
    const featuredPostCount = await mongoose.connection.collection('posts').countDocuments({ isFeaturedPost: true });
    console.log(`Number of featured posts: ${featuredPostCount}`);
    
    // Get a sample of all posts
    if (postCount > 0) {
      console.log('\n=== SAMPLE OF ALL POSTS ===');
      const posts = await mongoose.connection.collection('posts').find({}).limit(3).toArray();
      console.log(JSON.stringify(posts, null, 2));
    }
    
    // Get a sample of featured posts
    if (featuredPostCount > 0) {
      console.log('\n=== SAMPLE OF FEATURED POSTS ===');
      const featuredPosts = await mongoose.connection.collection('posts').find({ isFeaturedPost: true }).limit(2).toArray();
      console.log(JSON.stringify(featuredPosts, null, 2));
    }
    
    // Check Redis cache keys if Redis client is available
    try {
      console.log('\n=== CHECKING REDIS CACHE ===');
      // Import Redis dynamically
      const redis = await import('redis');
      const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });
      await client.connect();
      
      // Check if cache keys exist
      const keys = await client.keys('wanderlust:*');
      console.log('Redis cache keys:', keys);
      
      // Get cache data for specific keys
      if (keys.includes('wanderlust:all-posts')) {
        const allPostsCache = await client.get('wanderlust:all-posts');
        console.log('all-posts cache exists, length:', JSON.parse(allPostsCache).length);
      }
      
      if (keys.includes('wanderlust:featured-posts')) {
        const featuredPostsCache = await client.get('wanderlust:featured-posts');
        console.log('featured-posts cache exists, length:', JSON.parse(featuredPostsCache).length);
      }
      
      if (keys.includes('wanderlust:latest-posts')) {
        const latestPostsCache = await client.get('wanderlust:latest-posts');
        console.log('latest-posts cache exists, length:', JSON.parse(latestPostsCache).length);
      }
      
      await client.quit();
    } catch (error) {
      console.log('Redis check failed:', error.message);
    }
    
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  }); 