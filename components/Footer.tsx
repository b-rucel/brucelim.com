export default function Footer() {
  return (
    <footer className="mt-20 py-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-6">
            <a target="_blank" href="https://github.com/b-rucel" className="link-underline text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              GitHub
            </a>
            <a target="_blank" href="https://x.com/b_rucel" className="link-underline text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Twitter
            </a>
            <a target="_blank" href="https://www.linkedin.com/in/bruce-lim-7bb117a/" className="link-underline text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              LinkedIn
            </a>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Bruce Lim. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}