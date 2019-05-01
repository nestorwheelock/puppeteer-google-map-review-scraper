const fs = require("fs");

const puppeteer = require("puppeteer");
const mongoose = require('mongoose');

const reviewSchema = require("../models/reviews");
const { getReviewsCount, getCurrentCount, getPreviousHeight, scrollToBottom, getAllReviews } = require("../utils/scripts");

const infiniteScrolling = async (page, total, max = 200, delay = 100) => {
    let current_count = await page.evaluate(getCurrentCount);

    while (current_count < total && current_count < max) {
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

    async crawl(url, max) {
        await this.page.goto(url);
        const btn = await this.page.waitForXPath("//button[@class='allxGeDnJMl__button allxGeDnJMl__button-text'][contains(@aria-label,'評論')]", { timeout: 10000, visible: true });
        await btn.click();
        await this.page.waitForNavigation();
        await this.page.waitForSelector(".section-review-text", { timeout: 10000 });

        const reviews_count = await this.page.evaluate(getReviewsCount);
        await infiniteScrolling(this.page, reviews_count, max);

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

    saveToDb(collection) {
        if (!this.result) {
            throw new Error("There is no data to save.")
        }

        const Review = mongoose.model("Review", reviewSchema, collection);

        const doc = new Review(this.result);
        this.result = null;

        return doc.save()
            .then(() => {
                console.log("document saved.");
            }).catch(e => {
                console.log(e);
            });
    }

    clear() {
        this.result = null;
    }

    async close() {
        await this.browser.close();
    }

    closeDb() {
        return mongoose.connection.close();
    }
}

module.exports = Spider;