const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

// 引入路由配置
const websiteRoutes = require('./routes/websiteRoutes');
const performanceRoutes = require('./routes/performanceRoutes');

// 引入数据库配置
const dbConfig = require('./config/dbConfig');

// 中间件
app.use(cors());
app.use(express.json());

// 路由中间件
app.use('/api/websites', websiteRoutes);
app.use('/api/performance', performanceRoutes);

app.get('/', (req, res) => {
  res.sendFile('home.html', { root: 'views' });
});

// 静态文件中间件
app.use(express.static('views'));
app.use('/assets', express.static('assets'));
app.use(express.json());

// app.get('/api/websites/:id', async (req, res) => {
//   try {
//     const conn = await mysql.createConnection(dbConfig);
//     const [website] = await conn.query('SELECT id, name, description, JSON_UNQUOTE(urls) AS urls FROM websites WHERE id = ?', [req.params.id]);
//     try {
//     website[0].urls = JSON.parse(website[0].urls || '[]');
//   } catch (error) {
//     console.error('JSON解析错误:', error);
//     website[0].urls = [];
//   }
//     await conn.end();

//     if (website.length === 0) {
//       return res.status(404).json({ error: 'Website not found' });
//     }
//     res.json(website[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// app.post('/api/websites', async (req, res) => {
//   try {
//     const conn = await mysql.createConnection(dbConfig);
//     const [result] = await conn.execute(
//       'INSERT INTO websites (name, description, urls) VALUES (?, ?, ?)',
//       [req.body.name, req.body.description, JSON.stringify(req.body.urls || [])]
//     );
//     console.log('新增记录ID:', result.insertId);
//     await conn.end();
//     res.json({ id: result.insertId });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.put('/api/websites/:id', async (req, res) => {
//   try {
//     const conn = await mysql.createConnection(dbConfig);
//     await conn.execute(
//       'UPDATE websites SET name = ?, description = ?, urls = ? WHERE id = ?',
//       [req.body.name, req.body.description, JSON.stringify(req.body.urls || []), req.params.id]
//     );
//     await conn.end();
//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.delete('/api/websites/:id', async (req, res) => {
//   try {
//     const conn = await mysql.createConnection(dbConfig);
//     await conn.execute('DELETE FROM websites WHERE id = ?', [req.params.id]);
//     await conn.end();
//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // 获取性能数据接口
// app.get('/api/performance_metrics', async (req, res) => {
//   try {
//     const conn = await mysql.createConnection(dbConfig);
//     const [rows] = await conn.query('SELECT * FROM performance_metrics ORDER BY id DESC LIMIT 100');
//     await conn.end();
//     res.json(rows);
//   } catch (err) {
//     console.error('数据库查询错误:', err);
//     res.status(500).send('服务器错误');
//   }
// });

app.get('/', (req, res) => {
  res.sendFile('home.html', { root: 'views' });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});