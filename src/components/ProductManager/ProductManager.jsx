import { Fragment, useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'

function ProductManager({ onError }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [listings, setListings] = useState([])
  const [stores, setStores] = useState([])

  const [editingProduct, setEditingProduct] = useState(null)
  const [expandedProduct, setExpandedProduct] = useState(null)

  const [editedProduct, setEditedProduct] = useState({
    name: '',
    brand: '',
    category_id: '',
  })

  const [addingListingFor, setAddingListingFor] = useState(null)
  const [newListing, setNewListing] = useState({
    store_id: '',
    quantity: '',
    price: '',
    best_before: '',
    reason: '',
  })

  const [editingListing, setEditingListing] = useState(null)
  const [editedListing, setEditedListing] = useState({
    store_id: '',
    quantity: '',
    price: '',
    best_before: '',
    reason: '',
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
        .select(`
          id,
          product_id,
          store_id,
          quantity,
          price,
          best_before,
          reason,
          active,
          stores(name)
        `)
        .order('best_before')

      if (listingError) {
        onError('Kunde inte hämta produktinfo.')
        return
      }

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .order('name')

      if (storeError) {
        onError('Kunde inte hämta butiker.')
        return
      }

      setProducts(productData)
      setCategories(categoryData)
      setListings(listingData)
      setStores(storeData)
    }

    fetchData()
  }, [onError])

  function getExpiresAt(bestBefore) {
    return `${bestBefore}T22:00:00`
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

  async function handleToggleProductActive(product) {
    const newActive = !product.active

    const { error } = await supabase
      .from('products')
      .update({
        active: newActive,
      })
      .eq('id', product.id)

    if (error) {
      onError('Kunde inte ändra produktens status.')
      return
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? {
              ...item,
              active: newActive,
            }
          : item
      )
    )

    if (!newActive) {
      setListings((current) =>
        current.map((listing) =>
          listing.product_id === product.id
            ? {
                ...listing,
                active: false,
              }
            : listing
        )
      )
    }
  }

  async function handleAddListing(event, productId) {
    event.preventDefault()

    if (
      !newListing.store_id ||
      !newListing.quantity ||
      !newListing.price ||
      !newListing.best_before
    ) {
      return
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        product_id: productId,
        store_id: Number(newListing.store_id),
        quantity: Number(newListing.quantity),
        price: Number(newListing.price),
        best_before: newListing.best_before,
        reason: newListing.reason.trim() || null,
        expires_at: getExpiresAt(newListing.best_before),
        active: true,
      })
      .select(`
        id,
        product_id,
        store_id,
        quantity,
        price,
        best_before,
        reason,
        active,
        stores(name)
      `)
      .single()

    if (error) {
      onError('Kunde inte skapa produktinfo.')
      return
    }

    setListings((current) =>
      [...current, data].sort((a, b) =>
        a.best_before.localeCompare(b.best_before)
      )
    )

    setNewListing({
      store_id: '',
      quantity: '',
      price: '',
      best_before: '',
      reason: '',
    })

    setAddingListingFor(null)
  }

  async function handleUpdateListing(listingId) {
    if (
      !editedListing.store_id ||
      !editedListing.quantity ||
      !editedListing.price ||
      !editedListing.best_before
    ) {
      return
    }

    const { data, error } = await supabase
      .from('listings')
      .update({
        store_id: Number(editedListing.store_id),
        quantity: Number(editedListing.quantity),
        price: Number(editedListing.price),
        best_before: editedListing.best_before,
        reason: editedListing.reason.trim() || null,
        expires_at: getExpiresAt(editedListing.best_before),
      })
      .eq('id', listingId)
      .select(`
        id,
        product_id,
        store_id,
        quantity,
        price,
        best_before,
        reason,
        active,
        stores(name)
      `)
      .single()

    if (error) {
      onError('Kunde inte uppdatera produktinfo.')
      return
    }

    setListings((current) =>
      current
        .map((listing) =>
          listing.id === data.id ? data : listing
        )
        .sort((a, b) =>
          a.best_before.localeCompare(b.best_before)
        )
    )

    setEditingListing(null)
    setEditedListing({
      store_id: '',
      quantity: '',
      price: '',
      best_before: '',
      reason: '',
    })
  }

  async function handleToggleListingActive(listing) {
    const newActive = !listing.active

    const { data, error } = await supabase
      .from('listings')
      .update({
        active: newActive,
      })
      .eq('id', listing.id)
      .select(`
        id,
        product_id,
        store_id,
        quantity,
        price,
        best_before,
        reason,
        active,
        stores(name)
      `)
      .single()

    if (error) {
      onError('Kunde inte ändra produktinfons status.')
      return
    }

    setListings((current) =>
      current.map((item) =>
        item.id === data.id ? data : item
      )
    )
  }

  function getListingCount(productId) {
    return listings.filter(
      (listing) =>
        listing.product_id === productId && listing.active
    ).length
  }

  const groupedProducts = products.reduce((groups, product) => {
    const category =
      categories.find(
        (category) =>
          String(category.id) === String(product.category_id)
      )?.name || 'Övrigt'

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
                    <th>Varumärke</th>
                    <th>Publicerade</th>
                    <th>Status</th>
                    <th>Åtgärder</th>
                  </tr>
                </thead>

                <tbody>
                  {categoryProducts.map((product) => (
                    <Fragment key={product.id}>
                      <tr>
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
                              <form
                                onSubmit={handleUpdateProduct}
                              >
                                <select
                                  value={
                                    editedProduct.category_id
                                  }
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
                                onClick={() =>
                                  setExpandedProduct(
                                    expandedProduct === product.id
                                      ? null
                                      : product.id
                                  )
                                }
                              >
                                {expandedProduct === product.id
                                  ? 'Dölj produktinfo'
                                  : 'Visa produktinfo'}
                              </button>

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
                                className={
                                  product.active
                                    ? 'deactivate'
                                    : 'activate'
                                }
                                onClick={() =>
                                  handleToggleProductActive(
                                    product
                                  )
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

                      {expandedProduct === product.id && (
                        <tr>
                          <td colSpan="5">
                            <button
                              type="button"
                              onClick={() => {
                                setAddingListingFor(
                                  addingListingFor === product.id
                                    ? null
                                    : product.id
                                )
                                setEditingListing(null)
                              }}
                            >
                              {addingListingFor === product.id
                                ? 'Avbryt'
                                : 'Lägg till produktinfo'}
                            </button>

                            {addingListingFor === product.id && (
                              <form
                                onSubmit={(event) =>
                                  handleAddListing(
                                    event,
                                    product.id
                                  )
                                }
                              >
                                <select
                                  value={newListing.store_id}
                                  onChange={(event) =>
                                    setNewListing({
                                      ...newListing,
                                      store_id:
                                        event.target.value,
                                    })
                                  }
                                >
                                  <option value="">
                                    Välj butik
                                  </option>

                                  {stores.map((store) => (
                                    <option
                                      key={store.id}
                                      value={store.id}
                                    >
                                      {store.name}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="number"
                                  min="1"
                                  value={newListing.quantity}
                                  onChange={(event) =>
                                    setNewListing({
                                      ...newListing,
                                      quantity:
                                        event.target.value,
                                    })
                                  }
                                  placeholder="Antal"
                                />

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={newListing.price}
                                  onChange={(event) =>
                                    setNewListing({
                                      ...newListing,
                                      price:
                                        event.target.value,
                                    })
                                  }
                                  placeholder="Pris"
                                />

                                <label>
                                  Bäst före
                                  <input
                                    type="date"
                                    value={
                                      newListing.best_before
                                    }
                                    onChange={(event) =>
                                      setNewListing({
                                        ...newListing,
                                        best_before:
                                          event.target.value,
                                      })
                                    }
                                  />
                                </label>

                                <input
                                  type="text"
                                  value={newListing.reason}
                                  onChange={(event) =>
                                    setNewListing({
                                      ...newListing,
                                      reason:
                                        event.target.value,
                                    })
                                  }
                                  placeholder="Anledning"
                                />

                                <button type="submit">
                                  Lägg till
                                </button>
                              </form>
                            )}

                            {listings.filter(
                              (listing) =>
                                listing.product_id === product.id
                            ).length === 0 ? (
                              <p>Inget produktinfo ännu.</p>
                            ) : (
                              <table>
                                <thead>
                                  <tr>
                                    <th>Bäst före</th>
                                    <th>Antal</th>
                                    <th>Pris</th>
                                    <th>Anledning</th>
                                    <th>Status</th>
                                    <th>Åtgärder</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {listings
                                    .filter(
                                      (listing) =>
                                        listing.product_id ===
                                        product.id
                                    )
                                    .map((listing) => (
                                      <tr key={listing.id}>
                                        {editingListing?.id ===
                                        listing.id ? (
                                          <>
                                            <td>
                                              <input
                                                type="date"
                                                value={
                                                  editedListing.best_before
                                                }
                                                onChange={(event) =>
                                                  setEditedListing({
                                                    ...editedListing,
                                                    best_before:
                                                      event.target
                                                        .value,
                                                  })
                                                }
                                              />
                                            </td>

                                            <td>
                                              <input
                                                type="number"
                                                min="1"
                                                value={
                                                  editedListing.quantity
                                                }
                                                onChange={(event) =>
                                                  setEditedListing({
                                                    ...editedListing,
                                                    quantity:
                                                      event.target
                                                        .value,
                                                  })
                                                }
                                              />
                                            </td>

                                            <td>
                                              <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                  editedListing.price
                                                }
                                                onChange={(event) =>
                                                  setEditedListing({
                                                    ...editedListing,
                                                    price:
                                                      event.target
                                                        .value,
                                                  })
                                                }
                                              />
                                            </td>

                                            <td>
                                              <input
                                                type="text"
                                                value={
                                                  editedListing.reason
                                                }
                                                onChange={(event) =>
                                                  setEditedListing({
                                                    ...editedListing,
                                                    reason:
                                                      event.target
                                                        .value,
                                                  })
                                                }
                                              />
                                            </td>

                                            <td>
                                              {listing.active
                                                ? 'Aktiv'
                                                : 'Inaktiv'}
                                            </td>

                                            <td>
                                              <select
                                                value={
                                                  editedListing.store_id
                                                }
                                                onChange={(event) =>
                                                  setEditedListing({
                                                    ...editedListing,
                                                    store_id:
                                                      event.target
                                                        .value,
                                                  })
                                                }
                                              >
                                                {stores.map(
                                                  (store) => (
                                                    <option
                                                      key={store.id}
                                                      value={
                                                        store.id
                                                      }
                                                    >
                                                      {store.name}
                                                    </option>
                                                  )
                                                )}
                                              </select>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleUpdateListing(
                                                    listing.id
                                                  )
                                                }
                                              >
                                                Spara
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingListing(
                                                    null
                                                  )
                                                  setEditedListing({
                                                    store_id: '',
                                                    quantity: '',
                                                    price: '',
                                                    best_before:
                                                      '',
                                                    reason: '',
                                                  })
                                                }}
                                              >
                                                Avbryt
                                              </button>
                                            </td>
                                          </>
                                        ) : (
                                          <>
                                            <td>
                                              {
                                                listing.best_before
                                              }
                                            </td>

                                            <td>
                                              {listing.quantity} st
                                            </td>

                                            <td>
                                              {listing.price} kr
                                            </td>

                                            <td>
                                              {listing.reason || '-'}
                                            </td>

                                            <td>
                                              {listing.active
                                                ? 'Aktiv'
                                                : 'Inaktiv'}
                                            </td>

                                            <td>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingListing(
                                                    listing
                                                  )
                                                  setEditedListing({
                                                    store_id:
                                                      String(
                                                        listing.store_id
                                                      ),
                                                    quantity:
                                                      listing.quantity,
                                                    price:
                                                      listing.price,
                                                    best_before:
                                                      listing.best_before,
                                                    reason:
                                                      listing.reason ||
                                                      '',
                                                  })
                                                }}
                                              >
                                                Redigera
                                              </button>

                                              <button
                                                type="button"
                                                className={
                                                  listing.active
                                                    ? 'deactivate'
                                                    : 'activate'
                                                }
                                                onClick={() =>
                                                  handleToggleListingActive(
                                                    listing
                                                  )
                                                }
                                              >
                                                {listing.active
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
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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