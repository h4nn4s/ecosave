import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'

function ProductManager({ onError }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category_id: '',
  })
  const [editingProduct, setEditingProduct] = useState(null)
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    brand: '',
    category_id: '',
  })

  useEffect(() => {
    async function fetchData() {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('name')

      if (productError) {
        onError('Kunde inte hämta produkter.')
        return
      }

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoryError) {
        onError('Kunde inte hämta kategorier.')
        return
      }

      setProducts(productData)
      setCategories(categoryData)
    }

    fetchData()
  }, [onError])

  async function handleAddProduct(event) {
    event.preventDefault()

    if (!newProduct.name.trim() || !newProduct.category_id) {
      return
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: newProduct.name.trim(),
        brand: newProduct.brand.trim() || null,
        category_id: Number(newProduct.category_id),
      })
      .select('*, categories(name)')
      .single()

    if (error) {
      onError('Kunde inte skapa produkten.')
      return
    }

    setProducts((current) =>
      [...current, data].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    )

    setNewProduct({
      name: '',
      brand: '',
      category_id: '',
    })
  }

  async function handleUpdateProduct(event) {
    event.preventDefault()

    if (!editedProduct.name.trim() || !editedProduct.category_id) {
      return
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: editedProduct.name.trim(),
        brand: editedProduct.brand.trim() || null,
        category_id: Number(editedProduct.category_id),
      })
      .eq('id', editingProduct.id)
      .select('*, categories(name)')
      .single()

    if (error) {
      onError('Kunde inte uppdatera produkten.')
      return
    }

    setProducts((current) =>
      current
        .map((product) =>
          product.id === data.id ? data : product
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    )

    setEditingProduct(null)
    setEditedProduct({
      name: '',
      brand: '',
      category_id: '',
    })
  }

  async function handleDeleteProduct(product) {
    const confirmed = window.confirm(
      `Är du säker på att du vill ta bort produkten "${product.name}"?`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    if (error) {
      onError('Kunde inte ta bort produkten.')
      return
    }

    setProducts((current) =>
      current.filter((item) => item.id !== product.id)
    )
  }

  return (
    <section>
      <h2>Produkter</h2>

      <form onSubmit={handleAddProduct}>
        <input
          type="text"
          value={newProduct.name}
          onChange={(event) =>
            setNewProduct({
              ...newProduct,
              name: event.target.value,
            })
          }
          placeholder="Produktnamn"
        />

        <input
          type="text"
          value={newProduct.brand}
          onChange={(event) =>
            setNewProduct({
              ...newProduct,
              brand: event.target.value,
            })
          }
          placeholder="Varumärke"
        />

        <select
          value={newProduct.category_id}
          onChange={(event) =>
            setNewProduct({
              ...newProduct,
              category_id: event.target.value,
            })
          }
        >
          <option value="">Välj kategori</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button type="submit">Lägg till produkt</button>
      </form>

      {products.length === 0 ? (
        <p>Inga produkter ännu.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {editingProduct?.id === product.id ? (
                <form onSubmit={handleUpdateProduct}>
                  <input
                    type="text"
                    value={editedProduct.name}
                    onChange={(event) =>
                      setEditedProduct({
                        ...editedProduct,
                        name: event.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    value={editedProduct.brand}
                    onChange={(event) =>
                      setEditedProduct({
                        ...editedProduct,
                        brand: event.target.value,
                      })
                    }
                  />

                  <select
                    value={editedProduct.category_id}
                    onChange={(event) =>
                      setEditedProduct({
                        ...editedProduct,
                        category_id: event.target.value,
                      })
                    }
                  >
                    <option value="">Välj kategori</option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <button type="submit">Spara</button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null)
                      setEditedProduct({
                        name: '',
                        brand: '',
                        category_id: '',
                      })
                    }}
                  >
                    Avbryt
                  </button>
                </form>
              ) : (
                <>
                  {product.name}
                  {product.brand && ` – ${product.brand}`}
                  {product.categories &&
                    ` (${product.categories.name})`}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(product)
                      setEditedProduct({
                        name: product.name,
                        brand: product.brand || '',
                        category_id: product.category_id,
                      })
                    }}
                  >
                    Redigera
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product)}
                  >
                    Ta bort
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ProductManager