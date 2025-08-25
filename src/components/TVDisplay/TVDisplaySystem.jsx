// 🔷 TV DISPLAY ENDPOINTS - FIXED STATUS VALUES
app.get('/api/tv/current-service', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, immatriculation, vehicle_brand, vehicle_model, vehicle_color, 
        service_type, staff, start_time, price
      FROM washes 
      WHERE status = 'active' AND is_active = true 
      AND DATE(created_at) = CURRENT_DATE
      ORDER BY start_time ASC 
      LIMIT 1
    `);
    
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error fetching current service:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tv/queue', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, immatriculation, vehicle_brand, vehicle_model, vehicle_color, 
        service_type, staff, created_at
      FROM washes 
      WHERE status = 'pending' 
      AND DATE(created_at) = CURRENT_DATE
      ORDER BY created_at ASC 
      LIMIT 10
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: error.message });
  }
});