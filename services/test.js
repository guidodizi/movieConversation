const { setTimeout } = require('timers');

const constants = require('../constants');
const serviceResponseTemplate = require('./serviceResponseTemplate');


let response = { attachment: { type: "template", payload: { elements: [] } } };
response.attachment.payload.template_type = "generic";
response.attachment.payload.image_aspect_ratio = "horizontal";

//Generate elements depending on what string Watson gave on context.payload.data    
for (var template_data in constants.templates) {
    if (constants.templates[template_data] == "GENERIC_TEMPLATE_MOVIES") {
        serviceResponseTemplate[constants.templates[template_data]](1, response, {data:{date:'2018-03-19'}}).catch((err) => console.log(err));
    }
}

// setTimeout(() => {
//     console.log(response)
// },5000)