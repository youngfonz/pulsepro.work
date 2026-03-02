import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises'
import path from 'path'

// ── Production Safety Guard ─────────────────────────────────────────
// This script MODIFIES database records. Block if pointing at production.
const PRODUCTION_ENDPOINT = 'ep-delicate-queen-aiajl1lv'
const dbUrl = process.env.DATABASE_URL || ''

if (dbUrl.includes(PRODUCTION_ENDPOINT)) {
  console.error('')
  console.error('  BLOCKED: Cannot run image migration against production.')
  console.error('  Use a Neon dev branch for local development.')
  console.error('')
  process.exit(1)
}
// ─────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient()

// Map of old local paths to new blob URLs
const pathMapping: Record<string, string> = {}

async function uploadImage(localPath: string): Promise<string> {
  const fullPath = path.join(process.cwd(), 'public', localPath)
  const file = await readFile(fullPath)
  const filename = localPath.replace(/^\/uploads\//, '')

  const blob = await put(filename, file, {
    access: 'public',
  })

  console.log(`Uploaded: ${localPath} -> ${blob.url}`)
  return blob.url
}

async function migrateClientLogos() {
  const clients = await prisma.client.findMany({
    where: { logo: { not: null } }
  })

  console.log(`\nMigrating ${clients.length} client logos...`)

  for (const client of clients) {
    if (client.logo && client.logo.startsWith('/uploads/')) {
      try {
        const newUrl = await uploadImage(client.logo)
        await prisma.client.update({
          where: { id: client.id },
          data: { logo: newUrl }
        })
        pathMapping[client.logo] = newUrl
      } catch (err) {
        console.error(`Failed to migrate logo for client ${client.name}:`, err)
      }
    }
  }
}

async function migrateProjectImages() {
  const images = await prisma.projectImage.findMany()

  console.log(`\nMigrating ${images.length} project images...`)

  for (const image of images) {
    if (image.path.startsWith('/uploads/')) {
      try {
        const newUrl = await uploadImage(image.path)
        await prisma.projectImage.update({
          where: { id: image.id },
          data: { path: newUrl }
        })
      } catch (err) {
        console.error(`Failed to migrate project image ${image.name}:`, err)
      }
    }
  }
}

async function migrateTaskImages() {
  const images = await prisma.taskImage.findMany()

  console.log(`\nMigrating ${images.length} task images...`)

  for (const image of images) {
    if (image.path.startsWith('/uploads/')) {
      try {
        const newUrl = await uploadImage(image.path)
        await prisma.taskImage.update({
          where: { id: image.id },
          data: { path: newUrl }
        })
      } catch (err) {
        console.error(`Failed to migrate task image ${image.name}:`, err)
      }
    }
  }
}

async function main() {
  console.log('Starting image migration to Vercel Blob...\n')

  await migrateClientLogos()
  await migrateProjectImages()
  await migrateTaskImages()

  console.log('\n✅ Migration complete!')
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
