import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [session, setSession] = useState(null)
  const [categories, setCategories] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

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

        {categories.length === 0 ? (
          <p>Inga kategorier ännu.</p>
        ) : (
          <ul>
            {categories.map((category) => (
              <li key={category.id}>{category.name}</li>
            ))}
          </ul>
        )}

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