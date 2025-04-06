interface BlogPost {
  title: string;
  href: string;
  date: string;
}

// need to move this out to its own file
const blogPosts: BlogPost[] = [
  {
    title: "Hello World",
    href: "/hello-world",
    date: "2024-03-16"
  },
  {
    title: "Digging SSH: Mastering Secure Connections",
    href: "/digging-ssh-mastering-secure-connections",
    date: "2024-03-24"
  },
  {
    title: "3D Airplane Demo with React and Three.js",
    href: "/threejs-plane-demo",
    date: "2024-03-28"
  },
  {
    title: "Launch Your Website Using Cloudflare Pages",
    href: "/launch-your-website-using-cloudflare-pages/page.mdx",
    date: "2024-04-05"
  },
  // Add more posts as you create them
];

export function getPreviousNext(currentPath: string) {
  const currentIndex = blogPosts.findIndex(post => post.href === currentPath);
  
  return {
    prev: currentIndex > 0 ? blogPosts[currentIndex - 1] : null,
    next: currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null
  };
}