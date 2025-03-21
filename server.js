const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zhang6594699',
  database: 'lighthouse_reports'
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 中间件
app.use(express.static('public'));
app.use(express.json());

// 获取传感器数据接口
app.get('/api/performance_metrics', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM performance_metrics ORDER BY id DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error('数据库查询错误:', err);
    res.status(500).send('服务器错误');
  }
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});