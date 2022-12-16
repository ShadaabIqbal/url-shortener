const urlModel = require('../urlModel/urlModel')
const shortid = require('shortid')
const axios = require('axios')
const redis = require('redis')
const { promisify } = require('util')

const redisClient = redis.createClient(
    13616,
    "redis-13616.c52.us-east-1-4.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("wRs9ZFCYewsG2rHnLkjGzuZC9hmGSGI4", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



//2. Prepare the functions for each command

const SETEX_ASYNC = promisify(redisClient.SETEX).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const createUrl = async function (req, res) {

    try {
        if (!Object.keys(req.body).length > 0) return res.status(400).send({ status: false, message: 'Url is required' })
        if (!Object.keys(req.body).includes('longUrl')) return res.status(400).send({ status: false, message: 'request body should contain only longUrl' })
        const longUrl = req.body.longUrl
        if (typeof longUrl !== 'string' || longUrl == null) return res.status(400).send({ status: false, message: 'Url is not string' })

        //validation for Url
        let correctUrl = false
        await axios.get(longUrl)
            .then(() => { correctUrl = true })
            .catch(() => { correctUrl = false })
        if (correctUrl === false) {
            return res.status(400).send({ status: false, message: "Url is not valid" })
        }


        let presentURL = await urlModel.findOne({ longUrl: longUrl }).select({ updatedAt: 0, createdAt: 0, __v: 0, _id: 0 })
        if (presentURL) return res.status(200).send({ status: true, data: presentURL })
        let urlCode = shortid.generate().toLowerCase()
        let shortUrl = 'http://localhost:3000' + '/' + urlCode
        let savedData = await urlModel.create({ longUrl: longUrl, urlCode: urlCode, shortUrl: shortUrl })
        let object = { longUrl: savedData.longUrl, urlCode: savedData.urlCode, shortUrl: savedData.shortUrl }
        return res.status(201).send({ status: true, data: object })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        let cachedUrl = await GET_ASYNC(`${req.params.urlCode}`)
        if (cachedUrl) {
            return res.status(302).redirect(cachedUrl)
        }
        else {
            let getData = await urlModel.findOne({ urlCode: urlCode })
            if (!getData) return res.status(400).send({ status: false, message: 'no url found' })
            let longUrl = getData.longUrl
            await SETEX_ASYNC(`${urlCode}`, 96000, (longUrl))
            return res.status(302).redirect(longUrl)
        }

        
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createUrl, getUrl }