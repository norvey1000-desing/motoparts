const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a PostgreSQL (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'TU_URL_DE_SUPABASE_AQUI',
  ssl: {
    rejectUnauthorized: false // Necesario para conexiones seguras en la nube
  }
});

// Verificar conexión e inicializar datos por defecto (como el admin)
async function inicializarBaseDatos() {
  try {
    await pool.query(`
      INSERT INTO usuarios (email, password, nombre, rol) 
      VALUES ('admin@motoparts.com', '123456', 'Administrador', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log("✅ Conectado y base de datos verificada en PostgreSQL (Supabase).");
  } catch (err) {
    console.error("🔥 Error al inicializar datos en PostgreSQL:", err);
  }
}

inicializarBaseDatos();

// ==========================================
//              ENDPOINTS DE LA API
// ==========================================

// 1. LOGIN
app.post(['/login', '/api/login'], async (req, res) => {
  console.log("1. 📥 Petición de login recibida. Datos:", req.body);
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, email, nombre, rol FROM usuarios WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length > 0) {
      console.log("7. 🚀 Enviando respuesta exitosa al cliente.");
      return res.json({
        success: true,
        token: "jwt-token-temporal-12345",
        message: 'Bienvenido al sistema',
        usuario: result.rows[0]
      });
    } else {
      console.log("7. 🚫 Credenciales inválidas (401).");
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (err) {
    console.error("🔥 Error crítico en login:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, nombre, rol FROM usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener usuarios:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Crear un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;
    const result = await pool.query(
      "INSERT INTO usuarios (email, password, nombre, rol) VALUES ($1, $2, $3, $4) RETURNING id",
      [email, password, nombre || '', rol || 'empleado']
    );
    res.json({ id: result.rows[0].id, mensaje: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error("❌ Error al crear usuario:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. PRODUCTOS (Inventario)
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/productos', async (req, res) => {
  const { codigo, nombre, categoria, costo, precio, stock } = req.body;
  try {
    await pool.query(
      "INSERT INTO productos (codigo, nombre, categoria, costo, precio, stock) VALUES ($1, $2, $3, $4, $5, $6)",
      [codigo, nombre, categoria, costo, precio, stock]
    );
    res.json({ success: true, message: 'Producto creado exitosamente' });
  } catch (err) {
    console.error("❌ Error detallado en servidor:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, categoria, costo, precio, stock } = req.body;
  try {
    await pool.query(
      "UPDATE productos SET codigo = $1, nombre = $2, categoria = $3, costo = $4, precio = $5, stock = $6 WHERE id = $7",
      [codigo, nombre, categoria, costo, precio, stock, id]
    );
    res.json({ success: true, message: 'Producto actualizado' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM productos WHERE id = $1", [id]);
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. CLIENTES
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  const { cedula, nombre, telefono, direccion } = req.body;
  try {
    await pool.query(
      "INSERT INTO clientes (cedula, nombre, telefono, direccion) VALUES ($1, $2, $3, $4)",
      [cedula, nombre, telefono, direccion]
    );
    res.json({ success: true, message: 'Cliente registrado' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. VENTAS Y CONTABILIDAD
app.get('/api/ventas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id as id_venta, 
        v.fecha, 
        v.total, 
        v.metodo_pago,
        c.nombre as cliente,
        c.cedula
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      ORDER BY v.fecha DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ventas', async (req, res) => {
  const { cliente, cliente_id, total, metodoPago, metodo_pago, items } = req.body;
  try {
    let finalClienteId = cliente_id;

    if (!finalClienteId && cliente) {
      const cliRes = await pool.query("SELECT id FROM clientes WHERE nombre = $1", [cliente]);
      if (cliRes.rows.length > 0) {
        finalClienteId = cliRes.rows[0].id;
      } else {
        const newCliRes = await pool.query(
          "INSERT INTO clientes (nombre, cedula) VALUES ($1, $2) RETURNING id",
          [cliente, 'POS-' + Date.now().toString().slice(-6)]
        );
        finalClienteId = newCliRes.rows[0].id;
      }
    }

    const pago = metodo_pago || metodoPago || 'Efectivo';

    // Insertar venta principal y obtener su ID con RETURNING id
    const ventaRes = await pool.query(
      "INSERT INTO ventas (cliente_id, total, metodo_pago) VALUES ($1, $2, $3) RETURNING id",
      [finalClienteId || null, total, pago]
    );
    const venta_id = ventaRes.rows[0].id;

    // Registrar los detalles y descontar stock
    if (items && Array.isArray(items)) {
      for (let item of items) {
        const prodId = item.producto_id || item.id;
        const precioUnit = item.precio_unitario || item.precio || 0;
        const subtotal = item.subtotal || (precioUnit * item.cantidad);

        await pool.query(
          "INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)",
          [venta_id, prodId, item.cantidad, precioUnit, subtotal]
        );
        await pool.query(
          "UPDATE productos SET stock = stock - $1 WHERE id = $2",
          [item.cantidad, prodId]
        );
      }
    }

    res.json({ success: true, message: 'Venta registrada con éxito', ventaId: venta_id });
  } catch (err) {
    console.error("❌ Error detallado al procesar la venta:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/ventas/:id/detalle', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        dv.cantidad,
        dv.precio_unitario as precio,
        dv.subtotal,
        p.nombre,
        p.codigo
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = $1
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
//      SERVIDOR FRONTEND DE ANGULAR
// ==========================================
const frontendPath = path.join(__dirname, 'public');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Iniciar servidor Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo y listo en el puerto ${PORT}`);
});