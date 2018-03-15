const request = require('request');
const { setTimeout } = require('timers');
/*
* Sends response messages via the Send API to Facebook
*
*/
function callSendAPI(sender_psid, body, resolve, reject) {    
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
            if (resolve) 
                resolve();
        } else {
            console.error("Unable to send message:" + err);
            if (reject)
                reject();
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
function sendAPI(sender_psid, response, options = {}) {
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
        return new Promise( (resolve, reject) => {
            callSendAPI(sender_psid, typing_on_body);
            setTimeout(() => {
                callSendAPI(sender_psid, request_body, resolve, reject);
            }, 1500)
        })
    }
    else {
        return new Promise( (resolve, reject) => {
            callSendAPI(sender_psid, request_body, resolve, reject);
        })
    }
}

exports.sendAPI = sendAPI;