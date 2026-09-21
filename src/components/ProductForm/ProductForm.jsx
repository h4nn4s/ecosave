import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function ProductForm({ onError, categoryVersion }) {
  const [categories, setCategories] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category_id: '',
    image_url: '',
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
  }, [onError, categoryVersion])

  function getProductImage(name) {
    const productName = name.trim().toLowerCase()

    if (productName.includes('kvarg')) return '/products/kvarg.jpg'
    if (productName.includes('levain')) return '/products/levain.jpg'
    if (productName.includes('pasta')) return '/products/pasta.jpg'

    return null
  }

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
        image_url: getProductImage(newProduct.name),
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
          value={newProduct.image_url}
          onChange={(event) =>
            setNewProduct({
              name: '',
              brand: '',
              category_id: '',
              image_url: '',
            })
          }
          placeholder="Bild-URL"
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