"use strict";

// Imports dependencies
const Response = require("./response"),
  i18n = require("../i18n.config"),
  config = require("./config");

module.exports = class Order {
  static handlePayload(payload) {
    let response;

    switch (payload) {
        console.log("switching to directions...")
        case "Add to cart":
            console.log("switching to directions...")
        response = 
          Response.genQuickReply(i18n.__("directions.received"), [{
              title: i18n.__("curation.directions"),
              payload: "CLOSEST_DELI"
            },
            {
              title: i18n.__("curation.sales"),
              payload: "CARE_SALES"
            }
          ])
        

        break;
      case "CLOSEST_DELI":
        response = Response.genPostbackButton(
          i18n.__("curation.show"),
          "CURATION_OTHER_STYLE"
        )
        break;
      case "TRACK_ORDER":
        response = Response.genQuickReply(i18n.__("order.prompt"), [
          {
            title: i18n.__("order.account"),
            payload: "LINK_ORDER"
          },
          {
            title: i18n.__("order.search"),
            payload: "SEARCH_ORDER"
          },
          {
            title: i18n.__("menu.help"),
            payload: "CARE_ORDER"
          }
        ]);
        break;

      case "SEARCH_ORDER":
        response = Response.genText(i18n.__("order.number"));
        break;

      case "ORDER_NUMBER":
        response = Response.genImageTemplate(
          `${config.appUrl}/order.png`,
          i18n.__("order.status")
        );
        break;

      case "LINK_ORDER":
        response = [
          Response.genText(i18n.__("order.dialog")),
          Response.genText(i18n.__("order.searching")),
          Response.genImageTemplate(
            `${config.appUrl}/order.png`,
            i18n.__("order.status")
          )
        ];
        break;
    }

    return response;
  }
};