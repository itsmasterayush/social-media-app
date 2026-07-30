import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getPostById, updatePost } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await getPostById(id);
        const post = res.post;

        // Check ownership
        if (user?._id && post.author?._id && user._id.toString() !== post.author._id.toString()) {
          toast.error('You are not authorized to edit this post');
          navigate(`/posts/${id}`);
          return;
        }

        setValue('title', post.title);
        setValue('content', post.content);
      } catch (error) {
        toast.error('Failed to load post for editing');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await updatePost(id, data);
      toast.success('Post updated successfully!');
      navigate(`/posts/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading post data..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to={`/posts/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Cancel Editing
      </Link>

      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Edit Post
            </h1>
            <p className="text-xs text-slate-400">Update your published post details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Post Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter post title..."
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
                maxLength: {
                  value: 150,
                  message: 'Title cannot exceed 150 characters',
                },
              })}
              className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                errors.title
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs font-medium text-rose-400 mt-1.5">{errors.title.message}</p>
            )}
          </div>

          {/* Content Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Post Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={8}
              placeholder="Write post content..."
              {...register('content', {
                required: 'Content is required',
                minLength: {
                  value: 10,
                  message: 'Content must be at least 10 characters',
                },
              })}
              className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all resize-y ${
                errors.content
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              }`}
            />
            {errors.content && (
              <p className="text-xs font-medium text-rose-400 mt-1.5">{errors.content.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              to={`/posts/${id}`}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-600/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
