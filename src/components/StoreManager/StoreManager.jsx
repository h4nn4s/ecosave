import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'

function StoreManager({ onError }) {
  const [stores, setStores] = useState([])
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    phone: '',
  })
  const [editingStore, setEditingStore] = useState(null)
  const [editedStore, setEditedStore] = useState({
    name: '',
    address: '',
    phone: '',
  })

  useEffect(() => {
    async function fetchStores() {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name')

      if (error) {
        onError('Kunde inte hämta butiker.')
        return
      }

      setStores(data)
    }

    fetchStores()
  }, [onError])

  async function handleAddStore(event) {
    event.preventDefault()

    if (!newStore.name.trim()) {
      return
    }

    const { data, error } = await supabase
      .from('stores')
      .insert({
        name: newStore.name.trim(),
        address: newStore.address.trim() || null,
        phone: newStore.phone.trim() || null,
      })
      .select()
      .single()

    if (error) {
      onError('Kunde inte skapa butiken.')
      return
    }

    setStores((current) =>
      [...current, data].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    )

    setNewStore({
      name: '',
      address: '',
      phone: '',
    })
  }

  async function handleUpdateStore(event) {
    event.preventDefault()

    if (!editedStore.name.trim()) {
      return
    }

    const { data, error } = await supabase
      .from('stores')
      .update({
        name: editedStore.name.trim(),
        address: editedStore.address.trim() || null,
        phone: editedStore.phone.trim() || null,
      })
      .eq('id', editingStore.id)
      .select()
      .single()

    if (error) {
      onError('Kunde inte uppdatera butiken.')
      return
    }

    setStores((current) =>
      current
        .map((store) =>
          store.id === data.id ? data : store
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    )

    setEditingStore(null)
    setEditedStore({
      name: '',
      address: '',
      phone: '',
    })
  }

  async function handleDeleteStore(store) {
    const confirmed = window.confirm(
      `Är du säker på att du vill ta bort butiken "${store.name}"?`
    )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', store.id)

    if (error) {
      onError('Kunde inte ta bort butiken.')
      return
    }

    setStores((current) =>
      current.filter((item) => item.id !== store.id)
    )
  }

  return (
    <section>
      <h2>Butiker</h2>

      <form onSubmit={handleAddStore}>
        <input
          type="text"
          value={newStore.name}
          onChange={(event) =>
            setNewStore({
              ...newStore,
              name: event.target.value,
            })
          }
          placeholder="Butiksnamn"
        />

        <input
          type="text"
          value={newStore.address}
          onChange={(event) =>
            setNewStore({
              ...newStore,
              address: event.target.value,
            })
          }
          placeholder="Adress"
        />

        <input
          type="text"
          value={newStore.phone}
          onChange={(event) =>
            setNewStore({
              ...newStore,
              phone: event.target.value,
            })
          }
          placeholder="Telefon"
        />

        <button type="submit">Lägg till butik</button>
      </form>

      {stores.length === 0 ? (
        <p>Inga butiker ännu.</p>
      ) : (
        <ul>
          {stores.map((store) => (
            <li key={store.id}>
              {editingStore?.id === store.id ? (
                <form onSubmit={handleUpdateStore}>
                  <input
                    type="text"
                    value={editedStore.name}
                    onChange={(event) =>
                      setEditedStore({
                        ...editedStore,
                        name: event.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    value={editedStore.address}
                    onChange={(event) =>
                      setEditedStore({
                        ...editedStore,
                        address: event.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    value={editedStore.phone}
                    onChange={(event) =>
                      setEditedStore({
                        ...editedStore,
                        phone: event.target.value,
                      })
                    }
                  />

                  <button type="submit">Spara</button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingStore(null)
                      setEditedStore({
                        name: '',
                        address: '',
                        phone: '',
                      })
                    }}
                  >
                    Avbryt
                  </button>
                </form>
              ) : (
                <>
                  <strong>{store.name}</strong>

                  {store.address && ` – ${store.address}`}

                  {store.phone && ` – ${store.phone}`}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingStore(store)
                      setEditedStore({
                        name: store.name,
                        address: store.address || '',
                        phone: store.phone || '',
                      })
                    }}
                  >
                    Redigera
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteStore(store)}
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

export default StoreManager