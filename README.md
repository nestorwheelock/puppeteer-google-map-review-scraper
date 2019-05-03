# Map reviews spider (puppeteer)

## Usage
1. run `npm install`
2. Add a .env file.
3. `npm start`

### Environment variable
Set the following variables in .env file.    
**API_KEY** : Google Place API key.    
**CONNECTION_STRING** :   MongoDB connection string with username & password

## Dependencies
- axios
- dotenv
- puppeteer ( this will install chromium locally )
- progress
- mongoose

## Entry point
### app.js
##### main(lat,lng,collection,max)
`lat` `lng` : \<number> : the latitude & longitude of the place to search.    
`collection` \<string> : the collection name to save in mongodb.    
`max` \<number> : the max length of reviews to get at each place.