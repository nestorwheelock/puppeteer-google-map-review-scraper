const fs = require("fs");

const puppeteer = require("puppeteer");

const { getReviewsCount, getCurrentCount, getPreviousHeight, scrollToBottom, getAllReviews } = require("./scripts");

const infiniteScrolling = async (page, total, delay = 100) => {
    let current_count = await page.evaluate(getCurrentCount);

    while (current_count < total && current_count < 1000) {
        await page.waitForSelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show");
        const previousHeight = await page.evaluate(getPreviousHeight);

        await page.evaluate(scrollToBottom);

        await page.waitForFunction(`document.querySelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show").scrollHeight>${previousHeight}`);
        await page.waitFor(delay);
        current_count = await page.evaluate(getCurrentCount);
        console.log(current_count);
    }
}

class Spider {
    constructor() {
        this.browser = null;
        this.page = null;
        this.result = null;
    }

    async init() {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
    }

    async crawl(url) {
        await this.page.goto(url);
        await this.page.waitForSelector("button.allxGeDnJMl__button.allxGeDnJMl__button-text");
        await this.page.click("button.allxGeDnJMl__button.allxGeDnJMl__button-text");
        await this.page.waitForSelector(".section-review-text");

        const reviews_count = await this.page.evaluate(getReviewsCount);
        await infiniteScrolling(this.page, reviews_count);

        const reviews = await this.page.evaluate(getAllReviews);

        const title = await this.page.title();

        this.result = { title, data: reviews };
    }

    save() {
        if (!this.result) {
            throw new Error("There is no data to save.")
        }

        if (!fs.existsSync("./dist")) {
            fs.mkdirSync("./dist");
        }

        fs.writeFileSync(`./dist/${this.result.title}.json`, JSON.stringify(this.result));
        this.result = null;
    }

    clear() {
        this.result = null;
    }

    async close() {
        await this.browser.close();
    }
}

module.exports = Spider;