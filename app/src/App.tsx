import { Route, Routes } from "react-router";
import About from "./views/About";
import Main from "./views/Main";
import NotFound from "./views/NotFound";
import View from "./views/View";
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
  );
}

export default App;
