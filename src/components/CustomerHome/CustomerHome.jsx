import { Link } from 'react-router-dom'

function CustomerHome() {
  return (
    <main className="customer-page customer-home">
      <p className="customer-home-label">Rädda mat. Spara pengar.</p>

      <h1>EcoSave</h1>

      <p className="customer-home-intro">
        Upptäck mat i din butik som behöver räddas från att gå till spillo.
      </p>

      <Link to="/utbud" className="customer-home-button">
        Se dagens utbud
      </Link>

      <section className="customer-home-info">
        <h2>Så fungerar det</h2>

        <p>
          Vi samlar varor med kort datum och andra produkter som behöver
          räddas.
        </p>

        <p>
          Du hittar varorna i butiken och handlar dem på plats.
        </p>
      </section>
    </main>
  )
}

export default CustomerHome