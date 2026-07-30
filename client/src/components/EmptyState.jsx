import React from 'react';
import { FileQuestion, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  title = 'No posts found',
  description = 'There are no posts available at the moment. Be the first to create one!',
  actionText = 'Create a Post',
  actionLink = '/create-post',
  showAction = true,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-slate-800 my-8 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-sm leading-relaxed">
        {description}
      </p>
      {showAction && (
        <Link
          to={actionLink}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
