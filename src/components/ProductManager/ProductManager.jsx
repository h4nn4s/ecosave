import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'

function ProductManager({ onError, onProductStatusChange }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [listings, setListings] = useState([])

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

      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('id, product_id, active')

      if (listingError) {
        onError('Kunde inte hämta produktutbud.')
        return
      }

      setProducts(productData)
      setCategories(categoryData)
      setListings(listingData)
    }

    fetchData()
  }, [onError])

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

  async function handleToggleActive(product) {
    const newActive = !product.active

    const { data, error } = await supabase
      .from('products')
      .update({
        active: newActive,
      })
      .eq('id', product.id)
      .select('*, categories(name)')
      .single()

    if (error) {
      onError('Kunde inte ändra produktens status.')
      return
    }

    setProducts((current) =>
      current
        .map((item) =>
          item.id === data.id ? data : item
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    )

    onProductStatusChange()
  }

  function getListingCount(productId) {
    return listings.filter(
      (listing) =>
        listing.product_id === productId && listing.active
    ).length
  }

  const groupedProducts = products.reduce((groups, product) => {
    const category = product.categories?.name || 'Övrigt'

    if (!groups[category]) {
      groups[category] = []
    }

    groups[category].push(product)

    return groups
  }, {})

  return (
    <section>
      <h2>Hantera produkter</h2>

      {products.length === 0 ? (
        <p>Inga produkter ännu.</p>
      ) : (
        Object.entries(groupedProducts)
          .sort(([categoryA], [categoryB]) =>
            categoryA.localeCompare(categoryB)
          )
          .map(([category, categoryProducts]) => (
            <div key={category}>
              <h3>{category}</h3>

              <table>
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th>Märke</th>
                    <th>Utbud</th>
                    <th>Status</th>
                    <th>Åtgärder</th>
                  </tr>
                </thead>

                <tbody>
                  {categoryProducts.map((product) => (
                    <tr key={product.id}>
                      {editingProduct?.id === product.id ? (
                        <>
                          <td>
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
                          </td>

                          <td>
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
                          </td>

                          <td>
                            {getListingCount(product.id)}
                          </td>

                          <td>
                            {product.active
                              ? 'Aktiv'
                              : 'Inaktiv'}
                          </td>

                          <td>
                            <form onSubmit={handleUpdateProduct}>
                              <select
                                value={editedProduct.category_id}
                                onChange={(event) =>
                                  setEditedProduct({
                                    ...editedProduct,
                                    category_id:
                                      event.target.value,
                                  })
                                }
                              >
                                <option value="">
                                  Välj kategori
                                </option>

                                {categories.map((category) => (
                                  <option
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.name}
                                  </option>
                                ))}
                              </select>

                              <button type="submit">
                                Spara
                              </button>

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
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{product.name}</td>

                          <td>{product.brand || '-'}</td>

                          <td>
                            {getListingCount(product.id)}
                          </td>

                          <td>
                            {product.active
                              ? 'Aktiv'
                              : 'Inaktiv'}
                          </td>

                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(product)
                                setEditedProduct({
                                  name: product.name,
                                  brand: product.brand || '',
                                  category_id:
                                    product.category_id,
                                })
                              }}
                            >
                              Redigera
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleActive(product)
                              }
                            >
                              {product.active
                                ? 'Inaktivera'
                                : 'Aktivera'}
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
      )}
    </section>
  )
}

export default ProductManager