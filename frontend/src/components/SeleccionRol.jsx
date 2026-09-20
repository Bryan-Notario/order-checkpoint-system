import { Link } from 'react-router-dom';

function SeleccionRol() {
  return (
    <div className="seleccion-rol">
      <h1>Sistema de Pedidos QR</h1>
      <p className="subtitulo">Selecciona la estación de trabajo:</p>

      <div className="tarjetas-rol">
        <Link to="/generar" className="tarjeta-rol">
          <div className="icono-rol">📦</div>
          <h2>Estación de Generación</h2>
          <p>Crear pedidos, generar códigos QR y ver el historial de registros.</p>
        </Link>

        <Link to="/verificar" className="tarjeta-rol">
          <div className="icono-rol">✅</div>
          <h2>Estación de Verificación</h2>
          <p>Escanear y verificar que los paquetes coincidan con su pedido Master.</p>
        </Link>
      </div>
    </div>
  );
}

export default SeleccionRol;