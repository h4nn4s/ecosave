import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

import CategoryManager from './components/CategoryManager/CategoryManager'
import ProductManager from './components/ProductManager/ProductManager'
import StoreManager from './components/StoreManager/StoreManager'
import ListingManager from './components/ListingManager/ListingManager'
import ProductForm from './components/ProductForm/ProductForm'


function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeView, setActiveView] = useState('add')

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
        <nav>
          <button onClick={() => setActiveView('add')}>
            Lägg till
          </button>

          <button onClick={() => setActiveView('products')}>
            Hantera produkter
          </button>
        </nav>

        {activeView === 'add' && (
          <>
            <CategoryManager onError={setError} />
            <ProductForm onError={setError} />
          </>
        )}

        {activeView === 'products' && (
          <>
            <ProductManager
              onError={setError}
              onProductStatusChange={() =>
                setRefreshTrigger((current) => current + 1)
              }
            />

            <ListingManager
              onError={setError}
              refreshTrigger={refreshTrigger}
            />
          </>
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