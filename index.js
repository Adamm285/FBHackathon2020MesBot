'use strict';

// Imports dependencies and set up http server
const
    express = require('express'),
    bodyParser = require('body-parser'),
    path = require("path"),

    app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening!'));
// Creates the endpoint for our webhook 
app.use(express.static(path.join(path.resolve(), "public")));

app.set("view engine", "ejs");

app.get("/", function (_req, res) {
    res.sendFile(path.join(__dirname, "./public/index.html"));
});

// Respond with index file when a GET request is made to the homepage
app.get('/options', (req, res, next) => {
    // let referer = req.get('Referer');
    // if (referer) {
    //     if (referer.indexOf('www.messenger.com') >= 0) {
    //         res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
    //     } else if (referer.indexOf('www.facebook.com') >= 0) {
    //         res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
    //     }
    res.sendFile('./public/options.html', {
        root: __dirname
    });
    // }
});

// Handle postback from webview
app.get('/optionspostback', (req, res) => {
    let body = req.query;
    let response = {
        "text": `Great, I will book you a ${body.bed} bed, with ${body.pillows} pillows and a ${body.view} view.`
    };

    res.status(200).send('Please close this window to return to the conversation thread.');
    callSendAPI(body.psid, response);
});
app.get("/profile", (req, res) => {
    let token = req.query["verify_token"];
    let mode = req.query["mode"];

    if (!config.webhookUrl.startsWith("https://")) {
        res.status(200).send("ERROR - Need a proper API_URL in the .env file");
    }
    var Profile = require("./services/profile.js");
    Profile = new Profile();

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        if (token === config.verifyToken) {
            if (mode == "webhook" || mode == "all") {
                Profile.setWebhook();
                res.write(
                    `<p>Set app ${config.appId} call to ${config.webhookUrl}</p>`
                );
            }
            if (mode == "profile" || mode == "all") {
                Profile.setThread();
                res.write(`<p>Set Messenger Profile of Page ${config.pageId}</p>`);
            }
            if (mode == "personas" || mode == "all") {
                Profile.setPersonas();
                res.write(`<p>Set Personas for ${config.appId}</p>`);
                res.write(
                    "<p>To persist the personas, add the following variables \
            to your environment variables:</p>"
                );
                res.write("<ul>");
                res.write(`<li>PERSONA_BILLING = ${config.personaBilling.id}</li>`);
                res.write(`<li>PERSONA_CARE = ${config.personaCare.id}</li>`);
                res.write(`<li>PERSONA_ORDER = ${config.personaOrder.id}</li>`);
                res.write(`<li>PERSONA_SALES = ${config.personaSales.id}</li>`);
                res.write("</ul>");
            }
            if (mode == "nlp" || mode == "all") {
                GraphAPi.callNLPConfigsAPI();
                res.write(`<p>Enable Built-in NLP for Page ${config.pageId}</p>`);
            }
            if (mode == "domains" || mode == "all") {
                Profile.setWhitelistedDomains();
                res.write(`<p>Whitelisting domains: ${config.whitelistedDomains}</p>`);
            }
            if (mode == "private-reply") {
                Profile.setPageFeedWebhook();
                res.write(`<p>Set Page Feed Webhook for Private Replies.</p>`);
            }
            res.status(200).end();
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    } else {
        // Returns a '404 Not Found' if mode or token are missing
        res.sendStatus(404);
    }
});
// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});
// 
// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});