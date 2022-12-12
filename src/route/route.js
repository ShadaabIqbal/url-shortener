const express = require('express')
const router = express.Router()
const urlController = require('../urlController/urlController')


router.post('/url/shorten', urlController.createUrl)


module.exports = router