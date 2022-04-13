import * as React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Docs from './views/Docs';
import Main from './views/Main';
import NotFound from './views/NotFound';
import View from './views/View';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route exact path="/" element={<Main />} />
        <Route path="/docs" element={<Docs /> } />
        <Route path="/view/:link" element={<View/> } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App;
