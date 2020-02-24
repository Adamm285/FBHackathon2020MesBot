/**
 * Copyright 2019-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger For Original Coast Clothing
 * https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing
 */

"use strict";

// Imports dependencies
const Response = require("./response"),
  config = require("./config"),
  i18n = require("../i18n.config");

module.exports = class Curation {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }

  handlePayload(payload) {
    let response;
    let outfit;

    switch (payload) {
      case "SUMMER_COUPON":
        response = [
          Response.genText(
            i18n.__("leadgen.promo", {
              userFirstName: this.user.firstName
            })
          ),
          Response.genGenericTemplate(
            `${config.appUrl}/coupon.png`,
            i18n.__("leadgen.title"),
            i18n.__("leadgen.subtitle"),
            [Response.genPostbackButton(i18n.__("leadgen.apply"), "COUPON_50")]
          )
        ];
        break;

      case "COUPON_50":
        outfit = `${this.user.gender}-${this.randomOutfit()}`;

        response = [
          Response.genText(i18n.__("leadgen.coupon")),
          Response.genGenericTemplate(
            `${config.appUrl}/styles/${outfit}.jpg`,
            i18n.__("curation.title"),
            i18n.__("curation.subtitle"),
            [
              Response.genWebUrlButton(
                i18n.__("curation.shop"),
                
                `${config.shopUrl}/products/${outfit}`
              ),
              Response.genPostbackButton(
                i18n.__("curation.show"),
                "CURATION_OTHER_STYLE"
              ),
              Response.genPostbackButton(
                i18n.__("curation.sales"),
                "CARE_SALES"
              )
            ]
          )
        ];
        break;

      case "CURATION":
        response = Response.genQuickReply(i18n.__("curation.prompt"), [
          {
            title: i18n.__("curation.bread1"),
            payload: "CURATION_WHITE_BREAD"
          },
          {
            title: i18n.__("curation.bread2"),
            payload: "CURATION_WHEAT_BREAD"
          }
        ]);
        break;

      case "CURATION_WHITE_BREAD":
      case "CURATION_WHEAT_BREAD":
        response = Response.genQuickReply(i18n.__("curation.cheese"), [
          {
            title: i18n.__("curation.acheese"),
            payload: "CURATION_AMERICAN_CHEESE"
          },
          {
            title: i18n.__("curation.scheese"),
            payload: "CURATION_SWISS_CHEESE"
          },
          {
            title: i18n.__("curation.yamerican"),
            payload: "CURATION_YELLOW_AMERICAN_CHEESE"
          },
          {
            title: i18n.__("curation.sales"),
            payload: "CARE_SALES"
          }
        ]);
        break;

      case "CURATION_AMERICAN_CHEESE":
        // Store the user veggie preference here
        response = Response.genQuickReply(i18n.__("curation.veggies"), [
          {
            title: "lettuce",
            payload: "CURATION_LETTUCE"
          },
          {
            title: "tomatoes",
            payload: "CURATION_TOMATOES"
          },
          {
            title: "pickles",
            payload: "CURATION_PICKLES"
          }
        ]);
        break;

      case "CURATION_SWISS_CHEESE":
        // Store the user budget preference here
        response = Response.genQuickReply(i18n.__("curation.veggies"), [
          {
            title: "~ $20",
            payload: "CURATION_BUDGET_20_DINNER"
          },
          {
            title: "~ $30",
            payload: "CURATION_BUDGET_30_DINNER"
          },
          {
            title: "+ $50",
            payload: "CURATION_BUDGET_50_DINNER"
          }
        ]);
        break;

      case "CURATION_YELLOW_AMERICAN_CHEESE":
        // Store the user budget preference here
        response = Response.genQuickReply(i18n.__("curation.veggies"), [
          {
            title: "~ $20",
            payload: "CURATION_BUDGET_20_PARTY"
          },
          {
            title: "~ $30",
            payload: "CURATION_BUDGET_30_PARTY"
          },
          {
            title: "+ $50",
            payload: "CURATION_BUDGET_50_PARTY"
          }
        ]);
        break;

      case "CURATION_BUDGET_20_WORK":
      case "CURATION_BUDGET_30_WORK":
      case "CURATION_BUDGET_50_WORK":
      case "CURATION_BUDGET_20_DINNER":
      case "CURATION_BUDGET_30_DINNER":
      case "CURATION_BUDGET_50_DINNER":
      case "CURATION_BUDGET_20_PARTY":
      case "CURATION_BUDGET_30_PARTY":
      case "CURATION_BUDGET_50_PARTY":
        response = this.genCurationResponse(payload);
        break;

      case "CURATION_OTHER_STYLE":
        // Build the recommendation logic here
        outfit = `${this.user.gender}-${this.randomOutfit()}`;

        response = Response.genGenericTemplate(
          `${config.appUrl}/styles/${outfit}.jpg`,
          i18n.__("curation.title"),
          i18n.__("curation.subtitle"),
          [
            Response.genWebUrlButton(
              i18n.__("curation.shop"),
              `${config.shopUrl}/products/${outfit}`
            ),
            Response.genPostbackButton(
              i18n.__("curation.show"),
              "CURATION_OTHER_STYLE"
            )
          ]
        );
        break;
    }

    return response;
  }

  genCurationResponse(payload) {
    let occasion = payload.split("_")[3].toLowerCase();
    let budget = payload.split("_")[2].toLowerCase();
    let outfit = `${this.user.gender}-${occasion}`;

    let buttons = [
      Response.genWebUrlButton(
        i18n.__("curation.shop"),
        `${config.shopUrl}/products/${outfit}`
      ),
      Response.genPostbackButton(
        i18n.__("curation.show"),
        "CURATION_OTHER_STYLE"
      )
    ];

    if (budget === "50") {
      buttons.push(
        Response.genPostbackButton(i18n.__("curation.sales"), "CARE_SALES")
      );
    }

    let response = Response.genGenericTemplate(
      `${config.appUrl}/styles/${outfit}.jpg`,
      i18n.__("curation.title"),
      i18n.__("curation.subtitle"),
      buttons
    );

    return response;
  }

  randomOutfit() {
    let occasion = ["work", "party", "dinner"];
    let randomIndex = Math.floor(Math.random() * occasion.length);

    return occasion[randomIndex];
  }
};
