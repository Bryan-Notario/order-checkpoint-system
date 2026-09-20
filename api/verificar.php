<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$servidor = "db";
$usuario = "root";
$contrasena = "root";
$base_datos = "pedidos_master";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit();
}

$datos = json_decode(file_get_contents('php://input'), true);

$master_scan = trim($datos['master'] ?? '');
$asociados_scan_input = trim($datos['asociados'] ?? '');
$asociados_escaneados = array_filter(array_map('trim', explode(',', $asociados_scan_input)));

if (empty($master_scan) || empty($asociados_escaneados)) {
    http_response_code(400);
    echo json_encode(["error" => "Debes ingresar el Master y al menos un Asociado."]);
    exit();
}

$conexion = new mysqli($servidor, $usuario, $contrasena, $base_datos);

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión: " . $conexion->connect_error]);
    exit();
}

$sql = "SELECT Pedido_asociado FROM pedidos_asociados WHERE Pedido_master = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $master_scan);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows == 0) {
    http_response_code(404);
    echo json_encode([
        "exito" => false,
        "mensaje" => "El Pedido Master \"$master_scan\" no existe en la base de datos."
    ]);
} else {
    $fila = $resultado->fetch_assoc();
    $asociados_db_array = array_map('trim', explode(' | ', $fila['Pedido_asociado']));

    $busqueda_correcta = true;
    $asociado_no_encontrado = "";

    foreach ($asociados_escaneados as $asociado_scan) {
        if (!in_array($asociado_scan, $asociados_db_array)) {
            $busqueda_correcta = false;
            $asociado_no_encontrado = $asociado_scan;
            break;
        }
    }

    if ($busqueda_correcta) {
        echo json_encode([
            "exito" => true,
            "mensaje" => "¡Verificación exitosa! Los códigos escaneados están asignados al Master \"$master_scan\"."
        ]);
    } else {
        http_response_code(409);
        echo json_encode([
            "exito" => false,
            "mensaje" => "El Master \"$master_scan\" existe, pero el Asociado \"$asociado_no_encontrado\" no está asignado a él."
        ]);
    }
}

$stmt->close();
$conexion->close();