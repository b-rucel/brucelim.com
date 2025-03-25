interface BlogPost {
  title: string;
  href: string;
  date: string; // for sorting
}

// Define your blog posts here in chronological order
const blogPosts: BlogPost[] = [
  {
    title: "Hello World",
    href: "/hello-world",
    date: "2024-03-16"
  },
  {
    title: "Didging SSH: Mastering Secure Connections",
    href: "/digging-ssh-mastering-secure-connections",
    date: "2024-03-17"
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