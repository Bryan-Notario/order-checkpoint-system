import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const API_URL = 'http://localhost:8080/api/pedidos.php';

function FormularioQR({ onPedidoGuardado }) {
  const [master, setMaster] = useState('P00123456');
  const [asociados, setAsociados] = useState('S100, S101, S102');
  const [qrValue, setQrValue] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Actualiza el contenido del QR cada vez que cambian los inputs
  useEffect(() => {
    const pedidosArray = asociados
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');

    let qrData = '';
    if (master || pedidosArray.length > 0) {
      qrData = `MASTER: ${master}`;
      if (pedidosArray.length > 0) {
        qrData += `\nASOCIADOS:\n- ${pedidosArray.join('\n- ')}`;
      }
    }
    setQrValue(qrData);
  }, [master, asociados]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ master, asociados }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        setMensaje({ tipo: 'exito', texto: data.mensaje });
        if (onPedidoGuardado) onPedidoGuardado(); // avisa al padre para refrescar la tabla
      } else {
        setMensaje({ tipo: 'error', texto: data.error });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al conectar con el servidor.' });
    } finally {
      setGuardando(false);
    }
  };

  const handleDescargarQR = () => {
    const canvas = document.getElementById('qr-code');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_Pedido_${master || 'SIN_MASTER'}.png`;
    link.click();
  };

  const handleDescargarPDF = () => {
  const params = new URLSearchParams({
    master: master,
    asociados: asociados,
  });
  window.open(`http://localhost:8080/generar_pdf.php?${params.toString()}`, '_blank');
};

  return (
    <div className="formulario-qr">
      <h2>Generar Pedido</h2>

      <form onSubmit={handleGuardar}>
        <div className="input-group">
          <label htmlFor="pedido-master">Pedido Master:</label>
          <input
            id="pedido-master"
            type="text"
            value={master}
            onChange={(e) => setMaster(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="pedidos-asociados">Pedidos Asociados (separados por coma):</label>
          <input
            id="pedidos-asociados"
            type="text"
            value={asociados}
            onChange={(e) => setAsociados(e.target.value)}
          />
        </div>

        <button type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar en la base de datos'}
        </button>
      </form>

      {mensaje && (
        <div className={`alerta ${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      <div className="qr-preview">
        <QRCodeCanvas id="qr-code" value={qrValue || ' '} size={250} />
      <button onClick={handleDescargarPDF}>Descargar PDF</button>
      <button onClick={handleDescargarQR}>Descargar QR</button>
      </div>
    </div>

    
  );
}

export default FormularioQR;