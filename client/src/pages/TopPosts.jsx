import React, { useState, useEffect } from 'react';
import { getTopPosts } from '../services/postService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';
import { Trophy, Heart, Eye, Flame, ArrowRight, Medal, Award } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const TopPosts = () => {
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTopPosts(20);
        setTopPosts(res.posts || []);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError('Failed to load top posts leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchTop();
  }, []);

  if (loading) return <LoadingSpinner fullScreen text="Calculating top engagement rankings..." />;

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 font-black text-lg">
            <Trophy className="w-5 h-5 fill-amber-400" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 rounded-2xl bg-slate-300/20 border border-slate-300/40 text-slate-300 flex items-center justify-center shadow-lg shrink-0 font-black text-lg">
            <Medal className="w-5 h-5 fill-slate-300" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-700/20 border border-amber-700/40 text-amber-600 flex items-center justify-center shadow-lg shrink-0 font-black text-lg">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center py-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
          <Trophy className="w-4 h-4 fill-amber-400" />
          <span>Hall of Fame</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Top Posts <span className="gradient-text">Leaderboard</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Ranked by Engagement Score (<code className="text-indigo-400 bg-slate-900 px-2 py-0.5 rounded font-mono text-xs">Score = Likes + Views</code>). The most impactful posts across our platform.
        </p>
      </div>

      {/* Leaderboard Table / Cards */}
      {topPosts.length > 0 ? (
        <div className="space-y-4">
          {topPosts.map((post, index) => {
            const rank = index + 1;
            const likesCount = Array.isArray(post.likes) ? post.likes.length : (post.likesCount || 0);
            const viewsCount = post.views || 0;
            const score = post.engagementScore !== undefined ? post.engagementScore : likesCount + viewsCount;
            const authorName = post.author?.username || 'Anonymous User';
            const authorAvatar =
              post.author?.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`;

            return (
              <div
                key={post._id}
                className={`glass-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
                  rank === 1
                    ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-slate-900/90 shadow-xl shadow-amber-500/5'
                    : 'border-slate-800'
                }`}
              >
                {/* Left Side: Rank Badge + Title & Author */}
                <div className="flex items-start sm:items-center gap-4">
                  {getRankBadge(rank)}

                  <div className="space-y-1">
                    <Link
                      to={`/posts/${post._id}`}
                      className="text-lg font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="font-medium text-slate-300">{authorName}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Stats & Score Pill */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                      <Heart className="w-3.5 h-3.5 fill-rose-400" />
                      <span>{likesCount} Likes</span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{viewsCount} Views</span>
                    </div>
                  </div>

                  {/* Engagement Score Pill */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase font-extrabold text-slate-500">Score</span>
                      <span className="text-base font-extrabold text-white flex items-center gap-1">
                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {score}
                      </span>
                    </div>

                    <Link
                      to={`/posts/${post._id}`}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No ranked posts yet"
          description="Be the first to publish a post and claim the #1 spot on the leaderboard!"
        />
      )}
    </div>
  );
};

export default TopPosts;
