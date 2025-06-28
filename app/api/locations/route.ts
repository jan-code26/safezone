import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Types
interface CreateLocationDTO {
  name: string;
  lat: number;
  lng: number;
  type: 'person' | 'property';
  status?: 'safe' | 'at_risk' | 'unknown';
  location: string;
}

interface UpdateLocationDTO extends Partial<CreateLocationDTO> {
  id: number;
}

// Validation functions
const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const validateLocationType = (type: string): type is 'person' | 'property' => {
  return type === 'person' || type === 'property';
};

const validateStatus = (status: string): status is 'safe' | 'at_risk' | 'unknown' => {
  return status === 'safe' || status === 'at_risk' || status === 'unknown';
};

const validateCreateLocation = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (typeof data.lat !== 'number' || typeof data.lng !== 'number') {
    errors.push('Latitude and longitude must be numbers');
  } else if (!validateCoordinates(data.lat, data.lng)) {
    errors.push('Invalid coordinates: lat must be between -90 and 90, lng between -180 and 180');
  }

  if (!data.type || !validateLocationType(data.type)) {
    errors.push('Type must be either "person" or "property"');
  }

  if (data.status && !validateStatus(data.status)) {
    errors.push('Status must be "safe", "at_risk", or "unknown"');
  }

  if (!data.location || typeof data.location !== 'string') {
    errors.push('Location description is required');
  }

  return { valid: errors.length === 0, errors };
};

// GET - Retrieve all locations for authenticated user
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const statusFilter = searchParams.get('status');

    // Build query
    let query = supabase
      .from('locations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (typeFilter && validateLocationType(typeFilter)) {
      query = query.eq('type', typeFilter);
    }

    if (statusFilter && validateStatus(statusFilter)) {
      query = query.eq('status', statusFilter);
    }

    const { data: locations, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to retrieve locations" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: locations || [],
      count: locations?.length || 0 
    });
  } catch (error) {
    console.error('GET /api/locations error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve locations" }, 
      { status: 500 }
    );
  }
}

// POST - Create new location
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
    const validation = validateCreateLocation(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors }, 
        { status: 400 }
      );
    }

    // Insert into database
    const { data: newLocation, error } = await supabase
      .from('locations')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        lat: body.lat,
        lng: body.lng,
        type: body.type,
        status: body.status || 'unknown',
        location: body.location.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to create location" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: newLocation,
      message: "Location created successfully" 
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/locations error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to create location" }, 
      { status: 500 }
    );
  }
}

// PUT - Update existing location
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

    const body: UpdateLocationDTO = await request.json();
    
    if (!body.id || typeof body.id !== 'number') {
      return NextResponse.json(
        { success: false, error: "Valid location ID is required" }, 
        { status: 400 }
      );
    }

    // Validate updates
    const errors: string[] = [];
    
    if (body.lat !== undefined || body.lng !== undefined) {
      if (body.lat !== undefined && body.lng !== undefined) {
        if (!validateCoordinates(body.lat, body.lng)) {
          errors.push('Invalid coordinates');
        }
      } else {
        errors.push('Both latitude and longitude must be provided together');
      }
    }

    if (body.type !== undefined && !validateLocationType(body.type)) {
      errors.push('Invalid location type');
    }

    if (body.status !== undefined && !validateStatus(body.status)) {
      errors.push('Invalid status');
    }

    if (body.name !== undefined && (!body.name || body.name.trim().length === 0)) {
      errors.push('Name cannot be empty');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, errors }, 
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      last_updated: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.lat !== undefined) updateData.lat = body.lat;
    if (body.lng !== undefined) updateData.lng = body.lng;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.location !== undefined) updateData.location = body.location.trim();

    // Update in database
    const { data: updatedLocation, error } = await supabase
      .from('locations')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', user.id) // Ensure user owns this location
      .select()
      .single();

    if (error || !updatedLocation) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: "Location not found" }, 
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to update location" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedLocation,
      message: "Location updated successfully" 
    });
  } catch (error) {
    console.error('PUT /api/locations error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to update location" }, 
      { status: 500 }
    );
  }
}

// DELETE - Remove location
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "Valid location ID is required" }, 
        { status: 400 }
      );
    }
    
    const locationId = parseInt(id);

    // Delete from database
    const { data: deletedLocation, error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId)
      .eq('user_id', user.id) // Ensure user owns this location
      .select()
      .single();

    if (error || !deletedLocation) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: "Location not found" }, 
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to delete location" }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: deletedLocation,
      message: "Location deleted successfully" 
    });
  } catch (error) {
    console.error('DELETE /api/locations error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to delete location" }, 
      { status: 500 }
    );
  }
}

// PATCH - Quick status update
export async function PATCH(request: Request) {
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
    const { id, status } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { success: false, error: "Valid location ID is required" }, 
        { status: 400 }
      );
    }

    if (!status || !validateStatus(status)) {
      return NextResponse.json(
        { success: false, error: "Valid status is required" }, 
        { status: 400 }
      );
    }

    // Update status in database
    const { data: updatedLocation, error } = await supabase
      .from('locations')
      .update({ 
        status, 
        last_updated: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this location
      .select()
      .single();

    if (error || !updatedLocation) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: "Location not found" }, 
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: "Failed to update status" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedLocation,
      message: "Status updated successfully" 
    });
  } catch (error) {
    console.error('PATCH /api/locations error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to update status" }, 
      { status: 500 }
    );
  }
}