"use server"

import fs from "fs/promises"
import path from "path"
import { revalidatePath } from "next/cache"
import type { Product } from "./types"

// Function to read the products.json file
export async function readProductsFile() {
  try {
    const filePath = path.join(process.cwd(), "products.json")
    const fileContent = await fs.readFile(filePath, "utf-8")
    return JSON.parse(fileContent)
  } catch (error) {
    console.error("Error reading products file:", error)
    throw new Error("Failed to read products file")
  }
}

// Function to write to the products.json file
export async function writeProductsFile(data: any) {
  try {
    const filePath = path.join(process.cwd(), "products.json")
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8")
    revalidatePath("/")
    revalidatePath("/admin/produtos")
    revalidatePath("/search")
    revalidatePath("/category/[slug]")
    return { success: true }
  } catch (error) {
    console.error("Error writing products file:", error)
    return { success: false, error: "Failed to write products file" }
  }
}

// Function to add a new product
export async function addProduct(product: Omit<Product, "id">) {
  try {
    const data = await readProductsFile()

    // Generate a new ID
    const maxId = Math.max(...data.produtos.map((p: Product) => Number.parseInt(p.id)), 0)
    const newProduct = {
      ...product,
      id: (maxId + 1).toString(),
    }

    // Add the new product
    data.produtos.push(newProduct)

    // Write the updated data
    await writeProductsFile(data)

    return { success: true, product: newProduct }
  } catch (error) {
    console.error("Error adding product:", error)
    return { success: false, error: "Failed to add product" }
  }
}

// Function to update a product
export async function updateProduct(id: string, updates: Partial<Product>) {
  try {
    const data = await readProductsFile()

    // Find the product
    const productIndex = data.produtos.findIndex((p: Product) => p.id === id)
    if (productIndex === -1) {
      return { success: false, error: "Product not found" }
    }

    // Update the product
    data.produtos[productIndex] = {
      ...data.produtos[productIndex],
      ...updates,
    }

    // Write the updated data
    await writeProductsFile(data)

    return { success: true, product: data.produtos[productIndex] }
  } catch (error) {
    console.error("Error updating product:", error)
    return { success: false, error: "Failed to update product" }
  }
}

// Function to delete a product
export async function deleteProduct(id: string) {
  try {
    const data = await readProductsFile()

    // Filter out the product
    data.produtos = data.produtos.filter((p: Product) => p.id !== id)

    // Write the updated data
    await writeProductsFile(data)

    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

// Function to get all categories
export async function getAllCategories() {
  try {
    const data = await readProductsFile()

    // Extract all categories
    const categoriesSet = new Set<string>()
    data.produtos.forEach((product: Product) => {
      if (product.categories) {
        const productCategories = product.categories.split(",").map((cat) => cat.trim())
        productCategories.forEach((category) => {
          if (category) categoriesSet.add(category)
        })
      }
    })

    return { success: true, categories: Array.from(categoriesSet) }
  } catch (error) {
    console.error("Error getting categories:", error)
    return { success: false, error: "Failed to get categories", categories: [] }
  }
}

// Function to add a new category
export async function addCategory(category: string) {
  try {
    const { success, categories } = await getAllCategories()

    if (!success) {
      return { success: false, error: "Failed to get categories" }
    }

    // Check if category already exists
    if (categories.includes(category)) {
      return { success: false, error: "Category already exists" }
    }

    // No need to update the file, categories are derived from products

    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}
