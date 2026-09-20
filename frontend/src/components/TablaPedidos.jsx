import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/pedidos.php';

function TablaPedidos({ refrescar }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarPedidos = async () => { 
    setCargando(true);
    try {
      const respuesta = await fetch(API_URL);
      const data = await respuesta.json();
      setPedidos(data.pedidos || []);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  };

  // Carga los pedidos al montar el componente, y cada vez que "refrescar" cambie
  useEffect(() => {
    cargarPedidos();
  }, [refrescar]);

  const handleEliminar = async (codigo) => {
    if (!window.confirm(`¿Eliminar el registro con código "${codigo}"?`)) return;

    try {
      const respuesta = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        cargarPedidos(); // refresca la tabla
      } else {
        alert(data.error || 'Error al eliminar.');
      }
    } catch (err) {
      alert('Error al conectar con el servidor.');
    }
  };

  if (cargando) return <p>Cargando pedidos...</p>;
  if (error) return <p className="alerta error">{error}</p>;

  return (
    <div className="tabla-pedidos">
      <h2>Últimos Pedidos</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Master</th>
            <th>Asociados</th>
            <th>Fecha</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 ? (
            <tr>
              <td colSpan="5">No hay pedidos registrados.</td>
            </tr>
          ) : (
            pedidos.map((pedido) => (
  <tr key={pedido.ID}>
    <td data-label="ID">{pedido.ID}</td>
    <td data-label="Master">{pedido.Pedido_master}</td>
    <td data-label="Asociados">{pedido.Pedido_asociado}</td>
    <td data-label="Fecha">{pedido.Fecha}</td>
    <td data-label="Acción">
      <button onClick={() => handleEliminar(pedido.ID)}>
        Eliminar
      </button>
    </td>
  </tr>
))
  
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaPedidos;