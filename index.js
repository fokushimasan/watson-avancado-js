const port = 3000;

const express = require('express');
const bodyParser = require('body-parser');
const watson = require('watson-developer-cloud');

const watsonAuth = require('./watson-auth');

const app = express();
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

// variáveis de fonte desconhecida

const sabores = {
    Calabreza: {
        valor: 15
    },
    Mussarela: {
        valor: 10
    }
};

const tempo_entrega = '30 minutos';

const assistant = new watson.AssistantV1({
    username: watsonAuth.username,
    password: watsonAuth.password,
    url: 'https://gateway.watsonplatform.net/assistant/api/',
    version: '2018-02-16'
});

app.get('/', function (req, res) {
    return res.sendFile('./public/index.html');
});

app.post('/dialog', (req, res) => {
    const { message, context } = req.body;

    assistant.message(
        {
            input: { text: message },
            workspace_id: watsonAuth.workspace_id,
            context
        },
        function (err, response) {
            if (err) {
                console.error(err);
            } else {
                if (response.intents || response.intents[0].intent == 'pedido') {
                    response.output.text.forEach((value, key) => {
                        const { context } = response;

                        if (context.quantidade && context.pizza) {

                            const valor = context.quantidade * sabores[context.pizza].valor;
                            const troco = context.troco ? `${context.troco - valor} de troco` : '';

                            response.output.text[key] = value.replace(
                                '{ valor }.',
                                `${valor} reais ${troco}`
                            );

                            if ((context.troco) && (context.troco - valor < 0)) {
                                response.output.text = ['Eu não posso mandar esse pedido! Você não tem dinheiro suficiente'];
                            }
                        }
                    });

                    response.output.text.forEach((value, key) => {
                        response.output.text[key] = value.replace('{ tempo_entrega }', tempo_entrega);
                    });
                }
                return res.json(response)
            }
        }
    );
});

app.listen(port, () => console.log(`Running on port ${port}`));