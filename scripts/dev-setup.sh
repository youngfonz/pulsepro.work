#!/bin/bash
# Local development setup for PulsePro
# Usage: npm run dev:setup

set -e

echo ""
echo "============================================"
echo "  PulsePro — Local Dev Setup"
echo "============================================"
echo ""

# Check prerequisites
if ! command -v npx &> /dev/null; then
  echo "Error: npx not found. Install Node.js first."
  exit 1
fi

# Pull env vars from Vercel
echo "Pulling env vars from Vercel..."
npx vercel env pull .env.local --environment production --yes 2>/dev/null

# Ensure ADMIN_USER_IDS is set
if ! grep -q "ADMIN_USER_IDS" .env.local 2>/dev/null; then
  echo "" >> .env.local
  echo "ADMIN_USER_IDS=\"user_39gDkEXlWy6U3vOmaWdymHZn2uI\"" >> .env.local
  echo "Added ADMIN_USER_IDS"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate --no-hints 2>/dev/null

echo ""
echo "============================================"
echo "  IMPORTANT: Database Safety"
echo "============================================"
echo ""
echo "  Your .env.local currently points to the"
echo "  PRODUCTION database. This is fine for"
echo "  running the app locally (read operations),"
echo "  but NEVER run these commands directly:"
echo ""
echo "    npx prisma db push     (can DROP tables)"
echo "    npx prisma db seed     (DELETES data)"
echo "    npx prisma migrate reset"
echo ""
echo "  Safe commands (have production guards):"
echo ""
echo "    npm run db:push        (blocked on prod)"
echo "    npm run db:seed        (blocked on prod)"
echo "    npm run db:migrate     (safe migrations)"
echo ""
echo "  For schema changes, use a Neon dev branch:"
echo "  1. Go to https://console.neon.tech"
echo "  2. Branches → Create branch from main"
echo "  3. Copy the dev branch connection string"
echo "  4. Replace DATABASE_URL in .env.local"
echo "  5. Now db:push and db:seed are safe to use"
echo ""
echo "============================================"
echo ""
echo "  Server:  http://localhost:3000"
echo "  Run:     npm run dev"
echo ""
echo "============================================"
