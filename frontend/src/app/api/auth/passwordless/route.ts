import { NextResponse } from "next/server";
import axios from "axios";

/**
 * Next.js Server-Side Route Handler
 * Bypasses the client axios interceptor to safely process 403 authorization states
 */
export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    // 1. Forward directly to FastAPI using raw axios instance (interceptors from api.ts won't run here)
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/passwordless/verify`, {
      email,
      code
    });

    const data = response.data;
    const nextResponse = NextResponse.json({ success: true, user: data.user });

    // 2. Inject authorization cookies directly from the server layer into the client context
    nextResponse.cookies.set("access_token", data.access_token, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    nextResponse.cookies.set("user_role", data.user.role, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return nextResponse;

  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const detail = error.response?.data?.detail || "Eroare la validarea codului.";
    // Forward the 403 status code and error details back to page.tsx cleanly
    return NextResponse.json({ detail }, { status: statusCode });
  }
}