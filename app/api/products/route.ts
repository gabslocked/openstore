import { type NextRequest, NextResponse } from "next/server"
import { getProducts } from "@/lib/products"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") || undefined
    const searchQuery = searchParams.get("search") || undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "30")

    const result = await getProducts(category, searchQuery, page, limit)

    const response = NextResponse.json(result)
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")

    return response
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ products: [], total: 0, error: "Failed to fetch products" }, { status: 500 })
  }
}
