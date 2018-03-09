require('dotenv').config();
const request = require('request');

/*
* Get User first name
*
*/
function getFirstName(sender_psid) {    
  // Send the HTTP request to the Messenger Platform
  request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN, "fields": "first_name" },
      "method": "GET",
  }, (err, res, body) => {
      if (!err) {
          console.log('message sent!')
          console.log(body);
      } else {
          console.error("Unable to send message:" + err);
      }
  });

}

getFirstName(1407446849384650);