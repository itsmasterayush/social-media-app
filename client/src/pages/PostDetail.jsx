import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostById, deletePost, toggleLikePost } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate, formatRelativeTime } from '../utils/formatDate';
import {
  Heart,
  Eye,
  Calendar,
  User as UserIcon,
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Like State
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPostById(id);
        setPost(res.post);

        const likes = Array.isArray(res.post.likes) ? res.post.likes : [];
        setLikeCount(likes.length);
        if (user?._id) {
          setIsLiked(likes.some((likeId) => likeId.toString() === user._id.toString()));
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.response?.data?.message || 'Post not found');
        toast.error('Could not load post details');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      navigate('/login');
      return;
    }

    if (isLiking || !post) return;

    const prevLiked = isLiked;
    const prevCount = likeCount;

    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    setIsLiking(true);

    try {
      const res = await toggleLikePost(post._id);
      setIsLiked(res.isLiked);
      setLikeCount(res.likeCount);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error('Failed to update like status');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post._id);
      toast.success('Post deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Post link copied to clipboard!');
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading post details..." />;

  if (error || !post) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center max-w-lg mx-auto my-12 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-2">Post Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">{error || "The post you're looking for doesn't exist."}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>
      </div>
    );
  }

  const isOwner = user?._id && post.author?._id && user._id.toString() === post.author._id.toString();
  const authorName = post.author?.username || 'Anonymous User';
  const authorAvatar =
    post.author?.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </Link>

      {/* Main Post Container */}
      <article className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Accent Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Author & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-12 h-12 rounded-full border border-slate-700 object-cover shadow-md"
            />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {authorName}
                {isOwner && (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    Author
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {formatDate(post.createdAt)}
                </span>
                <span>•</span>
                <span>{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Owner Actions & Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Share Link"
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {isOwner && (
              <>
                <Link
                  to={`/posts/${post._id}/edit`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Link>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Post Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug mb-6">
          {post.title}
        </h1>

        {/* Post Content */}
        <div className="text-slate-200 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4 mb-8 font-normal">
          {post.content}
        </div>

        {/* Footer Metrics & Like Action */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
                  : 'bg-slate-900/90 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
              <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            </button>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-800">
              <Eye className="w-5 h-5 text-indigo-400" />
              <span>{post.views || 0} Views</span>
            </div>
          </div>

          <span className="text-xs text-slate-500">
            Last updated {formatRelativeTime(post.updatedAt)}
          </span>
        </div>
      </article>

      {/* Delete Confirmation Modal Dialog */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? This action cannot be reversed."
        confirmText="Yes, Delete Post"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PostDetail;
