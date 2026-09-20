# 🛃 Order Checkpoint System

**Aduana digital de pedidos Master.** Sistema desarrollado para una empresa de logística real, diseñado para verificar que cada pedido Master y sus paquetes asociados coincidan correctamente al pasar de un área a otra dentro del almacén — específicamente, del área de **empaque** a **distribución** — evitando errores de despacho antes de que el paquete salga.

## 🚀 Stack Tecnológico

- **Frontend:** React + Vite, React Router
- **Backend:** PHP (API REST en JSON)
- **Base de datos:** MySQL 8
- **Generación de PDF:** Dompdf
- **Infraestructura:** Docker + Docker Compose

## 🏗️ Arquitectura

El proyecto comenzó como una aplicación PHP monolítica (renderizado del lado del servidor) y fue migrado a una arquitectura desacoplada:

Frontend (React) ──HTTP/JSON──▶ API (PHP) ──▶ MySQL

- `frontend/` — Aplicación de React (SPA) con dos estaciones de trabajo independientes.
- `api/` — Endpoints REST en PHP que exponen la lógica de negocio como JSON.
- `generar_pdf.php` — Generación de reportes PDF con Dompdf.

## 🛂 Las dos estaciones (el concepto de "aduana")

| Estación | Ruta | Función |
|---|---|---|
| 📦 **Generación** | `/generar` | El área de empaque crea el pedido Master, asocia sus paquetes y genera el código QR |
| ✅ **Verificación** | `/verificar` | El área de distribución escanea el Master y sus paquetes para confirmar que coinciden antes de despachar |

Ambas estaciones comparten la misma base de código, pero están pensadas para operar en computadoras distintas dentro del almacén — como dos puestos de control de una misma aduana.

## 📋 Funcionalidades

- ✅ Generación de pedidos con código QR en tiempo real
- ✅ Historial de últimos pedidos con eliminación
- ✅ Verificación de correspondencia Master ↔ Asociados
- ✅ Exportación de reportes en PDF
- ✅ Selector de estación de trabajo (Generación / Verificación)

## 🗄️ Estructura de la base de datos

```sql
CREATE DATABASE IF NOT EXISTS pedidos_master;

USE pedidos_master;

CREATE TABLE pedidos_asociados (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Pedido_master VARCHAR(100) NOT NULL UNIQUE,
    Pedido_asociado VARCHAR(500) NOT NULL,
    Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> `Pedido_master` tiene una restricción `UNIQUE` para permitir búsquedas rápidas y evitar duplicados, sin reemplazar el `ID` autoincremental como llave primaria (usado internamente por la API para eliminar registros).

## 🐳 Cómo ejecutar el proyecto

Requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/Bryan-Notario/order-checkpoint-system.git
cd order-checkpoint-system
docker compose up -d
```

| Servicio | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| API / Backend (PHP) | http://localhost:8080 |
| phpMyAdmin | http://localhost:8081 |

> Nota: la primera vez, crea la tabla `pedidos_asociados` en phpMyAdmin usando el SQL de arriba.

## 📸 Capturas

*(Aquí puedes agregar 2-3 screenshots de la app funcionando)*

## 🧠 Decisiones técnicas destacadas

- Migración incremental por funcionalidad (feature-by-feature) en vez de reescritura completa, para reducir riesgo y mantener el sistema funcional en cada paso.
- Separación de responsabilidades: el backend PHP quedó reducido a una API sin lógica de presentación.
- Uso de rutas en el cliente (React Router) para simular dos estaciones de trabajo independientes desde una sola base de código, en vez de dos despliegues separados.