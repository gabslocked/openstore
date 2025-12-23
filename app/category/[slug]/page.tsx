import { Suspense } from "react"
import ProductCatalog from "@/components/product-catalog"
import SearchBar from "@/components/search-bar"
import { getProducts } from "@/lib/products"
import LoadingProducts from "@/components/loading-products"

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  // Decode the URL parameter to replace %20 with spaces
  const decodedSlug = decodeURIComponent(params.slug)
  const { products } = await getProducts(decodedSlug, undefined, 1, 30)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar />
        </div>

        <h2 className="text-xl font-medium mb-6 text-white inline-block relative">
          Categoria: <span className="text-white capitalize font-semibold">{decodedSlug}</span>
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-gray-400 via-gray-500 to-transparent"></span>
        </h2>

        <Suspense fallback={<LoadingProducts />}>
          <ProductCatalog products={products} category={decodedSlug} />
        </Suspense>
      </div>
    </div>
  )
}
