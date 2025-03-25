'use client';

import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getPreviousNext } from '@/lib/markdown';

export default function BlogPagination() {
  const pathname = usePathname();
  const currentPath = pathname.replace('/blog', '');
  const { prev, next } = getPreviousNext(currentPath);

  return (
    <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 gap-4 py-8">
      <div>
        {prev && (
          <Link
            href={`/blog${prev.href}`}
            className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Previous Post
            </span>
            <span className="mt-1 font-medium">{prev.title}</span>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link
            href={`/blog${next.href}`}
            className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <span className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
              Next Post
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </span>
            <span className="mt-1 font-medium">{next.title}</span>
          </Link>
        )}
      </div>
    </div>
  );
}