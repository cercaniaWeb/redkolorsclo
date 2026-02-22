import { supabase } from '@/lib/supabase'
import BranchSelector from '../components/BranchSelector'
import ProductCard from '../components/ProductCard'

export const revalidate = 0 // Disable caching for now to see live data

export default async function Home({
  searchParams,
}: {
  searchParams: { branch?: string }
}) {
  const branch = searchParams.branch || 'all'

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

  if (error) {
    console.error('Error fetching products:', error)
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen pb-24">
      {/* Header / Title */}
      <section className="pt-12 pb-8 px-4 text-center container mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
          Nuestra <span className="text-red-600">Colección</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
          Explora nuestro catálogo completo. Selecciona tu sucursal para ver disponibilidad en tiempo real.
        </p>
        <div className="flex justify-center">
          <BranchSelector currentBranch={branch} />
        </div>
      </section>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:pt-40 md:pb-20 text-center container mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Nueva Colección <span className="text-red-600">Premium</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl">
          Explora nuestro catálogo completo. Selecciona tu sucursal para ver disponibilidad en tiempo real.
        </p>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto px-4 pb-24">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No se encontraron productos en esta sucursal.</p>
          </div>
        )}
      </section>
    </div>
  )
}
