"use client";

import React from 'react';

interface DocumentRendererProps {
  htmlContent: string;
  className?: string;
}

export function DocumentRenderer({ htmlContent, className = "" }: DocumentRendererProps) {
  // Clean and safe HTML rendering with custom styles
  const cleanHtml = htmlContent
    .replace(/<a\s+([^>]*?)href="([^"]*)"([^>]*?)>/gi, '<a $1href="$2"$3 target="_blank" rel="noopener noreferrer">')
    .replace(/<ul>/gi, '<ul class="list-disc list-inside space-y-2 ml-4">')
    .replace(/<li>/gi, '<li class="text-gray-300">')
    .replace(/<p>/gi, '<p class="text-gray-300 leading-relaxed mb-4">')
    .replace(/<strong>/gi, '<strong class="text-white font-semibold">')
    .replace(/<h1>/gi, '<h1 class="text-2xl font-bold text-white mb-4">')
    .replace(/<h2>/gi, '<h2 class="text-xl font-bold text-white mb-3">')
    .replace(/<h3>/gi, '<h3 class="text-lg font-semibold text-white mb-2">');

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
      style={{
        color: '#d1d5db',
        lineHeight: '1.7'
      }}
    />
  );
} 