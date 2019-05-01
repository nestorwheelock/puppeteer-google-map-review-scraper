require("dotenv").config();

const mongoose = require('mongoose');

const Map = require("./modules/map");
const Spider = require("./modules/spider");

const map = new Map(process.env.API_KEY);
const spider = new Spider();

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0-ngemq.mongodb.net/review?retryWrites=true`, {
    useNewUrlParser: true
});

const scrape = async (queue) => {
    for (const place of queue) {
        console.log(place)
        try {
            await spider.crawl(`https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.id}`, 200);
        } catch (e) {
            console.log(e);
        }

        try {
            await spider.saveToDb("Ximen");
        } catch (e) {
            console.log(e);
        }
    }
}

(async () => {
    await spider.init();
    let queue = await map.nearby(25.0439355, 121.503584);
    await scrape(queue);
    while (map.hasNext()) {
        queue = await map.next();
        await scrape(queue);
    }
    mongoose
        .disconnect()
        .then(() => {
            process.exit();
        }).catch(e => {
            console.log(e);
        });
})();
