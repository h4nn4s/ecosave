import { useState } from 'react'

function AddProduct({
    products,
    stores,
    productSearch,
    setProductSearch,
    filteredProducts,
    newListing,
    setNewListing,
    onAddListing,
}) {
    return (
        <section>
            <h2>Produktutbud</h2>

            <input
                type="text"
                value={productSearch}
                onChange={(event) => {
                    setProductSearch(event.target.value)
                    setNewListing({
                        ...newListing,
                        product_id: '',
                    })
                }}
                placeholder="Sök produkt"
            />

            {productSearch && !newListing.product_id && (
                <div>
                    {filteredProducts.filter((product) => product.active).length === 0 ? (
                        <p>
                            Ingen produkt hittades.
                            <br />
                            Produkten måste skapas innan den kan läggas till här.
                        </p>
                    ) : (
                        <ul>
                            {filteredProducts
                                .filter((product) => product.active)
                                .map((product) => (
                                    <li key={product.id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewListing({
                                                    ...newListing,
                                                    product_id: String(product.id),
                                                })
                                                setProductSearch(
                                                    `${product.name}${product.brand
                                                        ? ` – ${product.brand}`
                                                        : ''
                                                    }`
                                                )
                                            }}
                                        >
                                            {product.name}
                                            {product.brand &&
                                                ` – ${product.brand}`}
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
            )}

            {newListing.product_id && (
                <p>
                    Vald produkt: {productSearch}
                </p>
            )}

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

            <button type="button" onClick={onAddListing}>
                Lägg till
            </button>
        </section>
    )
}

export default AddProduct