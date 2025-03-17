'use client';
import { JSX, useLayoutEffect, useState } from 'react';
import { highlight } from '../shared/highlighter';

export function CodeBlock({ initial }: { initial?: JSX.Element }) {
  const [nodes, setNodes] = useState(initial);

  return nodes ?? <p>Loading...</p>;
}