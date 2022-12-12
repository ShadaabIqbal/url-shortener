const urlModel =  require('../urlModel/urlModel')
const axios = require('axios')
const shortid = require('shortid')

const createUrl = async function(req, res){

try{
    const { longUrl } = req.body
    if(!longUrl) return res.status(400).send({status: false, message: 'Url not present'})
    //validation for Url
    let correctLink
    await axios.get(longUrl)
    .then(() => {correctLink = true})
    .catch(() => {correctLink = false})
    if(correctLink === false) return res.status(400).send({status: false, message: 'Invalid Url'})

    let obj = {longUrl: longUrl}
    let urlCode = shortid.generate()
    obj.urlCode = urlCode
    return res.status(201).send({status: true, message: obj})

}catch(error){
return res.status(500).send({status: false, message: error.message})
}




}

module.exports = {createUrl}