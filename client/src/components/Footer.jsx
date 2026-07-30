import React from 'react';
import { Flame, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">PulsePost</span>
          <span className="text-slate-600">|</span>
          <span>Full-Stack Social Platform</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>using Node.js, Express, React, and MongoDB</span>
        </div>

        <div className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} PulsePost Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
