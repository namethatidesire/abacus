import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('Claude API route hit'); // Debug log

  try {
    const body = await request.json();
    console.log('Received request body:', JSON.stringify(body).slice(0, 200));

    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not configured');
    }

    // Validate required fields
    if (!body.prompt) {
      throw new Error('Prompt is required');
    }

    const model = body.model || 'claude-3-sonnet-20240229';
    
    // Transform the request to match Claude's API format
    const claudeRequestBody = {
      model: model,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: body.prompt
        }
      ],
      temperature: 0.7
    };

    console.log('Making request to Claude API with body:', JSON.stringify(claudeRequestBody).slice(0, 200));
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequestBody)
    });
    
    console.log('Claude API response status:', response.status);

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Claude API error:', data);
      throw new Error(data.error?.message || 'Error from Claude API');
    }

    // Transform the response to match what our frontend expects
    const transformedResponse = {
      completion: data.content && data.content[0]?.text,
      id: data.id,
      model: data.model
    };

    return NextResponse.json(transformedResponse);
    
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