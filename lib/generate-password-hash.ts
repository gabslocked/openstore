import * as argon2 from "argon2"

export async function generatePasswordHash(password: string): Promise<string> {
  try {
    // Generate an Argon2 hash with secure defaults
    const hash = await argon2.hash(password, {
      type: argon2.argon2id, // Argon2id variant (balanced)
      memoryCost: 65536, // 64 MiB
      timeCost: 3, // 3 iterations
      parallelism: 4, // 4 parallel threads
    })

    return hash
  } catch (error) {
    console.error("Error generating password hash:", error)
    throw error
  }
}
