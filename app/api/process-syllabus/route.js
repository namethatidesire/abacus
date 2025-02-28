import { NextResponse } from 'next/server';

// Note: config export is not needed in App Router

export async function POST(request) {
  console.log('API route hit'); // Debug log

  try {
    const body = await request.json();
    console.log('Received request body structure:', {
      model: body.model,
      messagesLength: body.messages?.length,
      contentTypes: body.messages?.[0]?.content?.map(c => c.type)
    });

    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not configured');
    }

    console.log('Making request to Claude API with body:', JSON.stringify(body).slice(0, 200));
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    
    console.log('Claude API response status:', response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Claude API error:', data);
      throw new Error(data.error?.message || 'Error from Claude API');
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'An error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}