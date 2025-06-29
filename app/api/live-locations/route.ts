import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Types for live location updates
interface LiveLocationUpdate {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

interface CreateLiveLocationDTO {
  name: string;
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  is_sharing: boolean;
  share_with?: string[]; // Array of user IDs to share with
}

// Validation functions
const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const validateLiveLocationData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof data.lat !== 'number' || typeof data.lng !== 'number') {
    errors.push('Latitude and longitude must be numbers');
  } else if (!validateCoordinates(data.lat, data.lng)) {
    errors.push('Invalid coordinates: lat must be between -90 and 90, lng between -180 and 180');
  }

  if (data.accuracy !== undefined && (typeof data.accuracy !== 'number' || data.accuracy < 0)) {
    errors.push('Accuracy must be a positive number');
  }

  if (data.heading !== undefined && (typeof data.heading !== 'number' || data.heading < 0 || data.heading >= 360)) {
    errors.push('Heading must be a number between 0 and 359');
  }

  if (data.speed !== undefined && (typeof data.speed !== 'number' || data.speed < 0)) {
    errors.push('Speed must be a positive number');
  }

  return { valid: errors.length === 0, errors };
};

// GET - Retrieve live locations that are shared with the current user
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeOwn = searchParams.get('include_own') === 'true';

    // Get live locations shared with this user or their own if requested
    let query = supabase
      .from('live_locations')
      .select(`
        *,
        user:profiles(id, name, avatar_url)
      `)
      .eq('is_sharing', true)
      .gte('last_updated', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Only locations updated in last 30 minutes
      .order('last_updated', { ascending: false });

    if (includeOwn) {
      // Include user's own location or locations shared with them
      query = query.or(`user_id.eq.${user.id},share_with.cs.{${user.id}}`);
    } else {
      // Only locations shared with this user (not their own)
      query = query.contains('share_with', [user.id]);
    }

    const { data: liveLocations, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to retrieve live locations" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: liveLocations || [],
      count: liveLocations?.length || 0 
    });
  } catch (error) {
    console.error('GET /api/live-locations error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve live locations" }, 
      { status: 500 }
    );
  }
}

// POST - Create or update live location
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateLiveLocationData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors }, 
        { status: 400 }
      );
    }

    // Check if user already has a live location entry
    const { data: existingLocation } = await supabase
      .from('live_locations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const locationData = {
      user_id: user.id,
      name: body.name || 'My Location',
      lat: body.lat,
      lng: body.lng,
      accuracy: body.accuracy || null,
      heading: body.heading || null,
      speed: body.speed || null,
      is_sharing: body.is_sharing !== false, // Default to true
      share_with: body.share_with || [],
      last_updated: new Date().toISOString(),
    };

    let result;
    if (existingLocation) {
      // Update existing location
      const { data: updatedLocation, error } = await supabase
        .from('live_locations')
        .update(locationData)
        .eq('id', existingLocation.id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { success: false, error: "Failed to update live location" }, 
          { status: 500 }
        );
      }
      result = updatedLocation;
    } else {
      // Create new location
      const { data: newLocation, error } = await supabase
        .from('live_locations')
        .insert(locationData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { success: false, error: "Failed to create live location" }, 
          { status: 500 }
        );
      }
      result = newLocation;
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: existingLocation ? "Live location updated successfully" : "Live location created successfully"
    }, { status: existingLocation ? 200 : 201 });
  } catch (error) {
    console.error('POST /api/live-locations error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to process live location" }, 
      { status: 500 }
    );
  }
}

// PUT - Update sharing settings
export async function PUT(request: Request) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { is_sharing, share_with } = body;

    if (typeof is_sharing !== 'boolean') {
      return NextResponse.json(
        { success: false, error: "is_sharing must be a boolean" }, 
        { status: 400 }
      );
    }

    // Update sharing settings
    const { data: updatedLocation, error } = await supabase
      .from('live_locations')
      .update({ 
        is_sharing,
        share_with: share_with || [],
        last_updated: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to update sharing settings" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedLocation,
      message: "Sharing settings updated successfully" 
    });
  } catch (error) {
    console.error('PUT /api/live-locations error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to update sharing settings" }, 
      { status: 500 }
    );
  }
}

// DELETE - Stop sharing live location
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Set is_sharing to false instead of deleting the record
    const { data: updatedLocation, error } = await supabase
      .from('live_locations')
      .update({ 
        is_sharing: false,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to stop location sharing" }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: updatedLocation,
      message: "Location sharing stopped successfully" 
    });
  } catch (error) {
    console.error('DELETE /api/live-locations error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to stop location sharing" }, 
      { status: 500 }
    );
  }
}
