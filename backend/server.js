const express = require('express')

const app = express()

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', 'YOUR-DOMAIN.TLD') // update to match the domain you will make the request from
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	)
	next()
})

app.get('/', (req, res) => {
	res.send('API is running')
})

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})

app.listen(5000, console.log('Server running on port 5000'))
