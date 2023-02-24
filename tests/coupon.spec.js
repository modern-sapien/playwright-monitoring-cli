// @ts-ignore
import { test, expect } from "@playwright/test";

test("coupon", async ({ page }) => {
  await page.goto("https://danube-web.shop/");

  for (let i = 1; i <= process.env.PRODUCTS_NUMBER; i++) {
    await page.click(`.preview:nth-child(${i}) > .preview-author`);
    await page.click(".detail-wrapper > .call-to-action");
    await page.click("#logo");
  }

  await page.click("#cart");

  await page.waitForSelector("#total-price");
  const price = await page.$eval("#total-price", (e) => e.innerText);

  await page.click(".cart > label");
  await page.click("#coupon");
  await page.type("#coupon", "COUPON2020");
  await page.click(".cart > div > button");

  const expectedDiscountedPrice = await price * 0.8;
  const discountedPrice = await page.$eval("#total-price", (e) => e.innerText);

  if (discountedPrice ==! expectedDiscountedPrice) {
    throw console.error("discount price mistmatch");
  }
});
