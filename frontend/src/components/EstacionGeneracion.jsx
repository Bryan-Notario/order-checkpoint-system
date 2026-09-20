import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormularioQR from './FormularioQR';
import TablaPedidos from './TablaPedidos';

function EstacionGeneracion() {
  const [contadorRefresco, setContadorRefresco] = useState(0);

  const handlePedidoGuardado = () => {
    setContadorRefresco((prev) => prev + 1);
  };

  return (
    <div className="estacion">
      <div className="estacion-header">
        <h1>Estación de Generación</h1>
        <Link to="/" className="volver-link">← Cambiar estación</Link>
      </div>
      <FormularioQR onPedidoGuardado={handlePedidoGuardado} />
      <TablaPedidos refrescar={contadorRefresco} />
    </div>
  );
}

export default EstacionGeneracion;