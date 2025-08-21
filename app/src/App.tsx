import { Route, Routes } from 'react-router'
import Main from './views/Main'
import About from './views/About'
import View from './views/View'
import NotFound from './views/NotFound'
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/code-highlight/styles.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/about" element={<About />} />
      <Route path="/:link" element={<View />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
