import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const isAuthenticated = cookies().has("admin_token")

  if (!isAuthenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
