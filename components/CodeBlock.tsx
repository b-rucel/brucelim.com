'use client';
import { JSX, useState } from 'react';

export function CodeBlock({ initial }: { initial?: JSX.Element }) {
  const [nodes] = useState(initial);

  return nodes ?? <p>Loading...</p>;
}