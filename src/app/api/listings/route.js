import { NextResponse } from 'next/server';
import { 
  getListings, 
  updateListingStatus, 
  updateListing, 
  getListingById 
} from '@/app/lib/database';
import { verifyToken, getTokenFromHeaders } from '@/app/lib/auth';

export async function GET(request) {
  try {
    const token = getTokenFromHeaders(request.headers);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const result = getListings(page, limit, status);
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const token = getTokenFromHeaders(request.headers);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, action, status, updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    let updatedListing;

    if (action === 'updateStatus' && status) {
      updatedListing = updateListingStatus(id, status, decoded.email);
    } else if (action === 'edit' && updates) {
      updatedListing = updateListing(id, updates, decoded.email);
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing parameters' },
        { status: 400 }
      );
    }

    if (!updatedListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedListing);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}