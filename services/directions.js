"use strict";

// Imports dependencies
const Response = require("./response"),
    i18n = require("../i18n.config"),
    config = require("./config");
// turns out you directions has been depercated
module.exports = class Directions {
    static handlePayload(payload) {
        let response;
        console.log("switching to directions...", payload);
        switch (payload) {
            case payload:
                console.log("switched to directions...")
                response =
                    Response.genQuickReply(i18n.__("directions.received"), [{
                            title: i18n.__("curation.directions"),
                            payload: "CLOSEST_DELI"
                        },
                        {
                            title: i18n.__("curation.sales"),
                            payload: "CARE_SALES"
                        }
                    ]);

                break;
                // 
            case "CLOSEST_DELI":
                response = Response.genPostbackButton(
                    i18n.__("curation.show"),
                    "CURATION_OTHER_STYLE"
                )
                break;
                // 
        };
        return response;
    };
};