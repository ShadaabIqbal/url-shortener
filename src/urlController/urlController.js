const urlModel = require('../urlModel/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')

const createUrl = async function (req, res) {

    try {
        if (!Object.keys(req.body).length > 0) return res.status(400).send({ status: false, message: 'Url is required' })
        if (!Object.keys(req.body).includes('longUrl')) return res.status(400).send({ status: false, message: 'request body should contain only longUrl' })
        const longUrl = req.body.longUrl
        if(typeof longUrl !== 'string' || longUrl == null)  return res.status(400).send({ status: false, message: 'Url is not string' })
        if(!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, message: 'Url is not valid' })
        
        //validation for Url
        let presentURL = await urlModel.findOne({ longUrl: longUrl }).select({ updatedAt: 0, createdAt: 0, __v: 0 })
        // if(presentURL) return res.status(200).send({status: true, data: presentURL})
        if (presentURL) return res.status(400).send({ status: false, message: "Already present url" })
        let urlCode = shortid.generate().toLowerCase()
        let shortUrl = 'http://localhost:3000' + '/' + urlCode
        let obj = { longUrl: longUrl, urlCode: urlCode, shortUrl: shortUrl }
        let savedData = await urlModel.create(obj)
        let object = { longUrl: savedData.longUrl, urlCode: savedData.urlCode, shortUrl: savedData.shortUrl }
        return res.status(201).send({ status: true, data: object })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getUrl = async function(req, res){
    try{
let urlCode = req.params.urlCode

let getData = await urlModel.findOne({urlCode: urlCode})
if(!getData) return res.status(400).send({status: false, message: 'no url found'})
return res.status(302).redirect(getData.longUrl)

    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}

module.exports = { createUrl, getUrl }