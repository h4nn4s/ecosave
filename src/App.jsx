import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { supabase } from './lib/supabase'

import CategoryManager from './components/CategoryManager/CategoryManager'
import ProductManager from './components/ProductManager/ProductManager'
import ProductForm from './components/ProductForm/ProductForm'
import CustomerHome from './components/CustomerHome/CustomerHome'
import CustomerListings from './components/CustomerListings/CustomerListings'

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [categoryVersion, setCategoryVersion] = useState(0)
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

  function Admin() {
    if (session) {
      return (
        <main>
          <h1>EcoSave Admin</h1>

          <p>Du är inloggad.</p>

          <nav>
            <button onClick={() => setActiveView('add')}>
              Lägg till produkt och kategori
            </button>

            <button onClick={() => setActiveView('products')}>
              Hantera produkter
            </button>
          </nav>

          {activeView === 'add' && (
            <>
              <CategoryManager
                onError={setError}
                onCategoryChange={() =>
                  setCategoryVersion(
                    (current) => current + 1
                  )
                }
              />

              <ProductForm
                onError={setError}
                categoryVersion={categoryVersion}
              />
            </>
          )}

          {activeView === 'products' && (
            <ProductManager onError={setError} />
          )}

          {error && <p>{error}</p>}

          <button onClick={handleLogout}>
            Logga ut
          </button>
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
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </label>

          <label>
            Lösenord
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </label>

          <button type="submit">
            Logga in
          </button>

          {error && <p>{error}</p>}
        </form>
      </main>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerHome />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/utbud" element={<CustomerListings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App