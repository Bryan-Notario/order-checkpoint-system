import { useState } from 'react';
import { Link } from 'react-router-dom';


const API_URL = 'http://localhost:8080/api/verificar.php';

function Verificador() {
  const [master, setMaster] = useState('');
  const [asociados, setAsociados] = useState('');
  const [resultado, setResultado] = useState(null);
  const [verificando, setVerificando] = useState(false);

  const handleVerificar = async (e) => {
    e.preventDefault();
    setVerificando(true);
    setResultado(null);

    try {
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ master, asociados }),
      });

      const data = await respuesta.json();
      setResultado({ exito: data.exito, mensaje: data.mensaje });

      // Si fue exitoso, limpia los campos para el siguiente escaneo (como en tu verificar.php original)
      if (data.exito) {
        setTimeout(() => {
          setMaster('');
          setAsociados('');
          setResultado(null);
        }, 1500);
      }
    } catch (err) {
      setResultado({ exito: false, mensaje: 'Error al conectar con el servidor.' });
    } finally {
      setVerificando(false);
    }
  };

  return (
     <div className="estacion">
    <div className="verificador">
      <h2>Verificación de Paquete</h2>

      <form onSubmit={handleVerificar}>
        <div className="input-group">
          <label htmlFor="master-scan">1. Escanee el Pedido Master:</label>
          <input
            id="master-scan"
            type="text"
            value={master}
            onChange={(e) => setMaster(e.target.value)}
            placeholder="Master..."
            autoFocus
          />
        </div>

        <div className="input-group">
          <label htmlFor="asociados-scan">2. Escanee los Pedidos Asociados:</label>
          <input
            id="asociados-scan"
            type="text"
            value={asociados}
            onChange={(e) => setAsociados(e.target.value)}
            placeholder="Códigos separados por comas"
          />
        </div>

        <button type="submit" disabled={verificando}>
          {verificando ? 'Verificando...' : 'Verificar Códigos'}
        </button>
      </form>

      {resultado && (
        <div className={`alerta ${resultado.exito ? 'exito' : 'error'}`}>
          {resultado.exito ? '✅' : '❌'} {resultado.mensaje}
        </div>
      )}
    </div>
    </div>
  );
}

export default Verificador;