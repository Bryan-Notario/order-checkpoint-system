<?php
// ===================================================
// CONFIGURACIÓN DE CABECERAS (CORS + JSON)
// ===================================================
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:5173'); // Permite que React (puerto 5173) llame esta API
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// El navegador manda una petición "OPTIONS" antes de la real, para verificar permisos (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ===================================================
// CONEXIÓN A LA BASE DE DATOS
// ===================================================
$servidor = "db";
$usuario = "root";
$contrasena = "root";
$base_datos = "pedidos_master";

$conexion = new mysqli($servidor, $usuario, $contrasena, $base_datos);

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión: " . $conexion->connect_error]);
    exit();
}

// Función de limpieza (igual que en tu index.php original)
function limpiar_codigo($codigo) {
    $codigo = trim($codigo);
    return preg_replace('/[^a-zA-Z0-9]/', '', $codigo);
}

$metodo = $_SERVER['REQUEST_METHOD'];

// ===================================================
// GET → Devolver los últimos 10 pedidos
// ===================================================
if ($metodo === 'GET') {
    $sql = "SELECT ID, Pedido_master, Pedido_asociado, Fecha FROM pedidos_asociados ORDER BY ID DESC LIMIT 10";
    $resultado = $conexion->query($sql);

    $pedidos = [];
    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $pedidos[] = $fila;
        }
    }

    echo json_encode(["pedidos" => $pedidos]);
    $conexion->close();
    exit();
}

// ===================================================
// POST → Guardar un nuevo pedido
// ===================================================
if ($metodo === 'POST') {
    // Leemos el JSON que manda React (en vez de $_POST)
    $datos = json_decode(file_get_contents('php://input'), true);

    $master_input = $datos['master'] ?? '';
    $asociados_input = $datos['asociados'] ?? '';

    $master = limpiar_codigo($master_input);
    $pedidosArray = array_filter(array_map('trim', explode(',', $asociados_input)));
    $asociados = implode(' | ', $pedidosArray);

    if (empty($master) && empty($asociados)) {
        http_response_code(400);
        echo json_encode(["error" => "Debes ingresar al menos un dato (Master o Asociados)."]);
        $conexion->close();
        exit();
    }

    $sql = "INSERT INTO pedidos_asociados (Pedido_master, Pedido_asociado) VALUES (?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ss", $master, $asociados);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["mensaje" => "Datos guardados correctamente", "id" => $conexion->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al guardar: " . $stmt->error]);
    }

    $stmt->close();
    $conexion->close();
    exit();
}

// ===================================================
// DELETE → Eliminar un pedido (por ID o por Master)
// ===================================================
if ($metodo === 'DELETE') {
    $datos = json_decode(file_get_contents('php://input'), true);
    $codigo_eliminar = $datos['codigo'] ?? '';
    $codigo_limpio = limpiar_codigo($codigo_eliminar);

    if (empty($codigo_limpio)) {
        http_response_code(400);
        echo json_encode(["error" => "El código a eliminar está vacío o no es válido."]);
        $conexion->close();
        exit();
    }

    if (is_numeric($codigo_limpio) && $codigo_limpio > 0) {
        $sql = "DELETE FROM pedidos_asociados WHERE ID = ?";
    } else {
        $sql = "DELETE FROM pedidos_asociados WHERE Pedido_master = ?";
    }

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $codigo_limpio);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["mensaje" => "Registro eliminado correctamente."]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "No se encontró ningún registro con ese código."]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al eliminar: " . $stmt->error]);
    }

    $stmt->close();
    $conexion->close();
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);