"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // Set auth cookie
    cookies().set("admin_token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    })

    // Delete login page cookie
    cookies().delete("is_login_page")

    return { success: true }
  }

  return {
    success: false,
    error: "Credenciais inválidas",
  }
}

export async function logout() {
  cookies().delete("admin_token")
  redirect("/admin/login")
}

export async function getProducts(category?: string, searchQuery?: string, page?: number, limit?: number) {
  // Placeholder implementation. Replace with actual logic if needed.
  return { products: [], total: 0 }
}
