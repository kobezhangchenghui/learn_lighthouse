import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import fs from 'fs';
import mysql from 'mysql2/promise'; // 引入 mysql2 库

// 配置参数
const config = {
  loginUrl: 'http://localhost:5000/login',    // 替换为你的登录页面URL
  targetUrl: 'https://www.baidu.com/', // 替换为目标测试页面URL
  username: 'admin',               // 你的用户名
  password: 'password123',               // 你的密码
  reportPath: './report.html',              // 报告输出路径
  dbConfig: { // 数据库配置
    host: 'localhost',
    user: 'root',
    password: 'Zhang6594699', // 替换为你的 MySQL 密码
    database: 'lighthouse_reports' // 替换为你的数据库名称
  }
};

(async () => {
  // 启动 Puppeteer
  const browser = await puppeteer.launch({
    headless: true, // 设置为 true 则不显示浏览器界面
    args: ['--remote-debugging-port=9222']
  });

  try {
    // 创建数据库连接
    const connection = await mysql.createConnection(config.dbConfig);

    // 确保表存在
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        performance_score FLOAT NOT NULL,
        fcp VARCHAR(50),
        lcp VARCHAR(50),
        tbt VARCHAR(50),
        cls VARCHAR(50),
        interactive VARCHAR(50),
        speed_index VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 使用 Lighthouse 进行性能测试
    const { lhr, report } = await lighthouse(
      config.targetUrl,
      {
        port: new URL(browser.wsEndpoint()).port,
        output: 'html',
        logLevel: 'info',
        disableStorageReset: true, // 保持登录状态
        onlyCategories: ['performance'] // 只测试性能指标
      },
      {
        extends: 'lighthouse:default',
        settings: {
          formFactor: 'desktop',
          screenEmulation: {
            disabled: true
          },
          clearStorage: true // 清理缓存和其他存储数据
        }
      }
    );

    // 保存报告
    fs.writeFileSync(config.reportPath, report);
    console.log(`性能报告已保存至 ${config.reportPath}`);

    // 获取关键指标
    const performanceScore = lhr.categories.performance.score * 100;
    const fcp = lhr.audits['first-contentful-paint'].displayValue;
    const lcp = lhr.audits['largest-contentful-paint'].displayValue;
    const tbt = lhr.audits['total-blocking-time'].displayValue;
    const cls = lhr.audits['cumulative-layout-shift'].displayValue;
    const interactive = lhr.audits['interactive'].displayValue;
    const speedIndex = lhr.audits['speed-index'].displayValue;

    console.log('性能指标:');
    console.log(`- 性能得分: ${performanceScore}`);
    console.log(`- 首次内容绘制（FCP）: ${fcp}`);
    console.log(`- 最大内容绘制（LCP）: ${lcp}`);
    console.log(`- 总阻塞时间（TBT）: ${tbt}`);
    console.log(`- 页面抖动（CLS）: ${cls}`);
    console.log(`- Interactive: ${interactive}`);
    console.log(`- 速度指数: ${speedIndex}`);

    // 将性能指标存储到数据库
    await connection.execute(
      `INSERT INTO performance_metrics (url, performance_score, fcp, lcp, tbt, cls, interactive, speed_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [config.targetUrl, performanceScore, fcp, lcp, tbt, cls, interactive, speedIndex]
    );

    console.log('性能指标已存储到数据库');

    // 关闭数据库连接
    await connection.end();

  } catch (error) {
    console.error('执行出错:', error);
  } finally {
    await browser.close();
  }
})();