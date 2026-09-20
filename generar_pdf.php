<?php
use Dompdf\Dompdf;
use Dompdf\Options;

$autoload = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoload)) {
    http_response_code(500);
    echo "Falta el autoload de Composer.";
    exit;
}
require $autoload;

// Habilitamos CORS por si acaso, aunque para descargas de PDF via <a href> no siempre es necesario
header('Access-Control-Allow-Origin: http://localhost:5173');

// Ahora recibimos los datos por GET (query params), en vez de POST
$master = $_GET['master'] ?? 'N/A';
$asociados = $_GET['asociados'] ?? 'Ninguno';

if (empty($master) || $master === 'N/A') {
    http_response_code(400);
    echo "Faltan datos para generar el PDF.";
    exit;
}

$options = new Options();
$options->set('defaultFont', 'Helvetica');

$dompdf = new Dompdf($options);

$html = '
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Helvetica, sans-serif; margin: 40px; }
        .header { background-color: #022142; color: white; padding: 15px; text-align: center; border-radius: 5px; }
        h1 { margin: 0; font-size: 24px; }
        .registro-box { border: 2px solid #022142; padding: 20px; margin-top: 20px; border-radius: 5px; }
        .etiqueta { font-weight: bold; color: #022142; margin-top: 10px; display: block; }
        .valor { margin-left: 20px; display: block; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 Reporte de Pedido Master</h1>
    </div>
    <div class="registro-box">
        <span class="etiqueta">MASTER:</span>
        <span class="valor">' . htmlspecialchars($master) . '</span>
        <span class="etiqueta" style="margin-top: 15px;">PEDIDOS ASOCIADOS:</span>
        <span class="valor">' . htmlspecialchars($asociados) . '</span>
    </div>
    <p style="text-align: right; margin-top: 30px; font-size: 12px;">
        Generado por el sistema QR el: ' . date("d/m/Y H:i:s") . '
    </p>
</body>
</html>';

$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

function limpiar_codigo($codigo) {
    $codigo = trim($codigo);
    return preg_replace('/[^a-zA-Z0-9]/', '', $codigo);
}

$master_id = limpiar_codigo($master);
$dompdf->stream("Reporte_Pedido_" . $master_id . ".pdf", array("Attachment" => 1));
exit();