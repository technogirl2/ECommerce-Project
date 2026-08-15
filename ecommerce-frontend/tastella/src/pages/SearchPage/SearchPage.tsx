import { useEffect, useMemo, useState } from 'react'
import Header from '../../components/Header/Header'
import ProductCard from '../../components/ProductCard/ProductCard'
import ProductPopComponent from '../../components/ProductPopComponent/ProductPopComponent'
import FilterPanel, { DEFAULT_FILTER_VALUE, type FilterValue } from '../../components/FilterPanel/FilterPanel'
import { fetchSnackTypes } from '../../api/snackTypes'
import { fetchAllInventory } from '../../api/inventory'
import { fetchAllProducts, searchProducts } from '../../api/products'
import type { Product } from '../../types/product'
import type { SnackType } from '../../types/snackType'
import './SearchPage.css'

const MAX_PRODUCTS = 20
const SEARCH_DEBOUNCE_MS = 300

function SearchPage() {
  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchResults, setSearchResults] = useState<Product[] | null>(null)
  const [searchedQuery, setSearchedQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterValue>(DEFAULT_FILTER_VALUE)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [snackTypes, setSnackTypes] = useState<SnackType[]>([])
  const [quantityByProductId, setQuantityByProductId] = useState<Record<number, number>>({})

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts()
        setAllProducts(data)
      } catch {
        setError('Unable to load products. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    const loadInventory = async () => {
      try {
        const inventory = await fetchAllInventory()
        setQuantityByProductId(
          Object.fromEntries(inventory.map((item) => [item.product.id, item.quantity])),
        )
      } catch {
        // Stock badges are a nice-to-have; the server still rejects out-of-stock purchases.
      }
    }

    loadProducts()
    loadInventory()
    fetchSnackTypes()
      .then(setSnackTypes)
      .catch(() => setError('Unable to load snack types. Please try again later.'))
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        const results = await searchProducts(trimmed)
        if (!cancelled) {
          setSearchResults(results)
          setSearchedQuery(trimmed)
        }
      } catch {
        if (!cancelled) setError('Unable to search products. Please try again later.')
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const trimmedQuery = query.trim()
  const isSearching = trimmedQuery !== '' && searchedQuery !== trimmedQuery
  const baseProducts = useMemo(
    () => (trimmedQuery ? (searchResults ?? []) : allProducts.slice(0, MAX_PRODUCTS)),
    [trimmedQuery, searchResults, allProducts],
  )

  const categoryOptions = useMemo(
    () => snackTypes.map((snackType) => ({ value: String(snackType.id), label: snackType.name })),
    [snackTypes],
  )

  const brandOptions = useMemo(() => {
    const brands = new Set(allProducts.map((product) => product.brand))
    return Array.from(brands).sort((a, b) => a.localeCompare(b))
  }, [allProducts])

  const visibleProducts = useMemo(() => {
    const minPrice = filter.minPrice ? Number(filter.minPrice) : null
    const maxPrice = filter.maxPrice ? Number(filter.maxPrice) : null

    const filtered = baseProducts.filter((product) => {
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
        // Preserve relevance order returned by the semantic search backend.
        return filtered
    }
  }, [baseProducts, filter])

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
          ) : isSearching ? (
            <p className="search-page-empty">Searching...</p>
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
                quantity={quantityByProductId[product.id]}
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
          quantity={quantityByProductId[selectedProduct.id]}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}

export default SearchPage
