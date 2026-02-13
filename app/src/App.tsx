import { Route, Routes } from "react-router";
import Main from "./views/Main";
import NotFound from "./views/NotFound";
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/code-highlight/styles.css";
import { lazy, Suspense } from "react";
import Loading from "./views/Loading";

const AboutPage = lazy(() => import("./views/About"));
const ViewPage = lazy(() => import("./views/View"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/about" element={<Suspense fallback={<Loading />}><AboutPage /></Suspense>} />
      <Route path="/:link" element={<Suspense fallback={<Loading />}><ViewPage /></Suspense>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
