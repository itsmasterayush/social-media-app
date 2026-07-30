import React, { useState, useEffect } from 'react';
import { getUserDashboardStats, deletePost } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { Link } from 'react-router-dom';
import {
  FileText,
  Heart,
  Eye,
  PlusCircle,
  Edit,
  Trash2,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalViews: 0 });
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Delete Confirmation
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, postId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await getUserDashboardStats();
      setStats(res.stats || { totalPosts: 0, totalLikes: 0, totalViews: 0 });
      setUserPosts(res.posts || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const confirmDelete = (postId) => {
    setDeleteModalState({ isOpen: true, postId });
  };

  const handleDeletePost = async () => {
    if (!deleteModalState.postId) return;
    setIsDeleting(true);
    try {
      await deletePost(deleteModalState.postId);
      toast.success('Post deleted successfully');
      setUserPosts(userPosts.filter((p) => p._id !== deleteModalState.postId));
      setStats((prev) => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setDeleteModalState({ isOpen: false, postId: null });
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading user dashboard..." />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
            alt={user?.username}
            className="w-16 h-16 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-xl bg-slate-900"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Creator Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Manage your posts, track audience reach, and create new content.
            </p>
          </div>
        </div>

        <Link
          to="/create-post"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Post
        </Link>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Posts */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Posts</span>
            <div className="text-3xl font-extrabold text-white mt-1">{stats.totalPosts}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Likes */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Likes</span>
            <div className="text-3xl font-extrabold text-white mt-1">{stats.totalLikes}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6 fill-rose-400" />
          </div>
        </div>

        {/* Total Views */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Views</span>
            <div className="text-3xl font-extrabold text-white mt-1">{stats.totalViews}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* User's Recent Posts Table / Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">Your Published Posts</h2>
          <span className="text-xs text-slate-400">{userPosts.length} posts total</span>
        </div>

        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {userPosts.map((post) => {
              const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
              return (
                <div
                  key={post._id}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <Link
                      to={`/posts/${post._id}`}
                      className="text-lg font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>{post.title}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-1">{post.content}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <div className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                        <Heart className="w-3.5 h-3.5 fill-rose-400" />
                        <span>{likeCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{post.views || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/posts/${post._id}/edit`}
                        className="p-2 rounded-xl text-amber-300 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 transition-colors"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => confirmDelete(post._id)}
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No posts published yet"
            description="Create your first post to start tracking likes, views, and audience engagement!"
            actionText="Write First Post"
            actionLink="/create-post"
          />
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, postId: null })}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
