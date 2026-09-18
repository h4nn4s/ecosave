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
              {product.name}
              {product.brand && ` – ${product.brand}`}
              {product.categories && ` (${product.categories.name})`}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ProductManager