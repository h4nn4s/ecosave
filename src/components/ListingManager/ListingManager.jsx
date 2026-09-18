import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'

function ListingManager({ onError }) {
    const [listings, setListings] = useState([])
    const [products, setProducts] = useState([])
    const [stores, setStores] = useState([])

    const [newListing, setNewListing] = useState({
        product_id: '',
        store_id: '',
        quantity: '',
        price: '',
        best_before: '',
        reason: '',
    })

    const [editingListing, setEditingListing] = useState(null)
    const [editedListing, setEditedListing] = useState({
        product_id: '',
        store_id: '',
        quantity: '',
        price: '',
        best_before: '',
        reason: '',
    })

    useEffect(() => {
        async function fetchData() {
            const { data: listingData, error: listingError } = await supabase
                .from('listings')
                .select(`
          *,
          products(name, brand),
          stores(name)
        `)
                .order('created_at', { ascending: false })

            if (listingError) {
                onError('Kunde inte hämta listningar.')
                return
            }

            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .order('name')

            if (productError) {
                onError('Kunde inte hämta produkter.')
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

            setListings(listingData)
            setProducts(productData)
            setStores(storeData)
        }

        fetchData()
    }, [onError])

    function getExpiresAt(bestBefore) {
        return `${bestBefore}T22:00:00`
    }

    async function handleAddListing(event) {
        event.preventDefault()

        if (
            !newListing.product_id ||
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
                product_id: Number(newListing.product_id),
                store_id: Number(newListing.store_id),
                quantity: Number(newListing.quantity),
                price: Number(newListing.price),
                best_before: newListing.best_before,
                reason: newListing.reason.trim() || null,
                expires_at: getExpiresAt(newListing.best_before),
                active: true,
            })
            .select(`
        *,
        products(name, brand),
        stores(name)
      `)
            .single()

        if (error) {
            onError('Kunde inte skapa listningen.')
            return
        }

        setListings((current) => [data, ...current])

        setNewListing({
            product_id: '',
            store_id: '',
            quantity: '',
            price: '',
            best_before: '',
            reason: '',
        })
    }

    async function handleUpdateListing(event) {
        event.preventDefault()

        if (
            !editedListing.product_id ||
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
                product_id: Number(editedListing.product_id),
                store_id: Number(editedListing.store_id),
                quantity: Number(editedListing.quantity),
                price: Number(editedListing.price),
                best_before: editedListing.best_before,
                reason: editedListing.reason.trim() || null,
                expires_at: getExpiresAt(editedListing.best_before),
            })
            .eq('id', editingListing.id)
            .select(`
        *,
        products(name, brand),
        stores(name)
      `)
            .single()

        if (error) {
            onError('Kunde inte uppdatera listningen.')
            return
        }

        setListings((current) =>
            current.map((listing) =>
                listing.id === data.id ? data : listing
            )
        )

        setEditingListing(null)
        setEditedListing({
            product_id: '',
            store_id: '',
            quantity: '',
            price: '',
            best_before: '',
            reason: '',
        })
    }

    async function handleDeleteListing(listing) {
        const confirmed = window.confirm(
            'Är du säker på att du vill ta bort listningen?'
        )

        if (!confirmed) {
            return
        }

        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', listing.id)

        if (error) {
            onError('Kunde inte ta bort listningen.')
            return
        }

        setListings((current) =>
            current.filter((item) => item.id !== listing.id)
        )
    }

    return (
        <section>
            <h2>Listningar</h2>

            <form onSubmit={handleAddListing}>
                <select
                    value={newListing.product_id}
                    onChange={(event) =>
                        setNewListing({
                            ...newListing,
                            product_id: event.target.value,
                        })
                    }
                >
                    <option value="">Välj produkt</option>

                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                            {product.brand && ` – ${product.brand}`}
                        </option>
                    ))}
                </select>

                <select
                    value={newListing.store_id}
                    onChange={(event) =>
                        setNewListing({
                            ...newListing,
                            store_id: event.target.value,
                        })
                    }
                >
                    <option value="">Välj butik</option>

                    {stores.map((store) => (
                        <option key={store.id} value={store.id}>
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
                            quantity: event.target.value,
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
                            price: event.target.value,
                        })
                    }
                    placeholder="Pris"
                />

                <label>
                    Bäst före
                    <input
                        type="date"
                        value={newListing.best_before}
                        onChange={(event) =>
                            setNewListing({
                                ...newListing,
                                best_before: event.target.value,
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
                            reason: event.target.value,
                        })
                    }
                    placeholder="Anledning"
                />

                <button type="submit">Lägg till listning</button>
            </form>

            {listings.length === 0 ? (
                <p>Inga listningar ännu.</p>
            ) : (
                <ul>
                    {listings.map((listing) => (
                        <li key={listing.id}>
                            {editingListing?.id === listing.id ? (
                                <form onSubmit={handleUpdateListing}>
                                    <select
                                        value={editedListing.product_id}
                                        onChange={(event) =>
                                            setEditedListing({
                                                ...editedListing,
                                                product_id: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Välj produkt</option>

                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                                {product.brand && ` – ${product.brand}`}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={editedListing.store_id}
                                        onChange={(event) =>
                                            setEditedListing({
                                                ...editedListing,
                                                store_id: event.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Välj butik</option>

                                        {stores.map((store) => (
                                            <option key={store.id} value={store.id}>
                                                {store.name}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        min="1"
                                        value={editedListing.quantity}
                                        onChange={(event) =>
                                            setEditedListing({
                                                ...editedListing,
                                                quantity: event.target.value,
                                            })
                                        }
                                    />

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editedListing.price}
                                        onChange={(event) =>
                                            setEditedListing({
                                                ...editedListing,
                                                price: event.target.value,
                                            })
                                        }
                                    />

                                    <label>
                                        Bäst före
                                        <input
                                            type="date"
                                            value={editedListing.best_before}
                                            onChange={(event) =>
                                                setEditedListing({
                                                    ...editedListing,
                                                    best_before: event.target.value,
                                                })
                                            }
                                        />
                                    </label>

                                    <input
                                        type="text"
                                        value={editedListing.reason}
                                        onChange={(event) =>
                                            setEditedListing({
                                                ...editedListing,
                                                reason: event.target.value,
                                            })
                                        }
                                        placeholder="Anledning"
                                    />

                                    <button type="submit">Spara</button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingListing(null)
                                            setEditedListing({
                                                product_id: '',
                                                store_id: '',
                                                quantity: '',
                                                price: '',
                                                best_before: '',
                                                reason: '',
                                            })
                                        }}
                                    >
                                        Avbryt
                                    </button>
                                </form>
                            ) : (
                                <>
                                    {listing.products?.name}

                                    {listing.products?.brand &&
                                        ` – ${listing.products.brand}`}

                                    {` | ${listing.quantity} st`}

                                    {` | ${listing.price} kr`}

                                    {` | ${listing.stores?.name}`}

                                    {` | Bäst före: ${listing.best_before}`}

                                    {listing.reason &&
                                        ` | ${listing.reason}`}

                                    {` | ${listing.active ? 'Aktiv' : 'Inaktiv'}`}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingListing(listing)
                                            setEditedListing({
                                                product_id: listing.product_id,
                                                store_id: listing.store_id,
                                                quantity: listing.quantity,
                                                price: listing.price,
                                                best_before: listing.best_before,
                                                reason: listing.reason || '',
                                            })
                                        }}
                                    >
                                        Redigera
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteListing(listing)}
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

export default ListingManager