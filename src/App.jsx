import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [session, setSession] = useState(null)
  const [categories, setCategories] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editedCategoryName, setEditedCategoryName] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        setError('Kunde inte hämta kategorier.')
        return
      }

      setCategories(data)
    }

    fetchCategories()
  }, [session])

  async function handleAddCategory(event) {
    event.preventDefault()

    if (!newCategory.trim()) return

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCategory.trim() })
      .select()
      .single()

    if (error) {
      setError('Kunde inte skapa kategorin.')
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
      setError('Kunde inte uppdatera kategorin.')
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
      setError('Kunde inte ta bort kategorin.')
      return
    }

    setCategories((current) =>
      current.filter((item) => item.id !== category.id)
    )
  }

  async function handleLogin(event) {
    event.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Fel e-postadress eller lösenord.')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (session) {
    return (
      <main>
        <h1>EcoSave Admin</h1>

        <p>Du är inloggad.</p>

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

        {error && <p>{error}</p>}

        <button onClick={handleLogout}>Logga ut</button>
      </main>
    )
  }

  return (
    <main>
      <h1>EcoSave Admin</h1>

      <form onSubmit={handleLogin}>
        <label>
          E-post
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Lösenord
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="submit">Logga in</button>

        {error && <p>{error}</p>}
      </form>
    </main>
  )
}

export default App