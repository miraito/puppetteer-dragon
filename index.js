const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const fetch = require("node-fetch");

const remoteWeek = [3];

exports.handler = async () => {
  // (async () => {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    })
    const page = await browser.newPage()
    await page.goto('https://stopcovid19.metro.tokyo.lg.jp/')
    const itemSelector = '#app > div > div.appContainer > main > div > div > div:nth-child(3) > div.row.DataBlock > div:nth-child(2) > div > div > div.DataView-Header > div > div > span';
    await page.waitForSelector(itemSelector)
    const item = await page.$(itemSelector);
    var kazu = await (await item.getProperty('textContent')).jsonValue();
    kazu = kazu.trim().split("\n")[0]
    const data = makeText(kazu);
    const sendText = JSON.stringify({"username":"node_bot","text": data,"icon_emoji":":ghost:"});
    await page.close();
    await browser.close();
    const hoge  = await fetch("https://hooks.slack.com/services/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", {
      method: "POST",
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(sendText)
      },
      body: sendText
    })
    const response = {
      statusCode: 200,
    };
    return response;
  };

const makeText = (kansenNum) => {
  let text = `昨日の東京の感染者数 : ${kansenNum} 人\r\n`;

  const date = new Date () ;
  const dayOfWeek = date.getDay() ;	// 曜日(数値)
  if (remoteWeek.includes(dayOfWeek)) {
    text += '本日はリモートデーです';
  } else {
    text += '本日はフレックスデーです';
  }
  return text;
}

