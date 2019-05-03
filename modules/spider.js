const fs = require("fs");

const puppeteer = require("puppeteer");
const mongoose = require('mongoose');
const ProgressBar = require('progress');

const reviewSchema = require("../models/reviews");
const { getReviewsCount, getCurrentCount, getPreviousHeight, scrollToBottom, getAllReviews } = require("../utils/scripts");

/**
 * 
 * @param {Object} page page object of puppeteer
 * @param {number} total total review number of this place
 * @param {{max?: [number=200], delay?: [number=100], name?: [string="unknown"]}} option options
 */
const infiniteScrolling = async (page, total, option = {}) => {
    const max = option.max || 200;
    const delay = option.delay || 100;
    const name = option.name || "unknown";
    const bar = new ProgressBar(`crawling : "${name}" [:bar] :percent`, { total: max, width: 30 });
    let current_count = await page.evaluate(getCurrentCount);

    while (current_count < total && current_count < max) {
        await page.waitForSelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show");
        const previousHeight = await page.evaluate(getPreviousHeight);

        await page.evaluate(scrollToBottom);

        await page.waitForFunction(`document.querySelector(".section-listbox.section-scrollbox.scrollable-y.scrollable-show").scrollHeight>${previousHeight}`);
        await page.waitFor(delay);
        current_count = await page.evaluate(getCurrentCount);
        bar.tick(10);
    }
}

class Spider {
    constructor() {
        this.browser = null;
        this.page = null;
        this.result = null;
    }

    /**
     * initialize spider
     */
    async init() {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
    }

    /**
     * Crawling google map.
     * @param {object} place place object contains name & id.
     * @param {number} max limitation of reviews.
     */
    async crawl(place, max) {
        const url = `https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.id}`;
        await this.page.goto(url);
        const btn = await this.page.waitForXPath("//button[@class='allxGeDnJMl__button allxGeDnJMl__button-text'][contains(@aria-label,'評論')]", { timeout: 10000, visible: true });
        await btn.click();
        await this.page.waitForNavigation();
        await this.page.waitForSelector(".section-review-text", { timeout: 10000 });

        const reviews_count = await this.page.evaluate(getReviewsCount);
        await infiniteScrolling(this.page, reviews_count, { max, name: place.name });

        const reviews = await this.page.evaluate(getAllReviews);

        const title = await this.page.title();

        this.result = { title, data: reviews };
    }

    /**
     * Save result to an file in ./dist
     * Clear this.result.
     */
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

    /**
     * Save result to mongodb
     * @param {string} collection collection name to save.
     * @return {Promise}
     */
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

    /**
     * clear result
     */
    clear() {
        this.result = null;
    }

    /**
     * Close puppeteer 
     */
    async close() {
        await this.browser.close();
    }

    /**
     * close connection to mongodb
     */
    closeDb() {
        return mongoose.connection.close();
    }
}

module.exports = Spider;