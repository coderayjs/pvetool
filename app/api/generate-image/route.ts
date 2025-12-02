import { NextRequest, NextResponse } from 'next/server';

// Note: Most screenshot APIs require a URL, not raw HTML
// Since we're generating from React components, client-side html2canvas is the best free solution
// This API route is kept for future server-side solutions if needed

export async function POST(request: NextRequest) {
  // Always return fallback - use client-side html2canvas
  // This is free, works on mobile, and doesn't require external services
  return NextResponse.json(
    { 
      fallback: true // Signal to use client-side generation
    },
    { status: 200 }
  );
}

