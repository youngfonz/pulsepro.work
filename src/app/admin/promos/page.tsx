import { getPromoCodes } from '@/actions/promo'
import { PromoAdmin } from './PromoAdmin'

export const dynamic = 'force-dynamic'

export default async function PromosPage() {
  const codes = await getPromoCodes()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Promo Codes</h1>
        <p className="text-sm text-muted-foreground mt-1">Create and manage promotional upgrade codes</p>
      </div>
      <PromoAdmin initialCodes={codes} />
    </div>
  )
}
