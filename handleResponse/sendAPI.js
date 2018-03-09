const request = require('request');
const { setTimeout } = require('timers');
/*
* Sends response messages via the Send API to Facebook
*
*/
exports.callSendAPI = function(sender_psid, body, callback) {    
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });

}

/*
 * Respond to user on messenger via Send API with the sense of typing or directly.
 * This function returns a Promise since sending a message to user is an async function.
 * On the other hand, when we use this function, we can await for the promise to resolve
 * and handle code synchronicly
 *
 */
exports.sendAPI = function (sender_psid, response, options = {}) {
    const { with_typing } = options;

    let request_body = { 
        recipient: { 
            id: sender_psid 
        }, 
        message: response
    };
    if (with_typing) {
        let typing_on_body = { 
            recipient: { 
                id: sender_psid 
            }, 
            sender_action: "typing_on"
        };
        //Start typing
        return new Promise( resolve => {
            callSendAPI(sender_psid, typing_on_body);
            setTimeout(() => {
                callSendAPI(sender_psid, request_body);
                resolve();
            }, 3000)
        })
    }
    else {
        return new Promise( resolve => {
            callSendAPI(sender_psid, request_body);
            resolve();        
        })
    }

}