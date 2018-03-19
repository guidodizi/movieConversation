
const constants = require('../constants');
const serviceResponseTemplate = require('./serviceResponseTemplate');
const serviceResponseQuickReplies = require('./serviceResponseQuickReplies');
const { getUserContext } = require('../database/userContext');
const { sendAPI } = require('./serviceSendAPI');

/*
* Handle the response to what the user said, based on Waton's response. 
* We end up responding the user on Facebook messenger with a coherent response.
* The response to user is based on Watson context, specifically on context.message_type
* template: respond user with a template
* quick_replies: respond user with quick replies options
* text: simply reply with the text Watson gave
*
*/
module.exports = function handleResponse(sender_psid, text_response, message_type, payload) {

    console.log('TEXT RESPONSE: ' + text_response)
    switch (message_type) {
        case "template": {
            handleTemplateResponse(sender_psid, text_response, payload);
            break;
        }
        case "quick_replies": {
            handelQuickRepliesResponse(sender_psid, text_response, payload);
            break;
        }
        case "dont_show": {
            //used when a response is just jumping to another and doesnt need to display anything
            break;
        }
        default: {
            // Directly respond to user
            sendAPI(sender_psid, { text: text_response }).catch((err) => { console.log(err); });
            break;
        }
    }
}

// MOVIE MAIN PROCESS: date -> movie -> place
// MOVIE MAIN PROCESS*: date -> place -> movie 
/*
* Handle responses which are template-based, in which we dont simply reply a text, but a generic/list/.. template
* This templates are based on Facebook Messenger's possibilities
* Watson sets the metadata for the template on context:
*   template type: context.payload.template_type
*   image aspect ratio: context.payload.image_aspect_ratio
*   data to put on template: context.payload.data
*
*/
function handleTemplateResponse(sender_psid, text_response, payload) {

    //Base response for templates
    let response = { attachment: { type: "template", payload: { elements: [] } } };

    response.attachment.payload.template_type = payload.template_type || "generic";
    response.attachment.payload.image_aspect_ratio = payload.image_aspect_ratio || "horizontal";

    for (var template_data in constants.templates) {
        //Generate elements depending on what string Watson gave on context.payload.data    
        if (constants.templates[template_data] === payload.data) {
            serviceResponseTemplate[constants.templates[template_data]](sender_psid, response).catch((err) => console.log(err));
        }
    }
}
/*
* Handle responses which we offer Quick Replies. 
* Data for specifically what quick reply is given to user is set on Watson
* data for quick replies:  context.payload.data
*
*/
function handelQuickRepliesResponse(sender_psid, text_response, payload) {

    let response = { text: text_response, quick_replies: [] };

    //Generate elements depending on what string Watson gave on context.payload.data    
    for (var quickReplies_data in constants.quickReplies) {
        //Generate elements depending on what string Watson gave on context.payload.data    
        if (constants.quickReplies[quickReplies_data] === payload.data) {
            serviceResponseQuickReplies[constants.quickReplies[quickReplies_data]](sender_psid, response).catch((err) => console.log(err));
        }
    }
}


