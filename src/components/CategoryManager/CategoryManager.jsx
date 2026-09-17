import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

function CategoryManager({ onError }) {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editedCategoryName, setEditedCategoryName] = useState('')

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

  async function handleAddCategory(event) {
    event.preventDefault()

    if (!newCategory.trim()) return

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCategory.trim() })
      .select()
      .single()

    if (error) {
      onError('Kunde inte skapa kategorin.')
      return
    }

    setCategories((current) =>
      [...current, data].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    )

    setNewCategory('')
  }

  async function handleUpdateCategory(event) {
    event.preventDefault()

    if (!editedCategoryName.trim()) return

    const { data, error } = await supabase
      .from('categories')
      .update({ name: editedCategoryName.trim() })
      .eq('id', editingCategory.id)
      .select()
      .single()

    if (error) {
      onError('Kunde inte uppdatera kategorin.')
      return
    }

    setCategories((current) =>
      current
        .map((category) =>
          category.id === data.id ? data : category
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    )

    setEditingCategory(null)
    setEditedCategoryName('')
  }

  async function handleDeleteCategory(category) {
    const confirmed = window.confirm(
      `Är du säker på att du vill ta bort kategorin "${category.name}"?`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      onError('Kunde inte ta bort kategorin.')
      return
    }

    setCategories((current) =>
      current.filter((item) => item.id !== category.id)
    )
  }

  return (
    <section>
      <h2>Kategorier</h2>

      <form onSubmit={handleAddCategory}>
        <input
          type="text"
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          placeholder="Kategorinamn"
        />

        <button type="submit">Lägg till kategori</button>
      </form>

      {categories.length === 0 ? (
        <p>Inga kategorier ännu.</p>
      ) : (
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              {editingCategory?.id === category.id ? (
                <form onSubmit={handleUpdateCategory}>
                  <input
                    type="text"
                    value={editedCategoryName}
                    onChange={(event) =>
                      setEditedCategoryName(event.target.value)
                    }
                  />

                  <button type="submit">Spara</button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null)
                      setEditedCategoryName('')
                    }}
                  >
                    Avbryt
                  </button>
                </form>
              ) : (
                <>
                  {category.name}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(category)
                      setEditedCategoryName(category.name)
                    }}
                  >
                    Redigera
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category)}
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

export default CategoryManager