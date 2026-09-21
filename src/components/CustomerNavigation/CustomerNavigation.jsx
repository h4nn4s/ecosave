import { NavLink } from 'react-router-dom'

function CustomerNavigation() {
  return (
    <nav className="customer-navigation">
      <NavLink to="/">Hem</NavLink>
      <NavLink to="/utbud">Utbud</NavLink>
    </nav>
  )
}

export default CustomerNavigation