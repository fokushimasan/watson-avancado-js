const port = 3000

const express = require('express')
const bodyParser = require('body-parser')
const watson = require('watson-developer-cloud')

const watsonAuth = require('./watson-auth')

const app = express()
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'))

const assistent = new watson.AssistantV1({
    username: watsonAuth.username,
    password: watsonAuth.password,
    url: 'https://gateway.watsonplatform.net/assistant/api/',
    version: '2018-02-16'
})

app.get('/', (req, res) => {
    return res.sendFile('./public/index.html')
} )

app.post('/dialog', (req, res) => {
    const { message, context } = req.body

    assistent.message(
        {
            input: { text: message },
            workspace_id: watsonAuth.workspace_id,
            context
        },
        function (error, response) {
            if (error) {
                console.error(error)
            } else {
                const { output } = response
                return res.json(response)
            }
        }
    )
})

app.listen(port, () => console.log(`Running on port ${port}`))