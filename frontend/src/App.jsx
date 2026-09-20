import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import SeleccionRol from './components/SeleccionRol';
import EstacionGeneracion from './components/EstacionGeneracion';
import Verificador from './components/Verificador';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SeleccionRol />} />
        <Route path="/generar" element={<EstacionGeneracion />} />
        <Route path="/verificar" element={<Verificador />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;