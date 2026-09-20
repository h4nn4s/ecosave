function ProductList({
    listings,
    products,
    stores,
    editingListing,
    setEditingListing,
    editedListing,
    setEditedListing,
    handleUpdateListing,
    handleDeleteListing,
    handleToggleActive,
}) {
    const groupedListings = listings.reduce((groups, listing) => {
        const category = listing.products?.categories?.name || 'Övrigt'

        if (!groups[category]) {
            groups[category] = []
        }

        groups[category].push(listing)

        return groups
    }, {})

    return (
        <section>
            <h2>Alla varor</h2>

            {listings.length === 0 ? (
                <p>Inga listningar ännu.</p>
            ) : (
                Object.entries(groupedListings)
                    .sort(([categoryA], [categoryB]) =>
                        categoryA.localeCompare(categoryB)
                    )
                    .map(([category, categoryListings]) => (
                        <div key={category}>
                            <h3>{category}</h3>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Produkt</th>
                                        <th>Butik</th>
                                        <th>Antal</th>
                                        <th>Pris</th>
                                        <th>Bäst före</th>
                                        <th>Anledning</th>
                                        <th>Status</th>
                                        <th>Åtgärder</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categoryListings.map((listing) => (
                                        <tr key={listing.id}>
                                            {editingListing?.id === listing.id ? (
                                                <>
                                                    <td>
                                                        <select
                                                            value={editedListing.product_id}
                                                            onChange={(event) =>
                                                                setEditedListing({
                                                                    ...editedListing,
                                                                    product_id:
                                                                        event.target
                                                                            .value,
                                                                })
                                                            }
                                                        >
                                                            <option value="">
                                                                Välj produkt
                                                            </option>

                                                            {products.map(
                                                                (product) => (
                                                                    <option
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={
                                                                            product.id
                                                                        }
                                                                    >
                                                                        {
                                                                            product.name
                                                                        }
                                                                        {product.brand &&
                                                                            ` – ${product.brand}`}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
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
                                                            <option value="">
                                                                Välj butik
                                                            </option>

                                                            {stores.map(
                                                                (store) => (
                                                                    <option
                                                                        key={
                                                                            store.id
                                                                        }
                                                                        value={
                                                                            store.id
                                                                        }
                                                                    >
                                                                        {
                                                                            store.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
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
                                                                    price: event
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                        />
                                                    </td>

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
                                                            type="text"
                                                            value={
                                                                editedListing.reason
                                                            }
                                                            onChange={(event) =>
                                                                setEditedListing({
                                                                    ...editedListing,
                                                                    reason: event
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                            placeholder="Anledning"
                                                        />
                                                    </td>

                                                    <td>
                                                        {listing.active
                                                            ? 'Aktiv'
                                                            : 'Inaktiv'}
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleUpdateListing(
                                                                    {
                                                                        preventDefault:
                                                                            () => {},
                                                                    }
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
                                                                    product_id:
                                                                        '',
                                                                    store_id:
                                                                        '',
                                                                    quantity:
                                                                        '',
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
                                                        {listing.products?.name}

                                                        {listing.products
                                                            ?.brand &&
                                                            ` – ${listing.products.brand}`}
                                                    </td>

                                                    <td>
                                                        {listing.stores?.name}
                                                    </td>

                                                    <td>
                                                        {listing.quantity} st
                                                    </td>

                                                    <td>
                                                        {listing.price} kr
                                                    </td>

                                                    <td>
                                                        {listing.best_before}
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
                                                                    product_id:
                                                                        listing.product_id,
                                                                    store_id:
                                                                        listing.store_id,
                                                                    quantity:
                                                                        listing.quantity,
                                                                    price: listing.price,
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
                                                            onClick={() =>
                                                                handleDeleteListing(
                                                                    listing
                                                                )
                                                            }
                                                        >
                                                            Ta bort
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleToggleActive(
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
                        </div>
                    ))
            )}
        </section>
    )
}

export default ProductList