const moment = require('moment-timezone');
const database = require('../database');
const userContext = require('../userContext');
const constants = require('../constants');
const templateResponse = require('./templateResponse');
const quickRepliesResponse = require('./quickRepliesResponse');
const { sendAPI, callSendAPI } = require('./sendAPI');

/*
* Handle the response to what the user said, based on Waton's response. 
* We end up responding the user on Facebook messenger with a coherent response.
* The response to user is based on Watson context, specifically on context.message_type
* template: respond user with a template
* quick_replies: respond user with quick replies options
* text: simply reply with the text Watson gave
*
*/
module.exports = function handleResponse(sender_psid, context, text_response) {
    const message_type = context.message_type;

    console.log('CONTEXT: ' + JSON.stringify(context, null))
    console.log('TEXT RESPONSE: ' + text_response)
    switch (message_type) {
        case "template": {
            handleTemplateResponse(sender_psid, text_response, context);
            break;
        }
        case "quick_replies": {
            handelQuickRepliesResponse(sender_psid, text_response, context);
            break;
        }
        default: {
            // Directly respond to user
            sendAPI(sender_psid, { text: text_response });
            break;
        }
    }
}

// MOVIE MAIN PROCESS: date -> movie -> place
/*
* Handle responses which are template-based, in which we dont simply reply a text, but a generic/list/.. template
* This templates are based on Facebook Messenger's possibilities
* Watson sets the metadata for the template on context:
*   template type: context.payload.template_type
*   image aspect ratio: context.payload.image_aspect_ratio
*   data to put on template: context.payload.data
*
*/
function handleTemplateResponse(sender_psid, text_response, context) {
    const watson_payload = context.payload;

    //Base response for templates
    let response = { attachment: { type: "template", payload: { elements: [] } } };
    response.attachment.payload.template_type = watson_payload.template_type || "generic";
    response.attachment.payload.image_aspect_ratio = watson_payload.image_aspect_ratio || "horizontal";

    //Generate elements depending on what string Watson gave on context.payload.data
    switch (watson_payload.data) {
        case constants.GENERIC_TEMPLATE_MOVIES: {
            templateResponse[constants.GENERIC_TEMPLATE_MOVIES](sender_psid, response, context);
            break;
        }
        case constants.GENERIC_TEMPLATE_MOVIES_GENRE: {
            templateResponse[constants.GENERIC_TEMPLATE_MOVIES_GENRE](sender_psid, response, context);            
            break;
        }
        case constants.GENERIC_TEMPLATE_MOVIES_GENRE_PLACE: {
            templateResponse[constants.GENERIC_TEMPLATE_MOVIES_GENRE_PLACE](sender_psid, response, context);                        
            break;
        }
        case constants.GENERIC_TEMPLATE_SCHEDULE: {
            templateResponse[constants.GENERIC_TEMPLATE_SCHEDULE](sender_psid, response, context);                                    
            break;
        }
    }
}
/*
* Handle responses which we offer Quick Replies. 
* Data for specifically what quick reply is given to user is set on Watson
* data for quick replies:  context.payload.data
*
*/
function handelQuickRepliesResponse(sender_psid, text_response, context) {
    const watson_payload = context.payload;
    let response = { text: text_response, quick_replies: [] };

    switch (watson_payload.data) {
        case constants.QUICK_REPLIES_LOCATIONS: {
            quickRepliesResponse[constants.QUICK_REPLIES_LOCATIONS](sender_psid, response, context)
            break;
        };
        case constants.QUICK_REPLIES_DATE: {
            quickRepliesResponse[constants.QUICK_REPLIES_DATE](sender_psid, response, context)            
            break;
        }
        case constants.QUICK_REPLIES_DATE_PLACE: {
            quickRepliesResponse[constants.QUICK_REPLIES_DATE_PLACE](sender_psid, response, context)            
            break;
        }
    };
}


