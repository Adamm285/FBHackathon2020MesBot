// 
'use strict';
// 
// Imports dependencies and set up http server
const
Directions = require("./services/directions"),
  Response = require("./services/response"),
  express = require('express'),
  request = require('request'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  path = require('path'),
  Receive = require("./services/receive"),
  GraphAPi = require("./services/graph-api"),
  User = require("./services/user"),
  config = require("./services/config"),
  i18n = require("./i18n.config"),
  Sub = require("./services/orderid"),
  db = config.MONGODB_URI,

  app = express().use(bodyParser.json()); // creates express http server
var users = {};
console.log(db);

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening!'));
// Creates the endpoint for our webhook 
app.use(express.static("public"));
console.log(express.static("public"))
// 
app.set("view engine", "ejs");
// Database Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/subdb")

// Homepage
app.get("/", function (_req, res) {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});
// Build Profile - webhook
app.get("/profile", (req, res) => {
  let token = req.query["verify_token"];
  let mode = req.query["mode"];
  //
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
// 
// Creates the endpoint for our webhook 
app.post("/webhook", (req, res) => {
  let body = req.body;
  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      if ("changes" in entry) {
        // Handle Page Changes event
        let receiveMessage = new Receive();
        if (entry.changes[0].field === "feed") {
          let change = entry.changes[0].value;
          switch (change.item) {
            case "post":
              return receiveMessage.handlePrivateReply(
                "post_id",
                change.post_id
              );
              break;
            case "comment":
              return receiveMessage.handlePrivateReply(
                "comment_id",
                change.comment_id
              );
              break;
            default:
              console.log('Unsupported feed change type.');
              return;
          }
        }
      }
      // 
      // Gets the body of the webhook event
      let webhookEvent = entry.messaging[0];
      // console.log(webhookEvent);
      // 
      // Discard uninteresting events
      if ("read" in webhookEvent) {
        // console.log("Got a read event");
        return;
      }
      // 
      if ("delivery" in webhookEvent) {
        // console.log("Got a delivery event");
        return;
      }
      // 
      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      // 
      if (!(senderPsid in users)) {
        let user = new User(senderPsid);
        // 
        GraphAPi.getUserProfile(senderPsid)
          .then(userProfile => {
            user.setProfile(userProfile);
          })
          .catch(error => {
            // The profile is unavailable
            console.log("Profile is unavailable:", error);
          })
          .finally(() => {
            users[senderPsid] = user;
            i18n.setLocale(user.locale);
            console.log(
              "New Profile PSID:",
              senderPsid,
              "with locale:",
              i18n.getLocale()
            );
            let receiveMessage = new Receive(users[senderPsid], webhookEvent);
            return receiveMessage.handleMessage();
          });
      } else {
        i18n.setLocale(users[senderPsid].locale);
        console.log(
          "Profile already exists PSID:",
          senderPsid,
          "with locale:",
          i18n.getLocale()
        );
        let receiveMessage = new Receive(users[senderPsid], webhookEvent);
        return receiveMessage.handleMessage();
      }
    });
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});
// 
// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  // 
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = config.VERIFY_TOKEN
  // 
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // 
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // 
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
      // 
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
// 
// Respond with index file when a GET request is made to the homepage
app.get('/options', (req, res, next) => {
  res.sendFile('./public/options.html', {
    root: __dirname
  });
  // }
});
// 
// Handle postback from webview
app.get('/optionspostback', (req, res, response) => {
  let body = req.query;
  let responseFinal = {
    "text": `Great, I will build you a ${body.meats} sub, with ${body.topping}, ${body.combo} and ${body.heating}.`,
  };
  let options = {
    "meats": body.meats,
    "toppings": body.toppings,
    "combo": body.combo,
    "heating": body.heating
  };

  // Data for table in db
  Sub.create({
    response: responseFinal.text,
    meats: options.meats,
    toppings: options.toppings,
    combo: options.combo,
    heating: options.heating,
    payload: "payload",
  }).then((data) => {
    res.status(200).send('Please close this window to return to the conversation thread.');
    console.log("bring in ...", data)
    subCreate(body.psid, responseFinal, response);
  })
});
// 
// Sends response messages via the Send API
function subCreate(sender_psid, response) {
  // 
  var Response = require("./services/response.js");
  Response = new Response();
  var Curation = require("./services/curation.js");
  Curation = new Curation();
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  };
  console.log("_________!");
  console.log(request_body);
  console.log("_________!");
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {
      "access_token": config.pageAccesToken
    },
    "method": "POST",
    "json": request_body
  }, (err, response, body, payload) => {
    if (!err) {
      console.log("Body is...", body)
      console.log(request_body.message.text.replace(/[^\w\s]/gi, '').trim().toLowerCase());
      switch (request_body.message.text.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
        case request_body.message.text.replace(/[^\w\s]/gi, '').trim().toLowerCase():
          payload = body
          console.log("----------------!");
          response = Directions.handlePayload(payload);
          console.log("----------------!");
          break;
        default:
          console.log("hello world");
          console.log(request_body.message.text);
          [
            {
              "text": `You sent the message: ${request_body.message.text}.`
            },
          ]
          break;
      }
    } else {
      console.error("Unable to send message index.js:" + err);
    }
  });
}
//