'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Conversation = require('watson-developer-cloud/conversation/v1');
const database = require('./database');
const handleResponse = require('./handleResponse');
const userContext = require('./userContext');


const app = express();
app.use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
const port = process.env.PORT || 1337;
app.listen(port, () => console.log('webhook is listening on: ' + port));

//Create Watson conversation
var conversation = new Conversation({
  username: process.env.WATSON_USERNAME,
  password: process.env.WATSON_PASSWORD,
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2018-02-16'
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  let VERIFY_TOKEN = "MOVIE";
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  if (mode && token) {
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

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {
  console.log('WEBHOOK_POST_STARTED');
  let body = req.body;
  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  // Check if the message contains text
  let user_response = received_message.text;
  if (received_message.quick_reply) { 
    user_response = received_message.quick_reply.payload 
  }

  console.log('IM SAYING TO WATSON ' + user_response)
  conversation.message(
    {
      input: { text: user_response },
      context: userContext.getUserContext(sender_psid),
      workspace_id: process.env.WORKSPACE_ID
    },
    function (err, watsonResponse) {
      if (err) {
        console.error(err);
      } else {
        //Save user context
        userContext.updateUserContext(sender_psid, watsonResponse.context);
        console.log("WATSON RESPONSE @!@!@")
        console.log(watsonResponse)
        watsonResponse.output.text.forEach( text_response => {
          //Generate response from Watson and send it          
          callSendAPI(sender_psid, handleResponse(sender_psid, watsonResponse.context, text_response));
        })
      }
    }
  );
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  // Get the payload for the postback
  const text_response = received_postback.payload;
  conversation.message(
    {
      input: { text: text_response },
      context: userContext.getUserContext(sender_psid),
      workspace_id: process.env.WORKSPACE_ID
    },
    function (err, watsonResponse) {
      if (err) {
        console.error(err);
      } else {
        //Save user context
        userContext.updateUserContext(sender_psid, watsonResponse.context);
        console.log("WATSON RESPONSE @!@!@")
        console.log(watsonResponse)
        watsonResponse.output.text.forEach( text_response => {
          //Generate response from Watson and send it          
          callSendAPI(sender_psid, handleResponse(sender_psid, watsonResponse.context, text_response));
        })
      }
    }
  );
}


// Sends response messages via the Send API
function callSendAPI(sender_psid, response, callback) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
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


//HANDLE USER INPUT OF ATTACHMENTS
// else if (received_message.attachments) {
  //   // Gets the URL of the message attachment
  //   let attachment_url = received_message.attachments[0].payload.url;
  //   response = {
  //     "attachment": {
  //       "type": "template",
  //       "payload": {
  //         "template_type": "generic",
  //         "elements": [{
  //           "title": "Is this the right picture?",
  //           "subtitle": "Tap a button to answer.",
  //           "image_url": attachment_url,
  //           "buttons": [
  //             {
  //               "type": "postback",
  //               "title": "Yes!",
  //               "payload": "yes",
  //             },
  //             {
  //               "type": "postback",
  //               "title": "No!",
  //               "payload": "no",
  //             }
  //           ],
  //         }]
  //       }
  //     }
  //   }
  //}     