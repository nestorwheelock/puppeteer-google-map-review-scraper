const fs = require("fs");

const puppeteer = require("puppeteer");

const ALL_REVIEWS_BUTTON = "button.allxGeDnJMl__button.allxGeDnJMl__button-text";
const REVIEW_CONTENT = ".section-review-text";

const url = "https://www.google.com.tw/maps/place/%E9%A6%AC%E8%BE%A3%E9%A0%82%E7%B4%9A%E9%BA%BB%E8%BE%A3%E9%B4%9B%E9%B4%A6%E7%81%AB%E9%8D%8B-%E8%A5%BF%E9%96%80%E5%BA%97/@25.0468392,121.5069041,17z/data=!4m12!1m6!3m5!1s0x3442a982b765785f:0x3d99699dcac7ee13!2z55-z5LqM6Y2LIOahguael-Wutuaoguemj-W6lw!8m2!3d25.0377031!4d121.506182!3m4!1s0x0:0xe00f3480c3b7e765!8m2!3d25.0434989!4d121.5062953?hl=zh-TW";

const getReviewsCount = () => {
    const count = document.querySelector(".gm2-caption").textContent;
    return parseInt(count.match(/[0-9]*/g).join(""));
}

const getCurrentCount = () => {
    return document.querySelectorAll(".section-review-content").length;
}

const getPreviousHeight = () => {
    return document.querySelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show").scrollHeight;
}

const infiniteScrolling = async (page, total, delay = 100) => {
    let current_count = await page.evaluate(getCurrentCount);

    while (current_count < total && current_count < 1000) {
        await page.waitForSelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show");
        const previousHeight = await page.evaluate(getPreviousHeight);

        await page.evaluate(() => {
            let scrollbar = document.querySelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show");
            scrollbar.scrollTo(0, scrollbar.scrollHeight);
        });

        await page.waitForFunction(`document.querySelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show").scrollHeight>${previousHeight}`);
        await page.waitFor(delay);
        current_count = await page.evaluate(getCurrentCount);
        console.log(current_count);
    }
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector(ALL_REVIEWS_BUTTON);
    await page.click(ALL_REVIEWS_BUTTON);
    await page.waitForSelector(REVIEW_CONTENT);

    const reviews_count = await page.evaluate(getReviewsCount);
    await infiniteScrolling(page, reviews_count);

    const reviews = await page.evaluate(() => {
        const all_reviews = document.querySelectorAll(".section-review-review-content > .section-review-text");
        const result = [...all_reviews].map((e) => e.textContent);
        return result;
    });

    console.log(reviews);

    const title = await page.title();

    fs.writeFileSync(`dist/${title}.json`, JSON.stringify({ data: reviews }));

    await browser.close();
})();