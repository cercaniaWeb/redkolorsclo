import { createSupabaseServerClient } from '@/lib/supabase-server'
import BranchSelector from '../components/BranchSelector'
import ProductCard from '../components/ProductCard'
import { ShoppingBag } from 'lucide-react'

export const revalidate = 0

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>
}) {
  const resolvedParams = await searchParams
  const branch = resolvedParams.branch || 'all'
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('products')
    .select(`
      *,
      product_branches!inner(branch_id, stock)
    `)

  if (branch !== 'all') {
    query = query.eq('product_branches.branch_id', branch)
  }

  const { data: products, error } = await query

  const branchTitles: Record<string, string> = {
    all: 'Colección Global',
    simon: 'Sede Simón Bolívar',
    floresta: 'Sede Floresta',
    pantitlan: 'Sede Pantitlán'
  }

  if (error) {
    console.error('Error fetching products:', error)
  }

  return (
    <div className="bg-[#020617] text-white min-h-screen">
      {/* Header Section - Modern Fashion Style */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-rose-600/5 blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-blue-600/5 blur-[100px] -z-10"></div>

        <div className="container mx-auto text-center space-y-8 animate-reveal">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-rose-600/10 rounded-3xl flex items-center justify-center border border-rose-500/20 shadow-2xl">
              <ShoppingBag className="w-8 h-8 text-rose-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-tight drop-shadow-2xl">
              Nuestra <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-rose-400 italic font-serif">Colección</span>
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl font-light">
              {branchTitles[branch]}. Selecciona una sede para verificar la disponibilidad exclusiva en tiempo real.
            </p>
          </div>

          <div className="flex justify-center pt-8 overflow-x-auto pb-2">
            <BranchSelector currentBranch={branch} />
          </div>
        </div>
      </section>

      {/* Product Grid - Enhanced Spacing */}
      <section className="container mx-auto px-6 pb-40">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Stock Agotado</p>
            <p className="text-slate-500 text-lg font-light">No se encontraron productos disponibles en esta sede en este momento.</p>
          </div>
        )}
      </section>
    </div>
  )
}
