const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

const getPerformanceMetrics = async (req, res) => {
  try {
    try {
      const conn = await mysql.createConnection(dbConfig);
      const [rows] = await conn.query('SELECT * FROM performance_metrics');
      await conn.end();
      res.json(rows);
    } catch (err) {
      console.error('数据库查询错误:', err);
      res.status(500).send('服务器错误');
    }
    } catch (err) {
      console.error('外层错误处理:', err);
      res.status(500).send('服务器错误');
    }
  }

module.exports = {
  getPerformanceMetrics
};