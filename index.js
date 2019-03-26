require("dotenv").config();

const Map = require("./place");
const Spider = require("./spider");

const map = new Map(process.env.API_KEY);
const spider = new Spider();

const scrape = async(queue)=>{
    for(let place of queue){
        console.log(place)
        try{
            await spider.crawl(`https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.id}`);
        }catch(e){
            console.log(e);
        }

        try {
            await spider.save();
        } catch (e) {
            console.log(e);
        }
    }
}

(async ()=>{
    await spider.init();
    let queue = await map.nearby(25.0439355, 121.503584);
    scrape(queue);
    while(map.hasNext()){
        queue = await map.next();
        scrape(queue);
    }
})();