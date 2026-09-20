import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function ProductForm({ onError }) {
  const [categories, setCategories] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category_id: '',
  })

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        onError('Kunde inte hämta kategorier.')
        return
      }

      setCategories(data)
    }

    fetchCategories()
  }, [onError])

  async function handleAddProduct(event) {
    event.preventDefault()

    if (!newProduct.name.trim() || !newProduct.category_id) {
      return
    }

    const { error } = await supabase
      .from('products')
      .insert({
        name: newProduct.name.trim(),
        brand: newProduct.brand.trim() || null,
        category_id: Number(newProduct.category_id),
      })

    if (error) {
      onError('Kunde inte skapa produkten.')
      return
    }

    setNewProduct({
      name: '',
      brand: '',
      category_id: '',
    })
  }

  return (
    <section>
      <h2>Lägg till produkt</h2>

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

        <button type="submit">Skapa produkt</button>
      </form>
    </section>
  )
}

export default ProductForm