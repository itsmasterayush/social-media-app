import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, ArrowRight, Clock, User as UserIcon } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import { toggleLikePost } from '../services/postService';
import toast from 'react-hot-toast';

const PostCard = ({ post, onLikeToggle }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const initialLikes = Array.isArray(post.likes) ? post.likes : [];
  const currentUserId = user?._id;

  const [isLiked, setIsLiked] = useState(
    currentUserId ? initialLikes.some((id) => id.toString() === currentUserId.toString()) : false
  );
  const [likeCount, setLikeCount] = useState(initialLikes.length);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      navigate('/login');
      return;
    }

    if (isLiking) return;

    // Optimistic UI update
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!previousIsLiked);
    setLikeCount(previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1);
    setIsLiking(true);

    try {
      const res = await toggleLikePost(post._id);
      setIsLiked(res.isLiked);
      setLikeCount(res.likeCount);
      if (onLikeToggle) onLikeToggle(post._id, res.isLiked, res.likeCount);
    } catch (error) {
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      toast.error('Failed to update like status');
    } finally {
      setIsLiking(false);
    }
  };

  const authorName = post.author?.username || 'Anonymous User';
  const authorAvatar =
    post.author?.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Author Header & Date */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-3">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full border border-slate-700/80 bg-slate-800 object-cover"
            />
            <div>
              <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                {authorName}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
            {formatDate(post.createdAt)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/posts/${post._id}`}>
          <h3 className="text-xl font-bold text-white mb-2.5 line-clamp-2 leading-snug hover:text-indigo-400 transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* Content Preview */}
        <p className="text-slate-300 text-sm line-clamp-3 mb-6 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Card Footer: Metrics & View Details */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              isLiked
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/50'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
            <span>{likeCount}</span>
          </button>

          {/* View Count */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/40 px-2.5 py-1.5 rounded-full border border-slate-800">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>{post.views || 0}</span>
          </div>
        </div>

        {/* View Details Button */}
        <Link
          to={`/posts/${post._id}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition-all"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
