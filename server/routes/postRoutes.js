const express = require('express');
const router = express.Router();
const {
  getPosts,
  getTopPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getUserDashboard,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { postValidator } = require('../validators/postValidator');
const validate = require('../middleware/validateMiddleware');

// Specific non-ID routes must come BEFORE /:id
router.get('/top', getTopPosts);
router.get('/dashboard/user', protect, getUserDashboard);

router
  .route('/')
  .get(getPosts)
  .post(protect, postValidator, validate, createPost);

router
  .route('/:id')
  .get(getPostById)
  .put(protect, postValidator, validate, updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLikePost);

module.exports = router;
