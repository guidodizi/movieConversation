'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Conversation = require('watson-developer-cloud/conversation/v1');
const database = require('./database');
const handleResponse = require('./handleResponse/handleResponse');
const userContext = require('./userContext');


const app = express();
app.use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
const port = process.env.PORT || 1337;
app.listen(port, () => console.log('webhook is listening on: ' + port));

/*
* Create Watson conversation
*
*/
var conversation = new Conversation({
  username: process.env.WATSON_USERNAME,
  password: process.env.WATSON_PASSWORD,
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2018-02-16'
});

/*
* Adds support for GET requests to our webhook
*
*/
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

/*
* Endpoint for receiving POST requests with messeges
*
*/
app.post('/webhook', (req, res) => {
  console.log('WEBHOOK_POST_STARTED');
  let body = req.body;
  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      
      //Iterate over messaging events
      entry.messaging.forEach(messagingEvent => {
        if (messagingEvent.message) {
          handleMessage(webhook_event);
        } else if (messagingEvent.postback) {
          handlePostback(webhook_event);
        }
      })
    });
    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

/*
* Handles messages events
*
*/
function handleMessage(event) {
  const sender_psid = event.sender.id;
  const message = event.message;
  console.log("Received message for user %d with message:",
  sender_psid );
  console.log(JSON.stringify(message));

  let messageText = message.text;
  // if message came with quick_reply, text is on payload
  if (message.quick_reply) { 
    messageText = message.quick_reply.payload 
  }

  conversation.message(
    {
      input: { text: messageText },
      context: userContext.getUserContext(sender_psid),
      workspace_id: process.env.WORKSPACE_ID
    },
    function (err, watsonResponse) {
      if (err) {
        console.error(err);
      } else {
        //Save user context
        userContext.updateUserContext(sender_psid, watsonResponse.context);
        console.log("WATSON RESPONSE " + JSON.stringify(watsonResponse))

        //Iterate over Watson Response, procesing each one
        watsonResponse.output.text.forEach( text_response => {
          //Generate response from Watson and send it          
          handleResponse(sender_psid, watsonResponse.context, text_response);
        })
      }
    }
  );
}

// Handles messaging_postbacks events
function handlePostback(event) {
  const sender_psid = event.sender.id;
  const payload = event.postback.payload;

  conversation.message(
    {
      input: { text: payload },
      context: userContext.getUserContext(sender_psid),
      workspace_id: process.env.WORKSPACE_ID
    },
    function (err, watsonResponse) {
      if (err) {
        console.error(err);
      } else {
        //Save user context
        userContext.updateUserContext(sender_psid, watsonResponse.context);
        console.log("WATSON RESPONSE " + JSON.stringify(watsonResponse))

        //Iterate over Watson Response, procesing each one        
        watsonResponse.output.text.forEach( text_response => {
          //Generate response from Watson and send it          
          handleResponse(sender_psid, watsonResponse.context, text_response);
        })
      }
    }
  );
}


