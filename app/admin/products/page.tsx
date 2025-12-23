"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload, Link, ArrowLeft, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  original_price?: number
  stock: number
  visible: boolean
  category_name?: string
  category_ids?: string[]
  images?: string[]
  created_at: string
}

interface Category {
  id: string
  name: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Product>>({})
  const [newImageUrl, setNewImageUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check admin authentication via API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check')
        if (!response.ok) {
          router.push('/login')
          return
        }
        
        const data = await response.json()
        if (!data.authenticated) {
          router.push('/login')
          return
        }

        // Load products and categories if authenticated
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/admin/products', { credentials: 'include' }),
          fetch('/api/admin/categories', { credentials: 'include' })
        ])
        
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData.products || [])
          setFilteredProducts(productsData.products || [])
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.categories || [])
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const startEditing = (product: Product) => {
    setEditingProduct(product.id)
    setEditData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price || 0,
      stock: product.stock,
      visible: product.visible,
      category_ids: product.category_ids || [],
      images: product.images || []
    })
    setNewImageUrl('')
  }

  const cancelEditing = () => {
    setEditingProduct(null)
    setEditData({})
    setNewImageUrl('')
  }

  const saveProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editData)
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, ...editData }
          : product
      ))
      setFilteredProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, ...editData }
          : product
      ))
      
      cancelEditing()
    } catch (error) {
      console.error('Error updating product:', error)
      setError('Failed to update product')
    }
  }

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setEditData(prev => ({
        ...prev,
        images: [...(prev.images || []), newImageUrl.trim()]
      }))
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setEditData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }))
  }

  const toggleCategory = (categoryId: string) => {
    setEditData(prev => {
      const currentCategories = prev.category_ids || []
      const isSelected = currentCategories.includes(categoryId)
      return {
        ...prev,
        category_ids: isSelected 
          ? currentCategories.filter(id => id !== categoryId)
          : [...currentCategories, categoryId]
      }
    })
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      // Update local state
      setProducts(prev => prev.filter(product => product.id !== productId))
      setFilteredProducts(prev => prev.filter(product => product.id !== productId))
    } catch (error) {
      console.error('Error deleting product:', error)
      setError('Failed to delete product')
    }
  }

  const addNewProduct = async () => {
    try {
      const newProduct = {
        name: 'Novo Produto',
        description: '',
        price: 0,
        original_price: 0,
        stock: 0,
        visible: true,
        category_ids: [],
        images: []
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newProduct)
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      const data = await response.json()
      const createdProduct = { ...newProduct, id: data.id, created_at: new Date().toISOString() }
      
      setProducts(prev => [createdProduct, ...prev])
      setFilteredProducts(prev => [createdProduct, ...prev])
      startEditing(createdProduct)
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Failed to create product')
    }
  }

  useEffect(() => {
    // Filter products based on search term
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProducts(filtered)
    }
  }, [products, searchTerm])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando produtos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md py-6 border-b border-gray-600/30 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-gray-300 transition-all duration-300 hover:bg-gray-800/50 rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <Package className="h-6 w-6 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Gerenciar Produtos
                </h1>
              </div>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={addNewProduct}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-600/30 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-green-500/20"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/70">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-700">
                    {editingProduct === product.id ? (
                      // Editing Mode
                      <>
                        <td className="px-6 py-4" colSpan={6}>
                          <div className="space-y-4 bg-gray-700 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-white mb-1">Nome</label>
                                <Input
                                  value={editData.name || ''}
                                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                  className="bg-gray-800 text-white border-gray-600"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-white mb-1">Preço (R$)</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editData.price || 0}
                                  onChange={(e) => setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                  className="bg-gray-800 text-white border-gray-600"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-white mb-1">Preço Original (R$)</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editData.original_price || 0}
                                  onChange={(e) => setEditData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                                  className="bg-gray-800 text-white border-gray-600"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-white mb-1">Estoque</label>
                                <Input
                                  type="number"
                                  value={editData.stock || 0}
                                  onChange={(e) => setEditData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                                  className="bg-gray-800 text-white border-gray-600"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-white mb-1">Descrição</label>
                              <Textarea
                                value={editData.description || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-gray-800 text-white border-gray-600"
                                rows={3}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Categorias</label>
                              <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                  <div key={category.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`cat-${category.id}`}
                                      checked={editData.category_ids?.includes(category.id) || false}
                                      onCheckedChange={() => toggleCategory(category.id)}
                                    />
                                    <label htmlFor={`cat-${category.id}`} className="text-sm text-white">
                                      {category.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Imagens</label>
                              <div className="space-y-2">
                                {editData.images?.map((image, index) => (
                                  <div key={index} className="flex items-center space-x-2 bg-gray-800 p-2 rounded">
                                    <img src={image} alt="Product" className="w-12 h-12 object-cover rounded" />
                                    <span className="text-sm text-white flex-1 truncate">{image}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeImage(index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <div className="flex space-x-2">
                                  <Input
                                    placeholder="URL da imagem"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    className="bg-gray-800 text-white border-gray-600 flex-1"
                                  />
                                  <Button onClick={addImageUrl} variant="outline" size="sm">
                                    <Link className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="visible"
                                checked={editData.visible || false}
                                onCheckedChange={(checked) => setEditData(prev => ({ ...prev, visible: !!checked }))}
                              />
                              <label htmlFor="visible" className="text-sm text-white">
                                Produto visível
                              </label>
                            </div>

                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={cancelEditing}>
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </Button>
                              <Button onClick={() => saveProduct(product.id)}>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                              </Button>
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      // Display Mode
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.images && product.images.length > 0 ? (
                                <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {product.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-400 max-w-xs truncate">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {product.category_ids && product.category_ids.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {product.category_ids.map(catId => {
                                  const category = categories.find(c => c.id === catId)
                                  return category ? (
                                    <Badge key={catId} variant="outline" className="text-xs">
                                      {category.name}
                                    </Badge>
                                  ) : null
                                })}
                              </div>
                            ) : (
                              product.category_name || 'Sem categoria'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-medium">
                            R$ {product.price ? parseFloat(String(product.price)).toFixed(2) : '0.00'}
                          </div>
                          {product.original_price && product.original_price > product.price && (
                            <div className="text-xs text-gray-400 line-through">
                              R$ {parseFloat(String(product.original_price)).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            product.stock <= 0 ? 'text-red-400' : 
                            product.stock <= 10 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {product.stock <= 0 ? 'Sem estoque' : `${product.stock} unidades`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={product.visible ? "default" : "secondary"}>
                            {product.visible ? 'Visível' : 'Oculto'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro produto'}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Total: <span className="text-white font-semibold">{filteredProducts.length}</span> produto{filteredProducts.length !== 1 ? 's' : ''}
            {searchTerm && ` (filtrado de ${products.length})`}
          </p>
        </div>
      </div>
    </div>
  )
}
