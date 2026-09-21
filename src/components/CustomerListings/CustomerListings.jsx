import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

import CustomerNavigation from '../CustomerNavigation/CustomerNavigation'

function CustomerListings() {
  const [listings, setListings] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          quantity,
          price,
          best_before,
          reason,
          products(
            id,
            name,
            brand,
            category_id,
            image_url,
            categories(name)
          )
        `)
        .eq('active', true)
        .order('best_before')

      if (!error) {
        setListings(data)
      }
    }

    fetchListings()
  }, [])

  const groupedListings = listings.reduce((groups, listing) => {
    const category =
      listing.products.categories?.name || 'Övrigt'

    if (!groups[category]) {
      groups[category] = []
    }

    groups[category].push(listing)

    return groups
  }, {})

  const groupedProducts = Object.entries(groupedListings).map(
    ([category, categoryListings]) => {
      const products = categoryListings.reduce((groups, listing) => {
        const productId = listing.products.id

        if (!groups[productId]) {
          groups[productId] = {
            product: listing.products,
            listings: [],
          }
        }

        groups[productId].listings.push(listing)

        return groups
      }, {})

      return {
        category,
        products: Object.values(products),
      }
    }
  )

  if (selectedProduct) {
    return (
      <main className="customer-page">
        <button
          type="button"
          onClick={() => setSelectedProduct(null)}
        >
          Tillbaka till utbudet
        </button>

        <h1>{selectedProduct.product.name}</h1>

        {selectedProduct.product.image_url && (
          <img
            src={selectedProduct.product.image_url}
            alt={selectedProduct.product.name}
            className="customer-product-image"
          />
        )}

        <p>{selectedProduct.product.categories?.name}</p>

        {selectedProduct.product.brand && (
          <p>{selectedProduct.product.brand}</p>
        )}

        {selectedProduct.listings.length === 1 ? (
          <>
            <p>{selectedProduct.listings[0].price} kr</p>
            <p>{selectedProduct.listings[0].quantity} st</p>
            <p>
              Bäst före: {selectedProduct.listings[0].best_before}
            </p>

            {selectedProduct.listings[0].reason && (
              <p>{selectedProduct.listings[0].reason}</p>
            )}
          </>
        ) : (
          <>
            <h2>Olika alternativ</h2>

            {selectedProduct.listings.map((listing) => (
              <article key={listing.id}>
                <p>{listing.price} kr</p>
                <p>{listing.quantity} st</p>
                <p>Bäst före: {listing.best_before}</p>

                {listing.reason && (
                  <p>{listing.reason}</p>
                )}
              </article>
            ))}
          </>
        )}

        <CustomerNavigation />
      
      </main>
    )
  }

  return (
    <main className="customer-page">
      <h1>Utbud</h1>

      <a href="/">Till startsidan</a>

      <p>
        Varorna finns i butiken och kan inte köpas eller
        reserveras via appen.
      </p>

      {listings.length === 0 ? (
        <p>Det finns inga varor tillgängliga just nu.</p>
      ) : (
        groupedProducts.map(({ category, products }) => (
          <section key={category}>
            <h2>{category}</h2>

            <div className="customer-products">
              {products.map(({ product, listings: productListings }) => (
                <article
                  key={product.id}
                  className="customer-product-card"
                  onClick={() =>
                    setSelectedProduct({
                      product,
                      listings: productListings,
                    })
                  }
                >
                  <div className="customer-product-image-wrapper">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="customer-product-image"
                      />
                    )}

                    {productListings.length === 1 && (
                      <span className="customer-product-price-badge">
                        {productListings[0].price} kr
                      </span>
                    )}
                  </div>

                  <div className="customer-product-info">
                    <h3>{product.name}</h3>

                    {product.brand && (
                      <p>{product.brand}</p>
                    )}

                    {productListings.length === 1 ? (
                      <>
                        <p className="customer-product-quantity">
                          {productListings[0].quantity} st
                        </p>
                      </>
                    ) : (
                      <p className="customer-product-options">
                        {productListings.length} olika alternativ
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}

      <CustomerNavigation />

    </main>
  )
}

export default CustomerListings