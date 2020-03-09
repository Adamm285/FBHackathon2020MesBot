/**
 * Copyright 2019-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger For Original Coast Clothing
 * https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing
 */
// Oh wow, here have been the answers I have been looking for the whole time, oppps;
"use strict";

const i18n = require("../i18n.config");

module.exports = class Response {

  // Sends response messages via the Send API
  static callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    };
    console.log(request_body);
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": {
        "access_token": PAGE_ACCESS_TOKEN
      },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    });
  }
  // 
  static genQuickReply(text, quickReplies) {
    let response = {
      text: text,
      quick_replies: []
    };

    for (let quickReply of quickReplies) {
      response["quick_replies"].push({
        content_type: "text",
        title: quickReply["title"],
        payload: quickReply["payload"]
      });
    }

    return response;
  }

  static genGenericTemplate(image_url, title, subtitle, buttons) {
    let response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: title,
            subtitle: subtitle,
            image_url: image_url,
            buttons: buttons
          }]
        }
      }
    };

    return response;
  }

  static genImageTemplate(image_url, title, subtitle = "") {
    let response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: title,
            subtitle: subtitle,
            image_url: image_url
          }]
        }
      }
    };

    return response;
  }

  static genButtonTemplate(title, buttons) {
    let response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: title,
          buttons: buttons
        }
      }
    };

    return response;
  }

  static genText(text) {
    let response = {
      text: text
    };

    return response;
  }

  static genTextWithPersona(text, persona_id) {
    let response = {
      text: text,
      persona_id: persona_id
    };

    return response;
  }

  static genPostbackButton(title, payload) {
    let response = {
      type: "postback",
      title: title,
      payload: payload
    };

    return response;
  }

  static genWebUrlButton(title, url) {
    let response = {
      type: "web_url",
      title: title,
      url: url,
      messenger_extensions: true
    };

    return response;
  }

  static genNuxMessage(user) {
    let welcome = this.genText(
      i18n.__("get_started.welcome", {
        userFirstName: user.firstName
      })
    );

    let guide = this.genText(i18n.__("get_started.guidance"));

    let curation = this.genQuickReply(i18n.__("get_started.help"), [{
        title: i18n.__("menu.suggestion"),
        payload: "CURATION"
      },
      {
        title: i18n.__("menu.help"),
        payload: "CARE_HELP"
      }
    ]);

    return [welcome, guide, curation];
  }
};