import { test, expect } from "@playwright/test";
const fs = require("fs");
const axios = require("axios");

test.beforeEach(async ({ page }) => {
  await page.goto("https://danube-web.shop/");

  await page.click("#login");

  await page.type("#n-email", process.env.USER_EMAIL);
  await page.type("#n-password2", process.env.USER_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();

  await page.locator("#account").click();
});

test("file upload", async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(process.env.FILE_PATH);
  await page.getByRole("button", { name: "Upload" }).click();

  await page.getByText("Upload successful.");
});

test.only("file download", async ({ page }) => {
  const url = await page.$eval("#orders > ul > li > a", (el) => el.href);
  const filePath = './tests/fixtures/downloadedFile.pdf';

  // Download the file using Axios
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  // Handle if writing passes or failes
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  console.log(`File downloaded to ${filePath}`);

  // Compare the downloaded file to the existing file using Playwright/Test
  const downloadedFile = await page.locator('input[type=file]').inputValue(filePath);
  const existingFile = await page.locator('input[type=file]').inputValue(process.env.TEST_FILE_PATH);
  expect(downloadedFile).toEqual(existingFile);
});

test("file download alt", async ({ page }) => {
  await page.locator("#orders > ul > li:nth-child(1) > a");

  const downloadPromise = page.waitForEvent("download");

  await page.getByRole("link", { name: "Invoice" }).click();

  const download = await downloadPromise;

  const newFilePath = await download.path();

  const testFile = await fs.promises.readFile(process.env.TEST_FILE_PATH);
  const newFile = await fs.promises.readFile(newFilePath);

  expect(testFile).toEqual(newFile);
});
