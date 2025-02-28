import { prisma } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, color } = await request.json();
    
    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }
    
    // Try to find existing tag first
    let tag = await prisma.tag.findUnique({
      where: { name }
    });

    // If tag doesn't exist, create it
    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          name,
          color
        }
      });
      return NextResponse.json(tag, { status: 201 });
    }
    
    // If tag exists but has a different color, update it
    if (tag.color !== color) {
      tag = await prisma.tag.update({
        where: { name },
        data: { color }
      });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error handling tag:', error);
    return NextResponse.json(
      { error: 'Failed to handle tag', details: error.message },
      { status: 500 }
    );
  }
}