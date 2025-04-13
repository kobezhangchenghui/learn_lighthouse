const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

const getAllWebsites = async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [websites] = await conn.query('SELECT id, name, description, JSON_UNQUOTE(urls) AS urls, created_at FROM websites');
    await conn.end();
    res.json(websites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWebsiteById = async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [website] = await conn.query('SELECT id, name, description, JSON_UNQUOTE(urls) AS urls FROM websites WHERE id = ?', [req.params.id]);
    
    if (website.length === 0) {
      return res.status(404).json({ error: 'Website not found' });
    }

    try {
      website[0].urls = JSON.parse(website[0].urls || '[]');
    } catch (error) {
      console.error('JSON解析错误:', error);
      website[0].urls = [];
    }

    await conn.end();
    res.json(website[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createWebsite = async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
      'INSERT INTO websites (name, description, urls) VALUES (?, ?, ?)',
      [req.body.name, req.body.description, JSON.stringify(req.body.urls || [])]
    );
    await conn.end();
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateWebsite = async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'UPDATE websites SET name = ?, description = ?, urls = ? WHERE id = ?',
      [req.body.name, req.body.description, JSON.stringify(req.body.urls || []), req.params.id]
    );
    await conn.end();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteWebsite = async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute('DELETE FROM websites WHERE id = ?', [req.params.id]);
    await conn.end();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { exec } = require('child_process');

const runPerformanceTests = async (req, res) => {
  try {
    exec('node puppeteer_lighthouse.js', (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ message: '测试执行失败', error: stderr });
      }
      res.json({ message: '单个测试任务已启动' });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const runSingleTest = async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [website] = await conn.query('SELECT urls FROM websites WHERE id = ?', [req.params.id]);
    await conn.end();
    console.log(`执行runSingleTest，ID: ${req.params.id}`);
    
    if (!website.length) return res.status(404).json({ message: '网站不存在' });
    const urls = [website[0].urls] || '[]';
    
    const promises = urls.map(url => {
      return new Promise((resolve, reject) => {
        exec(`node puppeteer_lighthouse.js "${url}"`, (error) => {
          if (error) {
            console.error(`测试执行失败: ${error}`);
            return reject(error);
          }
          resolve();
        });
      });
    });

    await Promise.all(promises);
    res.json({ message: '测试任务已启动' });
  } catch (err) {
    console.error('测试执行失败:', err);
    res.status(500).json({ message: '测试启动失败', error: err.message });
  }
};

module.exports = {
  getAllWebsites,
  getWebsiteById,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  runPerformanceTests,
  runSingleTest
};