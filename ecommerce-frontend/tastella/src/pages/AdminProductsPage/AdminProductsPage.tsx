import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Header from '../../components/Header/Header'
import FilterPanel, { DEFAULT_FILTER_VALUE, type FilterValue } from '../../components/FilterPanel/FilterPanel'
import { API_BASE_URL } from '../../config/api'
import { authFetch } from '../../util/authFetch'
import { fetchSnackTypes } from '../../api/snackTypes'
import type { Product } from '../../types/product'
import type { SnackType } from '../../types/snackType'
import './AdminProductsPage.css'

interface ProductForm {
  name: string
  price: string
  brand: string
  snackType: string
}

const EMPTY_FORM: ProductForm = { name: '', price: '', brand: '', snackType: '' }

const formatPrice = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>(DEFAULT_FILTER_VALUE)
  const [snackTypes, setSnackTypes] = useState<SnackType[]>([])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchProducts = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/products`)
      if (!response.ok) throw new Error('Failed to load products')
      setProducts((await response.json()) as Product[])
    } catch {
      setError('Unable to load products. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
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

  const updateField = (field: keyof ProductForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const openAddForm = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, snackType: snackTypes[0] ? String(snackTypes[0].id) : '' })
    setImageFile(null)
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      brand: product.brand,
      snackType: String(product.snackType.id),
    })
    setImageFile(null)
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim() || !form.brand.trim()) {
      setFormError('Name and brand are required.')
      return
    }
    const priceValue = Number(form.price)
    if (!form.price || Number.isNaN(priceValue) || priceValue <= 0) {
      setFormError('Enter a valid price.')
      return
    }
    if (editingId === null && !imageFile) {
      setFormError('Choose a product image.')
      return
    }

    const body = new FormData()
    if (editingId !== null) body.append('id', String(editingId))
    body.append('name', form.name.trim())
    body.append('price', String(priceValue))
    body.append('brand', form.brand.trim())
    body.append('snackType', form.snackType)
    if (imageFile) body.append('file', imageFile)

    setIsSubmitting(true)
    try {
      const response = await authFetch(
        `${API_BASE_URL}/${editingId === null ? 'add-product' : 'update-product'}`,
        { method: 'POST', body },
      )

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      await fetchProducts()
      closeForm()
    } catch {
      setFormError('Unable to save this product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return

    setDeletingId(product.id)
    try {
      const response = await authFetch(`${API_BASE_URL}/delete-product/${product.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete product')
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch {
      setError('Unable to delete that product. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Header onSearch={setQuery} showAccountMenu />
      <div className="admin-products-layout">
        <FilterPanel
          value={filter}
          onChange={setFilter}
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
        />
        <div className="admin-products-page">
        <div className="admin-products-header">
          <h1 className="admin-products-title">Manage products</h1>
          <button type="button" className="admin-products-add-btn" onClick={openAddForm}>
            + Add product
          </button>
        </div>

        {isFormOpen && (
          <form className="admin-products-form" onSubmit={handleSubmit}>
            <h2>{editingId === null ? 'Add product' : 'Edit product'}</h2>

            <div className="admin-products-form-grid">
              <label className="admin-products-field">
                <span>Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </label>
              <label className="admin-products-field">
                <span>Brand</span>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                />
              </label>
              <label className="admin-products-field">
                <span>Price</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                />
              </label>
              <label className="admin-products-field">
                <span>Category</span>
                <select
                  value={form.snackType}
                  onChange={(e) => updateField('snackType', e.target.value)}
                >
                  {snackTypes.map((snackType) => (
                    <option key={snackType.id} value={snackType.id}>
                      {snackType.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-products-field admin-products-field-full">
                <span>{editingId === null ? 'Image' : 'Replace image (optional)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {formError && <p className="admin-products-error">{formError}</p>}

            <div className="admin-products-form-actions">
              <button type="submit" className="admin-products-save-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save product'}
              </button>
              <button
                type="button"
                className="admin-products-cancel-btn"
                onClick={closeForm}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="admin-products-empty">Loading products...</p>
        ) : error ? (
          <p className="admin-products-empty">{error}</p>
        ) : products.length === 0 ? (
          <p className="admin-products-empty">No products yet. Add your first one above.</p>
        ) : visibleProducts.length === 0 ? (
          <p className="admin-products-empty">No products match your search or filters.</p>
        ) : (
          <ul className="admin-products-list">
            {visibleProducts.map((product) => (
              <li key={product.id} className="admin-products-item">
                {product.imageUrl ? (
                  <img
                    className="admin-products-item-image"
                    src={product.imageUrl}
                    alt={product.name}
                  />
                ) : (
                  <div className="admin-products-item-image-placeholder" />
                )}

                <div className="admin-products-item-info">
                  <p className="admin-products-item-name">{product.name}</p>
                  <p className="admin-products-item-meta">
                    {product.brand} · {product.snackType.name}
                  </p>
                </div>

                <p className="admin-products-item-price">{formatPrice(product.price)}</p>

                <div className="admin-products-item-actions">
                  <button
                    type="button"
                    className="admin-products-edit-btn"
                    onClick={() => openEditForm(product)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-products-delete-btn"
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </>
  )
}

export default AdminProductsPage
