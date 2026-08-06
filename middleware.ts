import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  // Проверяем куку сессии
  const cookie = request.cookies.get(`sb-${supabaseUrl.replace("https://", "").replace(".supabase.co", "")}-auth-token`);
  const path = request.nextUrl.pathname;
  
  const publicPaths = ["/auth"];
  const isPublic = publicPaths.includes(path);
  
  // Если нет куки и путь не публичный — редирект на /auth
  if (!cookie && !isPublic) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  
  // Если есть кука и путь /auth — редирект на /
  if (cookie && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
