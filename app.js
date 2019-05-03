require("dotenv").config();

const mongoose = require('mongoose');

const Map = require("./modules/map");
const Spider = require("./modules/spider");

const map = new Map(process.env.API_KEY);
const spider = new Spider();

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true
});

/**
 * Loop through the queue and crawl each place in the queue.
 * Save the results in mongodb.
 * @param {Array.<{name: string, id: string}>} queue the queue to be crawled in spider.
 * @param {string} collection collection name to save.
 * @param {number} max limitation of reviews.
 */
const scrape = async (queue, collection, max) => {
    for (const place of queue) {
        try {
            await spider.crawl(place, max);
        } catch (e) {
            console.log(e);
        }

        try {
            await spider.saveToDb(collection);
        } catch (e) {
            console.log(e);
        }
    }
}

/**
 * The entry point of this program.
 * @param {string} collection collection name to save.
 * @param {{lat: number,lng: number,max: number,type: string,radius: number}} option options.
 */
const main = async (collection, option = {}) => {
    const { lat, lng } = option;
    const max = option.max || 200;
    const type = option.type || "restaurant";
    const radius = option.radius || 1500;

    await spider.init();
    let queue = await map.nearby(lat, lng, radius, type);
    await scrape(queue, collection, max);
    while (map.hasNext()) {
        queue = await map.next();
        await scrape(queue, collection, max);
    }
    mongoose
        .disconnect()
        .then(() => {
            process.exit();
        }).catch(e => {
            console.log(e);
        });
};

main("Ximen", {
    lat: 25.0439355,
    lng: 121.503584,
    max: 200,
    type: "restaurant",
    radius: 1500
});
