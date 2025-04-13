import fs from 'fs';
import { execSync } from 'child_process';

// 配置参数
const config = {
  urls: process.argv.slice(2) || ['https://www.baidu.com/'], // 从命令行参数获取URL列表
};

(async () => {
  try {
    // 创建报告目录
    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    for (const targetUrl of config.urls) {
      const timestamp = Date.now();
      const safeUrl = targetUrl.replace(/[^a-z0-9]/gi, '_');
      const reportPath = `./reports/${safeUrl}_${timestamp}.html`;
      const jsonPath = `./reports/${safeUrl}_${timestamp}.json`;

      // 执行Lighthouse CLI
      execSync(`lighthouse ${targetUrl} \
        --output=html --output-path=${reportPath} \
        --output=json --output-path=${jsonPath} \
        --only-categories=performance \
        --chrome-flags="--headless=new"`);

      // 解析JSON报告
      const lhr = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const report = fs.readFileSync(reportPath, 'utf8');

    // 保存报告
    fs.writeFileSync(reportPath, report);
    console.log(`性能报告已保存至 ${reportPath}`);

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
    }
  } catch (error) {
    console.error('执行过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
  }
})();