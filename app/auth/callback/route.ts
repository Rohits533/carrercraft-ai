import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with explicit fetch timeout options to prevent 25s hangs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    // Basic validation to fail fast
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        // Enforce a strict 10s fetch timeout inside serverless execution
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000), // 10 second safety limit
          });
        },
      },
    });

    // Attempt Sign Up / Sign In
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('[Auth API Error]:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    // Always return a clean JSON response
    return NextResponse.json(
      { message: 'Account created successfully', user: data.user },
      { status: 200 }
    );

  } catch (err: any) {
    console.error('[Server Function Error]:', err);

    // If fetch times out or server crashes, return a 504 / 500 status instead of dropping connection
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Auth provider network connection timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
