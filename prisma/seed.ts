import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config() // fallback to .env

import { PrismaClient } from '@prisma/client'

// ── Production Safety Guard ─────────────────────────────────────────
// This script DELETES data. It must never run against production.
const PRODUCTION_ENDPOINT = 'ep-delicate-queen-aiajl1lv'
const dbUrl = process.env.DATABASE_URL || ''

if (dbUrl.includes(PRODUCTION_ENDPOINT)) {
  console.error('')
  console.error('  ┌──────────────────────────────────────────────────┐')
  console.error('  │  BLOCKED: Cannot seed the production database    │')
  console.error('  └──────────────────────────────────────────────────┘')
  console.error('')
  console.error('  Your DATABASE_URL points to production.')
  console.error('  Seeding would DELETE all data for the seed user.')
  console.error('')
  console.error('  To seed locally, use a Neon dev branch:')
  console.error('  1. Go to https://console.neon.tech → Branches')
  console.error('  2. Create a branch from "main"')
  console.error('  3. Copy the new connection string')
  console.error('  4. Update DATABASE_URL in .env.local')
  console.error('')
  process.exit(1)
}

if (process.env.VERCEL) {
  console.error('BLOCKED: Seed script cannot run during Vercel builds.')
  process.exit(1)
}
// ─────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient()

const SEED_USER_ID = process.env.SEED_USER_ID || 'local-dev-user'

const clients = [
  {"id":"cml4l3fyc000010viyi0z9nny","name":"Cristina Mancini","email":"cristina@wearebgc.com","phone":null,"company":"Black Girls Code","status":"active","notes":"Interim Head of Product Role","logo":"/uploads/clients/1770007675739-bcc.png"},
  {"id":"cml4nw869000110vi2d59pz7l","name":"Dankland","email":"umesh3000@gmail.com","phone":null,"company":"Dankland LLC","status":"active","notes":null,"logo":"/uploads/clients/1770007544244-DL-logo.png"},
  {"id":"cml4nwudd000210viw67dttgd","name":"Fonz Morris","email":"selfdesign@fonzmorris.com","phone":"4044540658","company":"Self Design","status":"active","notes":null,"logo":"/uploads/clients/1770049225260-Self_Design_Cover-min.jpg"},
  {"id":"cml4nzcu7000310vizo3aa979","name":"Fonz Morris","email":"igmautollc@gmail.com","phone":null,"company":"IGM Autos LLC","status":"active","notes":null,"logo":"/uploads/clients/1770060528584-logo.png"},
  {"id":"cml4o0ref000410viqltuasw3","name":"FNZMS","email":"fm@fnzms.com","phone":null,"company":"FNZMS","status":"active","notes":null,"logo":"/uploads/clients/1770007518569-fmHiRes.png"},
  {"id":"cml5b8bvr0000c4nezjs6y7d1","name":"Hik & James","email":"info@powerplay.supply","phone":null,"company":"Power Play","status":"active","notes":null,"logo":"/uploads/clients/1770045232783-Screenshot_2026-02-02_at_07.13.44.png"},
  {"id":"cml5l7xd6000ewbf5hz0at7v9","name":"Rob B.","email":"rob@podax.ai","phone":null,"company":"PODAX.ai","status":"active","notes":null,"logo":"/uploads/clients/1770062010393-PodaxLogo.png"}
]

const projects = [
  {"id":"cml4o2ur5000810vievam3wgs","name":"IGM Marketing Push","description":"Different assets needed to market the company","status":"in_progress","priority":"high","dueDate":new Date(1772323200000),"budget":null,"clientId":"cml4nzcu7000310vizo3aa979","notes":null},
  {"id":"cml4o3zho000a10viyw2b47uq","name":"Music Prediction Platform Development","description":"Kalshi and Polymarket clone","status":"in_progress","priority":"high","dueDate":new Date(1771113600000),"budget":null,"clientId":"cml4nw869000110vi2d59pz7l","notes":null},
  {"id":"cml4oaxn3000i10vi053sa40b","name":"Self Design Marketing","description":"All things related to helping promote my Self Design book","status":"in_progress","priority":"medium","dueDate":new Date(1772323200000),"budget":null,"clientId":"cml4nwudd000210viw67dttgd","notes":null},
  {"id":"cml5dhiq00002c4neq6kyj9qw","name":"New Marketing Assets","description":null,"status":"in_progress","priority":"medium","dueDate":new Date(1772323200000),"budget":null,"clientId":"cml5b8bvr0000c4nezjs6y7d1","notes":null},
  {"id":"cml5dkpd8000ac4neq51sirsf","name":"Self Design Audio Book","description":null,"status":"not_started","priority":"medium","dueDate":null,"budget":null,"clientId":"cml4nwudd000210viw67dttgd","notes":null},
  {"id":"cml5ey489000gc4nekkimzsx2","name":"Beyond Collective Launch","description":null,"status":"not_started","priority":"medium","dueDate":new Date(1775001600000),"budget":null,"clientId":"cml4l3fyc000010viyi0z9nny","notes":null},
  {"id":"cml5kgt4d0001wbf5eoe6k2r2","name":"Influencer Matcher App","description":"Find hot apps on the Apple and Google Play store, then find influencers to match them with.","status":"not_started","priority":"medium","dueDate":null,"budget":null,"clientId":"cml4o0ref000410viqltuasw3","notes":null},
  {"id":"cml5l8r19000gwbf5l3g63wpe","name":"Hub 71","description":"Submitting application to HUB71 Accelerator","status":"completed","priority":"medium","dueDate":new Date(1769904000000),"budget":null,"clientId":"cml5l7xd6000ewbf5hz0at7v9","notes":null}
]

