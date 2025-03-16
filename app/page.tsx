export default function Home() {
  return (
    <div className="min-h-screen px-6 py-16 md:px-12 lg:px-24 bg-white dark:bg-black bg-custom">
      <main className="max-w-2xl mx-auto space-y-16 bg-white/50 dark:bg-black/50 backdrop-blur-sm p-8 rounded-xl">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="relative w-56 mx-auto mb-8">
            <img
              src="/images/3d.avatar.jpg"
              alt="Bruce Lim"
              className="rounded-xl object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Bruce Lim
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Software Engineer & Developer focused on building products that matter.
          </p>
        </section>

        {/* About Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">About</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            I'm a software engineer based in Los Angeles. I specialize in building
            high-quality web applications with modern technologies like React, Next.js,
            and TypeScript. Currently working on projects that push the boundaries of
            web development.
          </p>
        </section>

        {/* Featured Work */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold">Featured Work</h2>
          <div className="space-y-8">
            <article className="group">
              <a href="/blog/hello-world" className="block space-y-2">
                <h3 className="text-xl font-medium group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                  Hello World
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A deep dive into modern web development practices and tools.
                </p>
                <time className="text-sm text-gray-500 dark:text-gray-500">
                  January 1, 2024
                </time>
              </a>
            </article>
            {/* Add more articles as needed */}
          </div>
        </section>

        {/* Contact/Social Links */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Connect</h2>
          <div className="flex space-x-6">
            <a
              href="https://github.com/b-rucel"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://x.com/b_rucel"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="mailto:your.email@example.com"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Email
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
