import { NavLink } from 'react-router-dom'

// hanterar navigationen mellan kundappens sidor
function CustomerNavigation() {
  return (
    <nav className="customer-navigation">
      <NavLink to="/">Hem</NavLink>
      <NavLink to="/utbud">Utbud</NavLink>
    </nav>
  )
}

export default CustomerNavigation