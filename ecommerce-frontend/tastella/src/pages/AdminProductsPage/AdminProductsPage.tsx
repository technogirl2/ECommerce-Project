import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Header from '../../components/Header/Header'
import FilterPanel, { DEFAULT_FILTER_VALUE, type FilterValue } from '../../components/FilterPanel/FilterPanel'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { API_BASE_URL } from '../../config/api'
import { authFetch } from '../../util/authFetch'
import { addSnackType, deleteSnackType, fetchSnackTypes, updateSnackType } from '../../api/snackTypes'
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
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<Product | null>(null)
  const [productDeleteError, setProductDeleteError] = useState('')

  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null)
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<SnackType | null>(null)
  const [deleteCategoryError, setDeleteCategoryError] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [isSavingCategoryEdit, setIsSavingCategoryEdit] = useState(false)
  const [editCategoryError, setEditCategoryError] = useState('')

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
    closeAddCategory()
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
    closeAddCategory()
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    closeAddCategory()
  }

  const closeAddCategory = () => {
    setIsAddingCategory(false)
    setNewCategoryName('')
    setCategoryError('')
    setDeleteCategoryError('')
    cancelEditCategory()
  }

  const startEditCategory = (snackType: SnackType) => {
    setEditingCategoryId(snackType.id)
    setEditingCategoryName(snackType.name)
    setEditCategoryError('')
  }

  const cancelEditCategory = () => {
    setEditingCategoryId(null)
    setEditingCategoryName('')
    setEditCategoryError('')
  }

  const saveEditCategory = async () => {
    if (editingCategoryId === null) return
    const name = editingCategoryName.trim()
    if (!name) {
      setEditCategoryError('Enter a category name.')
      return
    }

    setIsSavingCategoryEdit(true)
    setEditCategoryError('')
    try {
      const updated = await updateSnackType(editingCategoryId, name)
      setSnackTypes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      cancelEditCategory()
    } catch (err) {
      setEditCategoryError(err instanceof Error ? err.message : 'Unable to rename this category.')
    } finally {
      setIsSavingCategoryEdit(false)
    }
  }

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) {
      setCategoryError('Enter a category name.')
      return
    }

    setIsSubmittingCategory(true)
    setCategoryError('')
    try {
      const created = await addSnackType(name)
      setSnackTypes((prev) => [...prev, created])
      updateField('snackType', String(created.id))
      setNewCategoryName('')
    } catch {
      setCategoryError('Unable to add this category. Please try again.')
    } finally {
      setIsSubmittingCategory(false)
    }
  }

  const requestDeleteCategory = (snackType: SnackType) => {
    setDeleteCategoryError('')
    setConfirmDeleteCategory(snackType)
  }

  const cancelDeleteCategory = () => {
    setConfirmDeleteCategory(null)
    setDeleteCategoryError('')
  }

  const confirmDeleteCategoryAction = async () => {
    if (!confirmDeleteCategory) return

    setDeletingCategoryId(confirmDeleteCategory.id)
    setDeleteCategoryError('')
    try {
      await deleteSnackType(confirmDeleteCategory.id)
      setSnackTypes((prev) => prev.filter((s) => s.id !== confirmDeleteCategory.id))
      setForm((prev) =>
        prev.snackType === String(confirmDeleteCategory.id) ? { ...prev, snackType: '' } : prev,
      )
      setConfirmDeleteCategory(null)
    } catch (err) {
      setDeleteCategoryError(
        err instanceof Error ? err.message : 'Unable to delete this category.',
      )
    } finally {
      setDeletingCategoryId(null)
    }
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

  const requestDeleteProduct = (product: Product) => {
    setProductDeleteError('')
    setConfirmDeleteProduct(product)
  }

  const cancelDeleteProduct = () => {
    setConfirmDeleteProduct(null)
    setProductDeleteError('')
  }

  const confirmDeleteProductAction = async () => {
    if (!confirmDeleteProduct) return

    setDeletingId(confirmDeleteProduct.id)
    setProductDeleteError('')
    try {
      const response = await authFetch(`${API_BASE_URL}/delete-product/${confirmDeleteProduct.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete product')
      setProducts((prev) => prev.filter((p) => p.id !== confirmDeleteProduct.id))
      setConfirmDeleteProduct(null)
    } catch {
      setProductDeleteError('Unable to delete that product. Please try again.')
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
                <div className="admin-products-category-row">
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
                  <button
                    type="button"
                    className="admin-products-add-category-btn"
                    onClick={() => (isAddingCategory ? closeAddCategory() : setIsAddingCategory(true))}
                    aria-label="Edit categories"
                    title="Edit categories"
                  >
                    Edit categories
                  </button>
                </div>
                {isAddingCategory && (
                  <div className="admin-products-category-panel">
                    {snackTypes.length > 0 && (
                      <ul className="admin-products-category-list">
                        {snackTypes.map((snackType) =>
                          editingCategoryId === snackType.id ? (
                            <li
                              key={snackType.id}
                              className="admin-products-category-list-item admin-products-category-list-item-editing"
                            >
                              <input
                                type="text"
                                className="admin-products-category-edit-input"
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    saveEditCategory()
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault()
                                    cancelEditCategory()
                                  }
                                }}
                                disabled={isSavingCategoryEdit}
                                autoFocus
                              />
                              <button
                                type="button"
                                className="admin-products-confirm-category-btn"
                                onClick={saveEditCategory}
                                disabled={isSavingCategoryEdit}
                              >
                                {isSavingCategoryEdit ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                className="admin-products-cancel-category-btn"
                                onClick={cancelEditCategory}
                                disabled={isSavingCategoryEdit}
                              >
                                Cancel
                              </button>
                            </li>
                          ) : (
                            <li key={snackType.id} className="admin-products-category-list-item">
                              <span>{snackType.name}</span>
                              <div className="admin-products-category-list-actions">
                                <button
                                  type="button"
                                  className="admin-products-edit-category-btn"
                                  onClick={() => startEditCategory(snackType)}
                                  aria-label={`Rename ${snackType.name}`}
                                  title={`Rename ${snackType.name}`}
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  className="admin-products-delete-category-btn"
                                  onClick={() => requestDeleteCategory(snackType)}
                                  disabled={deletingCategoryId === snackType.id}
                                  aria-label={`Delete ${snackType.name}`}
                                  title={`Delete ${snackType.name}`}
                                >
                                  {deletingCategoryId === snackType.id ? '...' : '×'}
                                </button>
                              </div>
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                    {editCategoryError && (
                      <p className="admin-products-error">{editCategoryError}</p>
                    )}
                    <div className="admin-products-new-category-row">
                      <input
                        type="text"
                        placeholder="New category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddCategory()
                          }
                        }}
                        disabled={isSubmittingCategory}
                      />
                      <button
                        type="button"
                        className="admin-products-confirm-category-btn"
                        onClick={handleAddCategory}
                        disabled={isSubmittingCategory}
                      >
                        {isSubmittingCategory ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        className="admin-products-cancel-category-btn"
                        onClick={closeAddCategory}
                        disabled={isSubmittingCategory}
                      >
                        Done
                      </button>
                    </div>
                    {categoryError && <p className="admin-products-error">{categoryError}</p>}
                  </div>
                )}
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
                    onClick={() => requestDeleteProduct(product)}
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

      {confirmDeleteProduct && (
        <ConfirmDialog
          title="Delete product"
          message={`Delete "${confirmDeleteProduct.name}"? This can't be undone.`}
          confirmLabel="Delete"
          tone="danger"
          isConfirming={deletingId === confirmDeleteProduct.id}
          errorMessage={productDeleteError}
          onConfirm={confirmDeleteProductAction}
          onCancel={cancelDeleteProduct}
        />
      )}

      {confirmDeleteCategory && (
        <ConfirmDialog
          title="Delete category"
          message={`Delete category "${confirmDeleteCategory.name}"?`}
          confirmLabel="Delete"
          tone="danger"
          isConfirming={deletingCategoryId === confirmDeleteCategory.id}
          errorMessage={deleteCategoryError}
          onConfirm={confirmDeleteCategoryAction}
          onCancel={cancelDeleteCategory}
        />
      )}
    </>
  )
}

export default AdminProductsPage
