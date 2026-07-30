const Post = require('../models/Post');
const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc    Get all posts (Paginated, Searchable, Sortable)
// @route   GET /api/posts
// @access  Public
const getPosts = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || '';
  const sort = req.query.sort || 'newest';

  // Build match filter
  let matchQuery = {};

  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    
    // Find matching author user IDs first to allow searching by Author name as required
    const matchingUsers = await User.find({ username: searchRegex }).select('_id');
    const authorIds = matchingUsers.map((u) => u._id);

    matchQuery.$or = [
      { title: searchRegex },
      { author: { $in: authorIds } },
    ];
  }

  // Determine Pipeline Aggregation for accurate sorting by array length / calculated fields if needed
  let aggregatePipeline = [
    { $match: matchQuery },
    {
      $addFields: {
        likesCount: { $size: '$likes' },
        engagementScore: { $add: [{ $size: '$likes' }, '$views'] },
      },
    },
  ];

  // Sorting logic
  let sortOption = {};
  switch (sort) {
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'most_liked':
      sortOption = { likesCount: -1, createdAt: -1 };
      break;
    case 'most_viewed':
      sortOption = { views: -1, createdAt: -1 };
      break;
    case 'engagement':
      sortOption = { engagementScore: -1, createdAt: -1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  aggregatePipeline.push({ $sort: sortOption });

  // Count total matching posts
  const countPipeline = [...aggregatePipeline, { $count: 'total' }];
  const countResult = await Post.aggregate(countPipeline);
  const totalPosts = countResult.length > 0 ? countResult[0].total : 0;

  // Pagination & Lookup Author
  aggregatePipeline.push({ $skip: skip });
  aggregatePipeline.push({ $limit: limit });

  // Lookup Author User details
  aggregatePipeline.push({
    $lookup: {
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'author',
    },
  });

  aggregatePipeline.push({
    $unwind: '$author',
  });

  // Project fields to conceal user password
  aggregatePipeline.push({
    $project: {
      'author.password': 0,
      'author.__v': 0,
    },
  });

  const posts = await Post.aggregate(aggregatePipeline);

  res.status(200).json({
    success: true,
    count: posts.length,
    totalPosts,
    totalPages: Math.ceil(totalPosts / limit) || 1,
    currentPage: page,
    posts,
  });
});

// @desc    Get Top Posts Leaderboard ranked by engagement (Likes + Views)
// @route   GET /api/posts/top
// @access  Public
const getTopPosts = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const topPosts = await Post.aggregate([
    {
      $addFields: {
        likesCount: { $size: '$likes' },
        engagementScore: { $add: [{ $size: '$likes' }, '$views'] },
      },
    },
    { $sort: { engagementScore: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    { $unwind: '$author' },
    {
      $project: {
        'author.password': 0,
        'author.__v': 0,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: topPosts.length,
    posts: topPosts,
  });
});

// @desc    Get single post by ID & Auto-Increment View Count
// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  // Increment views count by 1 and populate author
  const post = await Post.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'username email avatar createdAt');

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  res.status(200).json({
    success: true,
    post,
  });
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncWrapper(async (req, res) => {
  const { title, content } = req.body;

  const post = await Post.create({
    title,
    content,
    author: req.user._id,
    views: 0,
    likes: [],
  });

  const populatedPost = await Post.findById(post._id).populate(
    'author',
    'username email avatar'
  );

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    post: populatedPost,
  });
});

// @desc    Update an existing post
// @route   PUT /api/posts/:id
// @access  Private (Owner Only)
const updatePost = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  // Check ownership
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You are not authorized to update this post',
    });
  }

  post.title = title || post.title;
  post.content = content || post.content;
  await post.save();

  const updatedPost = await Post.findById(id).populate(
    'author',
    'username email avatar'
  );

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    post: updatedPost,
  });
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Owner Only)
const deletePost = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  // Check ownership
  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You are not authorized to delete this post',
    });
  }

  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});

// @desc    Toggle Like / Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLikePost = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    // Remove like
    post.likes = post.likes.filter(
      (likeId) => likeId.toString() !== userId.toString()
    );
  } else {
    // Add like
    post.likes.push(userId);
  }

  await post.save();

  const updatedPost = await Post.findById(id).populate(
    'author',
    'username email avatar'
  );

  res.status(200).json({
    success: true,
    message: isLiked ? 'Post unliked' : 'Post liked',
    isLiked: !isLiked,
    likeCount: updatedPost.likes.length,
    post: updatedPost,
  });
});

// @desc    Get user dashboard stats & user's posts
// @route   GET /api/posts/dashboard/user
// @access  Private
const getUserDashboard = asyncWrapper(async (req, res) => {
  const userId = req.user._id;

  const userPosts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate('author', 'username email avatar');

  const totalPosts = userPosts.length;
  const totalLikes = userPosts.reduce(
    (acc, post) => acc + (post.likes ? post.likes.length : 0),
    0
  );
  const totalViews = userPosts.reduce((acc, post) => acc + (post.views || 0), 0);

  res.status(200).json({
    success: true,
    stats: {
      totalPosts,
      totalLikes,
      totalViews,
    },
    posts: userPosts,
  });
});

module.exports = {
  getPosts,
  getTopPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getUserDashboard,
};
