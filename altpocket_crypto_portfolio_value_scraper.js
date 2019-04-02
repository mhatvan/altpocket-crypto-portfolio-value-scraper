const puppeteer = require('puppeteer');
const { WebClient } = require('@slack/web-api');
const credentials = require('./credentials');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://altpocket.io/login');
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    const emailField = await page.$('input[name=username]');
    const passwordField = await page.$('input[name=password]');
    const loginButton = await page.$('button[type=submit]');

    await emailField.type(credentials.email);
    await passwordField.type(credentials.password);
    await loginButton.click();

    await page.waitForNavigation();

    const portfolioValue = await page.$eval(
      '#widgetHoldingsHistoricalChart > div > div:nth-child(2) > div.col-3 > div > div:nth-child(2) > p',
      value => value.textContent.trim(),
    );

    const slackChannel = credentials.slackChannel;
    const slackToken = credentials.slackToken;
    const slackMessage = `current Altpocket.io portfolio value equals: ${portfolioValue}! :moneybag: :rocket:`;
    const web = new WebClient(slackToken);

    await web.chat.postMessage({
      channel: slackChannel,
      text: slackMessage,
      username: 'Altpocket.io Portfolio Value Bot',
      as_user: false,
    });
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