const tasks = [
  {"id":"cml4o6smz000e10vi362khv8x","title":"Finish Product Brief","description":null,"status":"todo","priority":"high","dueDate":null,"projectId":"cml4o3zho000a10viyw2b47uq","startDate":null,"notes":null},
  {"id":"cml4ocnpw000m10viom2qdaq9","title":"Research building an AI clone to discuss the book","description":null,"status":"todo","priority":"low","dueDate":new Date(1772323200000),"projectId":"cml4oaxn3000i10vi053sa40b","startDate":null,"notes":null},
  {"id":"cml5dhzk20004c4nelol8fpln","title":"Die Cut QR Code Stickers","description":null,"status":"todo","priority":"medium","dueDate":null,"projectId":"cml5dhiq00002c4neq6kyj9qw","startDate":null,"notes":null},
  {"id":"cml5di5gy0006c4neu14nisuj","title":"Canopy Design","description":null,"status":"todo","priority":"medium","dueDate":null,"projectId":"cml5dhiq00002c4neq6kyj9qw","startDate":null,"notes":null},
  {"id":"cml5dihrk0008c4ne0h91iaj9","title":"150ml Jar Design","description":null,"status":"todo","priority":"medium","dueDate":null,"projectId":"cml5dhiq00002c4neq6kyj9qw","startDate":null,"notes":null},
  {"id":"cml5dl1oc000cc4ne225kbl29","title":"Setup ElevenLabs account","description":null,"status":"todo","priority":"medium","dueDate":null,"projectId":"cml5dkpd8000ac4neq51sirsf","startDate":null,"notes":null},
  {"id":"cml5dlbg4000ec4net8jrt27j","title":"Create Self Design Manifesto poster","description":null,"status":"todo","priority":"medium","dueDate":null,"projectId":"cml5dkpd8000ac4neq51sirsf","startDate":null,"notes":null},
  {"id":"cml5khjv60003wbf5covcyu4m","title":"IGM Logo","description":null,"status":"todo","priority":"medium","dueDate":null,"projectId":"cml4o2ur5000810vievam3wgs","startDate":null,"notes":null},
  {"id":"cml5kmvou0007wbf55ey20ulk","title":"IGM Merch","description":null,"status":"todo","priority":"medium","dueDate":null,"projectId":"cml4o2ur5000810vievam3wgs","startDate":null,"notes":null},
  {"id":"cml5knmnv000bwbf5jtcxcr0e","title":"Draft Project Brief for IGM Autos","description":null,"status":"todo","priority":"high","dueDate":null,"projectId":"cml4o2ur5000810vievam3wgs","startDate":null,"notes":null},
  {"id":"cml5kuw6s000dwbf5zdjv369l","title":"Create AI Guidance Counselor","description":null,"status":"todo","priority":"medium","dueDate":null,"projectId":"cml5ey489000gc4nekkimzsx2","startDate":null,"notes":null},
  {"id":"cml5l94qo000iwbf5vbjibguq","title":"Create Pitch Deck","description":null,"status":"done","priority":"medium","dueDate":new Date(1769904000000),"projectId":"cml5l8r19000gwbf5l3g63wpe","startDate":new Date(1768953600000),"notes":null},
  {"id":"cml5l9yaa000mwbf5924nikog","title":"Create Podax.ai website","description":"Launch info website for http://podax.ai","status":"done","priority":"medium","dueDate":new Date(1769904000000),"projectId":"cml5l8r19000gwbf5l3g63wpe","startDate":new Date(1768953600000),"notes":null}
]

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.taskFile.deleteMany({ where: { task: { userId: SEED_USER_ID } } })
  await prisma.taskImage.deleteMany({ where: { task: { userId: SEED_USER_ID } } })
  await prisma.task.deleteMany({ where: { userId: SEED_USER_ID } })
  await prisma.projectImage.deleteMany({ where: { project: { userId: SEED_USER_ID } } })
  await prisma.project.deleteMany({ where: { userId: SEED_USER_ID } })
  await prisma.client.deleteMany({ where: { userId: SEED_USER_ID } })

  // Insert clients
  for (const client of clients) {
    await prisma.client.create({ data: { ...client, userId: SEED_USER_ID } })
  }
  console.log(`Created ${clients.length} clients`)

  // Insert projects
  for (const project of projects) {
    await prisma.project.create({ data: { ...project, userId: SEED_USER_ID } })
  }
  console.log(`Created ${projects.length} projects`)

  // Insert tasks
  for (const task of tasks) {
    await prisma.task.create({ data: { ...task, userId: SEED_USER_ID } })
  }
  console.log(`Created ${tasks.length} tasks`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
