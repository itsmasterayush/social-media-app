import React, { useState, useEffect, useCallback } from 'react';
import { getPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { Search, SlidersHorizontal, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search, Sort & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // Debounce search input for instant live search without excessive requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search query
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchFeedPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPosts({
        page,
        limit: 10,
        search: debouncedSearch,
        sort: sortOption,
      });
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      setTotalPosts(data.totalPosts || 0);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please check your connection.');
      toast.error('Could not load posts');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortOption]);

  useEffect(() => {
    fetchFeedPosts();
  }, [fetchFeedPosts]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header Section */}
      <div className="text-center py-8 px-4 relative max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Community Feed</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Discover & Share <span className="gradient-text">Inspiring Stories</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Join the conversation, explore trending insights, and engage with content created by creators worldwide.
        </p>
      </div>

      {/* Control Bar: Search & Sorting */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 shadow-xl">
        {/* Instant Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Sort By:</span>
          </div>
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="bg-slate-900/90 border border-slate-800 text-sm text-slate-200 font-medium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_liked">Most Liked</option>
            <option value="most_viewed">Most Viewed</option>
            <option value="engagement">Highest Engagement</option>
          </select>
        </div>
      </div>

      {/* Feed Status / Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing {posts.length} of {totalPosts} posts
        </span>
        {debouncedSearch && (
          <span>
            Results for "<strong className="text-indigo-400">{debouncedSearch}</strong>"
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-panel p-8 rounded-2xl text-center border border-rose-500/20 my-6">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">{error}</h3>
          <button
            onClick={fetchFeedPosts}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-indigo-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Posts Grid or Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        !error && (
          <EmptyState
            title={debouncedSearch ? 'No matching posts found' : 'No posts yet'}
            description={
              debouncedSearch
                ? `We couldn't find any posts matching "${debouncedSearch}". Try a different keyword.`
                : 'Be the pioneer! Create the very first post for our community.'
            }
          />
        )
      )}

      {/* Server-side Pagination Controls */}
      {!loading && !error && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
};

export default Home;
