const axios = require("axios");

class Map {
    /**
     * @param {string} key the api key of google place api.
     */
    constructor(key) {
        this.key = key;
        this.next_token = "";
    }

    /**
     * Get the first page.
     * @param {number} lat lat
     * @param {number} lng lng
     * @param {number} [radius] radius in meters
     * @param {string} [type] the place type of place api.
     * @return {Array.<{name: string, id: string}>} the queue to be crawled in spider.
     */
    nearby(lat, lng, radius = 1500, type = "restaurant") {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${this.key}`;
        return this.req(url);
    }

    /**
     * Get the next page.
     * @return {Array.<{name: string, id: string}>} the queue to be crawled in spider.
     */
    next(){
        if(!this.next_token){
            return null;
        }
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${this.key}&pagetoken=${this.next_token}`;
        return this.req(url);
    }

    /**
     * @return {boolean} returns true if there is a next page.
     */
    hasNext(){
        return !!this.next_token;
    }

    /**
     * Call place api by axios.
     * @param {string} url the url of place api to call.
     * @return {Array.<{name: string, id: string}>} the queue to be crawled in spider.
     */
    async req(url){
        const res = await axios.get(url);
        this.next_token = res.data.next_page_token;

        const results = res.data.results.map((item) => {
            return { name: item.name, id: item.place_id };
        });

        return results;
    }
}

module.exports = Map;