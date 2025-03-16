import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import fs from 'fs';

// 配置参数
const config = {
  loginUrl: 'http://localhost:5000/login',    // 替换为你的登录页面URL
  targetUrl: 'http://localhost:5000/home', // 替换为目标测试页面URL
  username: 'admin',               // 你的用户名
  password: 'password123',               // 你的密码
  reportPath: './report.html'              // 报告输出路径
};

(async () => {
  // 启动 Puppeteer
  const browser = await puppeteer.launch({
    headless: false, // 设置为 true 则不显示浏览器界面
    args: ['--remote-debugging-port=9222']
  });

  try {
    // 登录流程
    const page = await browser.newPage();

    // 跳转到登录页面
    await page.goto(config.loginUrl, { waitUntil: 'networkidle0' });

    // 填写登录表单（根据实际页面结构调整选择器）
    await page.type('#username', config.username); // 替换为实际的用户名选择器
    await page.type('#password', config.password); // 替换为实际的密码选择器

    // 提交表单并等待导航完成
    await Promise.all([
      page.click('#submit'), // 替换为实际的提交按钮选择器
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    console.log('登录成功');

    // 获取当前浏览器调试地址
    const browserUrl = new URL(browser.wsEndpoint()).origin;

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
          }
        }
      }
    );

    // 保存报告
    fs.writeFileSync(config.reportPath, report);
    console.log(`性能报告已保存至 ${config.reportPath}`);

    // 输出关键指标
    console.log('性能指标:');
    console.log(`- 性能得分: ${lhr.categories.performance.score * 100}`); // 性能得分是一个 0 到 1 之间的小数，乘以 100 转换为百分比
    console.log(`- 首次内容绘制（FCP）: ${lhr.audits['first-contentful-paint'].displayValue}`);
    console.log(`- 最大内容绘制（LCP）: ${lhr.audits['largest-contentful-paint'].displayValue}`);
    console.log(`- 总阻塞时间（TBT）: ${lhr.audits['total-blocking-time'].displayValue}`);
    console.log(`- 页面抖动（CLS）: ${lhr.audits['cumulative-layout-shift'].displayValue}`);
    console.log(`- Interactive: ${lhr.audits['interactive'].displayValue}`);
    console.log(`- 速度指数: ${lhr.audits['speed-index'].displayValue}`);

  } catch (error) {
    console.error('执行出错:', error);
  } finally {
    await browser.close();
  }
})();