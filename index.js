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
        res.sendFile('./public/options.html', {root: __dirname});
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