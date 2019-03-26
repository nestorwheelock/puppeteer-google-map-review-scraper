const Spider = require("./spider");

const spider = new Spider();


(async ()=>{
    await spider.init();
    await spider.crawl("https://www.google.com/maps/place/%E6%BC%A2%E8%88%88%E6%9B%B8%E5%B1%80%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8/@25.038635,121.5070652,18.42z/data=!4m5!3m4!1s0x0:0x97d5127ca0d23bf1!8m2!3d25.0381545!4d121.5081145");
    await spider.save();
    await spider.close();
})();