import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    const { name, relationship, phone, email, address, lat, lng, status, description } = body;

    // Validate required fields
    if (!name || !relationship || !address || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, relationship, address, lat, lng' },
        { status: 400 }
      );
    }

    // For now, we'll use a placeholder user_id. In a real app, you'd get this from authentication
    const user_id = 'placeholder-user-id';

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id,
        name,
        relationship,
        phone,
        email,
        address,
        lat,
        lng,
        status: status || 'safe',
        description,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ contact: data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // For now, we'll use a placeholder user_id. In a real app, you'd get this from authentication
    const user_id = 'placeholder-user-id';

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ contacts: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
