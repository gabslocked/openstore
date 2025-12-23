"use client"

import { useState, useEffect } from "react"
import { PageHeader, PageHeaderActions } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Edit2, Trash2, X, Check, Eye, EyeOff } from "lucide-react"

interface Category {
  id: string
  name: string
  description: string
  visible: boolean
  created_at: string
}

export default function AdminCategoriesPageNew() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState({ name: "", description: "" })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCategories(filtered)
  }, [searchTerm, categories])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
        setFilteredCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newCategory.name.trim()) return
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })
      
      if (response.ok) {
        await loadCategories()
        setNewCategory({ name: "", description: "" })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData)
      })
      
      if (response.ok) {
        await loadCategories()
        setEditingId(null)
      }
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return
    
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadCategories()
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
    }
  }

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !currentVisibility })
      })
      
      if (response.ok) {
        await loadCategories()
      }
    } catch (error) {
      console.error("Erro ao alterar visibilidade:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page Header */}
      <PageHeader
        title="Categorias"
        subtitle={`${categories.length} categorias cadastradas`}
        breadcrumb={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Categorias" }
        ]}
        actions={
          <>
            <PageHeaderActions.Add 
              onClick={() => setShowCreateForm(true)}
              label="Nova Categoria"
            />
          </>
        }
      />

      {/* Main Content */}
      <div className="flex-1 px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Nova Categoria</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                placeholder="Nome da categoria"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="bg-gray-900/50 border-gray-700 text-white"
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="bg-gray-900/50 border-gray-700 text-white"
                rows={1}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewCategory({ name: "", description: "" })
                }}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newCategory.name.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                {isCreating ? "Criando..." : "Criar Categoria"}
              </Button>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Carregando categorias...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">Nenhuma categoria encontrada</div>
            {!showCreateForm && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                Criar Primeira Categoria
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all"
              >
                {editingId === category.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <Input
                      value={editingData.name}
                      onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                    <Textarea
                      value={editingData.description}
                      onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                      className="bg-gray-900/50 border-gray-700 text-white"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(category.id)}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      <button
                        onClick={() => toggleVisibility(category.id, category.visible)}
                        className={`p-2 rounded-lg transition-colors ${
                          category.visible 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {category.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {category.description && (
                      <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Criada em {new Date(category.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(category.id)
                            setEditingData({
                              name: category.name,
                              description: category.description || ""
                            })
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
