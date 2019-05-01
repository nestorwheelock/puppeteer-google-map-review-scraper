require("dotenv").config();

const mongoose = require('mongoose');

const Map = require("./modules/map");
const Spider = require("./modules/spider");

const map = new Map(process.env.API_KEY);
const spider = new Spider();

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0-ngemq.mongodb.net/review?retryWrites=true`, {
    useNewUrlParser: true
});

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

const main = async (lat, lng, collection, max) => {
    await spider.init();
    let queue = await map.nearby(lat, lng);
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

main(25.0439355, 121.503584, "Ximen", 200);
