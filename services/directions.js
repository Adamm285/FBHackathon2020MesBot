"use strict";

// Imports dependencies
const Response = require("./response"),
    Recieve = require("./receive"),
    i18n = require("../i18n.config"),
    config = require("./config");
// turns out you directions has been depercated
module.exports = class Directions {
    static handlePayload(payload) {
        let response;
        console.log("switching to directions...", payload);
        switch (payload) {
            case payload:
                if (payload) {
                    let delayed = {
                        "text": `Great, I`
                    }
                    setTimeout((data) => {
                        console.log(delayed)
                        return response
                    }, 4000);
                    // res.status(200).send('Please close this window to return to the conversation thread.');
                    // console.log("bring in ...", data)
                    delayed.callSendAPI(payload);
                }
                break;
        }
        // 
        return response;
    };

};