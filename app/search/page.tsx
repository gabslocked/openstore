import { Suspense } from "react"
import ProductCatalog from "@/components/product-catalog"
import SearchBar from "@/components/search-bar"
import { getProducts } from "@/lib/products"
import LoadingProducts from "@/components/loading-products"

export default async function SearchPage({ searchParams }: { searchParams: { q: string } }) {
  const query = searchParams.q || ""
  const { products } = await getProducts(undefined, query, 1, 30)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar defaultValue={query} />
        </div>

        <h2 className="text-xl font-medium mb-6 text-white inline-block relative">
          Resultados para: <span className="text-white font-semibold">"{query}"</span>
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-gray-400 via-gray-500 to-transparent"></span>
        </h2>

        <Suspense fallback={<LoadingProducts />}>
          <ProductCatalog products={products} searchQuery={query} />
        </Suspense>
      </div>
    </div>
  )
}
