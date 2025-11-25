// global styles are imported from `main.jsx` to ensure pages use the original styles.css
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import Home from './Home.jsx'
import Introduction from './Introduction.jsx'
import Introductions from './jsonintroductions.jsx'
import Contract from './Contract.jsx'



function App() {
  return (
    <BrowserRouter>
      <Header />

      <TitleUpdater />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/contract" element={<Contract />} />
        <Route path="/jsonintroductions"  element={<Introductions />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}

function TitleUpdater() {
  const location = useLocation()
  const base = "Justin Madren's Jovial Mountain lion || ITIS - 3135"

  // map pathname to page name
  const pageMap = {
    '/': 'Home',
    '/introduction': 'Introduction',
    '/contract': 'Contract',
  }

  const page = pageMap[location.pathname] || ''

  // update title on route change
  ;(function update() {
    if (page) document.title = `${base} - ${page}`
    else document.title = base
  })()

  return null
}

export default App
