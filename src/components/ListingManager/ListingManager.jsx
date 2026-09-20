import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'

import AddProduct from '../AddProduct/AddProduct'
import ProductList from '../ProductList/ProductList'

function ListingManager({ onError, refreshTrigger }) {
    const [listings, setListings] = useState([])
    const [products, setProducts] = useState([])
    const [stores, setStores] = useState([])
    const [productSearch, setProductSearch] = useState('')

    const filteredProducts = products.filter((product) => {
        const search = productSearch.toLowerCase()

        return `${product.name} ${product.brand || ''}`
            .toLowerCase()
            .includes(search)
    })

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
                    products(name, brand, categories(name)),
                    stores(name)
                    `)
                .order('created_at', { ascending: false })

            if (listingError) {
                onError('Kunde inte hämta listningar.')
                return
            }

            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*, categories(name)')
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
    }, [onError, refreshTrigger])

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

        setProductSearch('')
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

    async function handleToggleActive(listing) {
        const { data, error } = await supabase
            .from('listings')
            .update({
                active: !listing.active,
            })
            .eq('id', listing.id)
            .select(`
      *,
      products(name, brand),
      stores(name)
    `)
            .single()

        if (error) {
            onError('Kunde inte ändra listningens status.')
            return
        }

        setListings((current) =>
            current.map((item) =>
                item.id === data.id ? data : item
            )
        )
    }

    return (
        <section>
            <AddProduct
                products={products}
                stores={stores}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                filteredProducts={filteredProducts}
                newListing={newListing}
                setNewListing={setNewListing}
                onAddListing={handleAddListing}
            />

            <ProductList
                listings={listings}
                products={products}
                stores={stores}
                editingListing={editingListing}
                setEditingListing={setEditingListing}
                editedListing={editedListing}
                setEditedListing={setEditedListing}
                handleUpdateListing={handleUpdateListing}
                handleDeleteListing={handleDeleteListing}
                handleToggleActive={handleToggleActive}
            />
        </section>
    )
}

export default ListingManager