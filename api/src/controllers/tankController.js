import pool from '../config/database.js';

export async function getTankLevel(req, res) {
  try {
    const [rows] = await pool.query('SELECT level FROM tank_status ORDER BY id DESC LIMIT 1');

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró información del tanque' });
    }

    res.json({ level: rows[0].level });
  } catch (error) {
    console.error('Error en getTankLevel:', error);
    res.status(500).json({ error: 'Error al obtener nivel del tanque' });
  }
}

export async function updateTankLevel(req, res) {
  try {
    const { level } = req.body;

    if (level === undefined || level < 0 || level > 100) {
      return res.status(400).json({ error: 'Nivel debe estar entre 0 y 100' });
    }

    await pool.query('UPDATE tank_status SET level = ? WHERE id = 1', [level]);

    res.json({ success: true, level });
  } catch (error) {
    console.error('Error en updateTankLevel:', error);
    res.status(500).json({ error: 'Error al actualizar nivel del tanque' });
  }
}
