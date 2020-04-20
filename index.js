require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const Nexmo = require('nexmo');

const nexmo = new Nexmo({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    applicationId: process.env.APPLICATION_ID,
    privateKey: process.env.PRIVATE_KEY
})

const app = express();

app.use(bodyParser.json({ type: "*/*"}));
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/webhooks/messages/inbound', (req, res) => {
    console.log(req.body);
    res.status(200).end();
});

app.post('/webhooks/messages/status', (req, res) => {
    console.log(req.body);
    res.status(200).end();
});

const senders = {
    messenger: {
        addressValue: process.env.SENDER_FB_ID,
        addressField: "id"
    },
    sms: {
        addressValue: process.env.SENDER_LVN,
        addressField: "number"
    }
};

function composeAddresses(type, to) {
    const sender = senders[type];
    if (!sender) {
        callback({error: "invalid message type"});
        return;
    }
    const fromAddr = { "type": type };
    fromAddr[sender.addressField] = sender.addressValue;
    const toAddr = { "type": type };
    toAddr[sender.addressField] = to;
    return { from: fromAddr, to: toAddr };
}

function send(type, to, content, callback) {
    const addresses = composeAddresses(type, to);
    nexmo.channel.send(
        addresses.to,
        addresses.from,
        { content: content },
        callback
    );
}

app.post('/api/messages', (req, res) => {
    const body = req.body;
    const type = body.type;
    const to = body.to;
    const content = body.content;
    send(
        type,
        to,
        content,
        (err, result) => {
            if (err) {
                console.error("Error sending message:", err.body ? err.body : err);
                res.status(500).json(err).end();
            } else {
                console.log("Message send result:", result);
                res.status(200).json({"result":"ok"}).end();
            }
        }
    );
});

app.post('/api/dispatch', (req, res) => {
    const body = req.body;
    const text = body.text;
    const imageUrl = body["image_url"];
    const smsAddresses = composeAddresses("sms", body.to);
    const fbAddresses = composeAddresses("messenger", body.fallback);
    nexmo.dispatch.create(
        "failover",
        [
            {
                from: smsAddresses.from,
                to: smsAddresses.to,
                message: {
                    content: {
                        type: "text",
                        text: text
                    }
                },
                failover: {
                    expiry_time: 180,
                    condition_status: "delivered"
                }
            },
            {
                from: fbAddresses.from,
                to: fbAddresses.to,
                message: {
                    content: {
                        type: "image",
                        image: {
                            url: imageUrl
                        }
                    }
                }
            }
        ],
        (err, result) => {
            if (err) {
                console.error("Error creating dispatch:", err.body ? err.body : err);
                res.status(500).json(err).end();
            } else {
                console.log("Dispatch create result:", result);
                res.status(200).json({"result":"ok"}).end();
            }
        }
    );
});

app.listen(3000)
console.log("Accepting API calls at http://localhost:3000/api")
