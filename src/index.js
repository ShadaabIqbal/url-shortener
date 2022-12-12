const express = require('express')
const app = express()
const mongoose = require('mongoose')
const route = require('./route/route')


app.use(express.json())

mongoose.connect('mongodb+srv://Aman_Mohadikar:V5FW1Y8X6b2pIiud@cluster0.gdww84s.mongodb.net/project-4', {useNewUrlParser: true}, mongoose.set('strictQuery', true))
.then(() => { console.log('MongoDB is connected')})
.catch((error) => {console.log(error)})

app.use('/', route)

app.listen(3000, function(){
    console.log('Express app running on port '+ 3000)
})