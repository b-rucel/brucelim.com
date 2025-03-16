import type { MDXComponents } from 'mdx/types';
import './app/styles/mdx.css';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => <div className="mdx-content">{children}</div>,
    ...components,
  };
}