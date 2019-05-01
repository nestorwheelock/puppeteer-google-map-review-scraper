const axios = require("axios");

class Map {
    constructor(key) {
        this.key = key;
        this.next_token = "";
    }

    nearby(lat, lng, radius = 1500, type = "restaurant") {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${this.key}`;
        return this.req(url);
    }

    next(){
        if(!this.next_token){
            return null;
        }
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${this.key}&pagetoken=${this.next_token}`;
        return this.req(url);
    }

    hasNext(){
        return !!this.next_token;
    }

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