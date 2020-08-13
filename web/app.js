const express = require('express')
const app = express()
const pgp = require('pg-promise')(/*options*/)
const db_host = process.env.DB_HOST || 'localhost'
const db_user = process.env.DB_USER || 'superuser'
const db_password = process.env.DB_PASSWORD || 'root'
const db_port = process.env.DB_PORT || '5432'
const db = pgp(`postgres://${db_user}:${db_password}@${db_host}:${db_port}/postgres`)
const port = process.env.WEB_PORT || 4000
const host = process.env.WEB_HOST || 'localhost'

//TODO: установить перехватчик для логирования запросов
app.use('/', express.static(__dirname + '/public'))
app.use('/api', express.json({ 'limit': '10mb' }))
app.route('/api/product')
    .get((request, response) => {
        db.query('SELECT * FROM product ORDER BY id DESC')
            .then((data) => {
                console.log("DATA:", JSON.stringify(data))
                response.send(`{"data": ${JSON.stringify(data)}}`)
            })
            .catch((error) => {
                console.log("ERROR:", error)
                res.send(`{"data": ${error}}`)
            })
    })
    .post((request, response) => {
        const newProduct = request.body
        console.log(`{data: ${JSON.stringify(newProduct)}}`)
        db.none(`INSERT INTO product (title, description, price, quantity, image) VALUES ('${newProduct.title}', '${newProduct.description}', '${newProduct.price == 0 ? 0.00 : newProduct.price}', '${newProduct.quantity == 0 ? 0 : newProduct.quantity}', '${newProduct.image}')`)
            .then((data) => {
                response.status(201).json({ "message": "a new product was created" })
            })
            .catch((error) => {
                console.log("ERROR:", error)
                response.status(500).json({ "error": error })
            })
    })
app.delete('/api/product/:id', (request, response) => {
    db.none(`DELETE FROM public.product WHERE id = ${request.params.id}`)
        .then(() => {
            response.status(204).send()
        })
        .catch((error) => {
            response.status(502).json({"error":error})
        })
})

app.listen(port, host, ()=>{
    console.log(`web application running on http://${host}:${port}`)
})
