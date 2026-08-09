import { useEffect, useMemo, useState } from 'react'
import Header from '../../components/Header/Header'
import ProductCard from '../../components/ProductCard/ProductCard'
import ProductPopComponent from '../../components/ProductPopComponent/ProductPopComponent'
import FilterPanel, { DEFAULT_FILTER_VALUE, type FilterValue } from '../../components/FilterPanel/FilterPanel'
import { fetchSnackTypes } from '../../api/snackTypes'
import { API_BASE_URL } from '../../config/api'
import { authFetch } from '../../util/authFetch'
import type { Product } from '../../types/product'
import type { SnackType } from '../../types/snackType'
import './SearchPage.css'

const MAX_PRODUCTS = 20

function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterValue>(DEFAULT_FILTER_VALUE)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [snackTypes, setSnackTypes] = useState<SnackType[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/products`)

        if (!response.ok) {
          throw new Error('Failed to load products')
        }

        const data = (await response.json()) as Product[]
        setProducts(data.slice(0, MAX_PRODUCTS))
      } catch {
        setError('Unable to load products. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
    fetchSnackTypes()
      .then(setSnackTypes)
      .catch(() => setError('Unable to load snack types. Please try again later.'))
  }, [])

  const categoryOptions = useMemo(
    () => snackTypes.map((snackType) => ({ value: String(snackType.id), label: snackType.name })),
    [snackTypes],
  )

  const brandOptions = useMemo(() => {
    const brands = new Set(products.map((product) => product.brand))
    return Array.from(brands).sort((a, b) => a.localeCompare(b))
  }, [products])

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const minPrice = filter.minPrice ? Number(filter.minPrice) : null
    const maxPrice = filter.maxPrice ? Number(filter.maxPrice) : null

    const filtered = products.filter((product) => {
      if (normalized && !product.name.toLowerCase().startsWith(normalized)) return false
      if (minPrice !== null && product.price < minPrice) return false
      if (maxPrice !== null && product.price > maxPrice) return false
      if (filter.brands.length > 0 && !filter.brands.includes(product.brand)) return false
      if (
        filter.categories.length > 0 &&
        !filter.categories.includes(String(product.snackType.id))
      )
        return false
      return true
    })

    switch (filter.sortBy) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price)
      case 'name-asc':
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return filtered.sort((a, b) => b.name.localeCompare(a.name))
      default:
        return filtered
    }
  }, [query, products, filter])

  return (
    <>
      <Header onSearch={setQuery} showAccountMenu showCart />
      <div className="search-page-layout">
        <FilterPanel
          value={filter}
          onChange={setFilter}
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
        />
        <div className="search-page-results">
          {isLoading ? (
            <p className="search-page-empty">Loading snacks...</p>
          ) : error ? (
            <p className="search-page-empty">{error}</p>
          ) : visibleProducts.length > 0 ? (
            visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                brand={product.brand}
                snackType={product.snackType}
                onClick={() => setSelectedProduct(product)}
              />
            ))
          ) : (
            <p className="search-page-empty">No snacks match "{query}"</p>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProductPopComponent
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}

export default SearchPage
