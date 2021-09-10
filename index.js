if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require("express")
const mongoose = require('mongoose')
const app = express()
const validUrl = require('valid-url')
const shortid = require('shortid')
const url = require('./models/UrlModel')

// Database config

try {
    // Connect to the MongoDB cluster
     mongoose.connect(
        process.env.DATABASE_URI,
      { useNewUrlParser: true, useUnifiedTopology: true },
      () => console.log("mongoose is connected")
    );

  } catch (e) {
    console.log("could not connect");
  }
const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error ${err}`));
dbConnection.once("open", () => console.log("Connected to DB!"));
// Routes Config
app.use(express.json({
    extended: false
}))

const baseUrl = 'http:localhost:5000'
app.get('/',(req,res)=>{
    console.log('requested')
    res.send("Hello there!")
})

app.post('/url/shorten', async(req,res)=>{
    const {longUrl}=req.body
    if(!validUrl.isUri(baseUrl)){
        return res.status(401).json('Invalid base URL')
    }
    // create url code
    const urlCode = shortid.generate()
    //check long url
    if(validUrl.isUri(longUrl)){
        try{
            let single_url = await url.findOne({longUrl})
            if(single_url){
                res.json(single_url)
            }
            else{
                const shortUrl = baseUrl + '/'+ urlCode
                single_url = new url({
                    longUrl,
                    shortUrl,
                    urlCode,
                    date: new Date()
                })
                await single_url.save()
                res.json(single_url)
            }
        }
        catch(err){
            console.log(err)
            res.status(500).json('Server Error')
        }
    }
    else{
        res.status(401).json('Invalid longUrl')
    }
})

app.get('/:code',async(req,res)=>{
    try{
        const single_url = await url.findOne({urlCode: req.params.code})
        if(single_url){
            return res.redirect(single_url.longUrl)
        }
        else{
            return res.status(404).json('No URL Found')
        }

    }
    catch(err){
        console.error(err)
        res.status(500).json('Server Error')
    }
})











//Listen for incoming requests
const PORT = process.env.PORT || 3000
app.listen(PORT, console.log(`server started, listening PORT ${PORT}`))