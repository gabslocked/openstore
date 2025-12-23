import { Suspense } from "react"
import ProductCatalog from "@/components/product-catalog"
import SearchBar from "@/components/search-bar"
import { getProducts } from "@/lib/products"
import LoadingProducts from "@/components/loading-products"
import ErrorFallback from "@/components/error-fallback"
import VideoBanner from "@/components/video-banner"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <VideoBanner />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar />
        </div>

        <Suspense fallback={<LoadingProducts />}>
          <InitialProducts />
        </Suspense>
      </div>
    </div>
  )
}

// Separate async component for initial data fetching
async function InitialProducts() {
  try {
    const { products } = await getProducts(undefined, undefined, 1, 30)

    if (!products || products.length === 0) {
      return <ErrorFallback />
    }

    return <ProductCatalog products={products} groupByCategory={true} />
  } catch (error) {
    console.error("Erro ao carregar a página inicial:", error)
    return <ErrorFallback />
  }
}
