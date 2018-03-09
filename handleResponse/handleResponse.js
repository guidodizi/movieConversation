const moment = require('moment-timezone');
const database = require('../database');
const userContext = require('../userContext');
const constants = require('../constants');
const templateResponse = require('./templateResponse');
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
async function handleTemplateResponse(sender_psid, text_response, context) {
    const watson_payload = context.payload;

    //Base response for templates
    let response = { attachment: { type: "template", payload: { elements: [] } } };
    response.attachment.payload.template_type = watson_payload.template_type || "generic";
    response.attachment.payload.image_aspect_ratio = watson_payload.image_aspect_ratio || "horizontal";

    //Generate elements depending on what string Watson gave on context.payload.data
    switch (watson_payload.data) {
        case "GENERIC_TEMPLATE_MOVIES": {
            // //Answer user that search has began
            // await sendAPI(sender_psid, { text: "Déjame mostrarte..." });

            // //ids of movies available for selected date
            // const id_movie_for_date = [];
            // database.schedules.contentCinemaShows.forEach(contentCinema => {
            //     //Find content for selected movie
            //     contentCinema.cinemaShows.forEach(cinemaShow => {
            //         //Check if cinemas is for selected place
            //         cinemaShow.shows.some(show => {
            //             //Check if show is for selected date
            //             var show_date = moment(show.date).dayOfYear();
            //             var user_date = moment(context.data.date).dayOfYear();
            //             if (show_date === user_date) {
            //                 id_movie_for_date.push(contentCinema.contentId)
            //                 //Exit iteration
            //                 return true;
            //             }
            //         });
            //     });

            // });
            // database.movies.forEach(movie => {
            //     if (id_movie_for_date.indexOf(movie.content.id) !== -1) {
            //         response.attachment.payload.elements.push({
            //             title: movie.content.title,
            //             subtitle: movie.content.synopsis,
            //             image_url: movie.content.posterUrl,
            //             buttons: [{
            //                 type: "postback",
            //                 title: "Elegir",
            //                 payload: movie.content.title
            //             }]

            //         })
            //     }
            // });
            // if (!response.attachment.payload.elements.length) {
            //     response = { text: `No encontré peliculas para ${context.data.date_synonym}. Recuerda que la cartelera cambia todos los jueves.` };
            //     userContext.updateUserContext(sender_psid, {});
            // }
            templateResponse[constants.GENERIC_TEMPLATE_MOVIES](sender_psid, response, context);
            break;
        }
        case "GENERIC_TEMPLATE_MOVIES_GENRE": {
            database.movies.forEach(movie => {
                //Example : ['comedia', 'accion']
                const movie_genres = movie.content.genre.split(', ').map(genre => genre.toLowerCase());
                if (movie_genres.indexOf(context.data.genre.toLowerCase()) !== -1) {
                    // Movie contains selected genre
                    response.attachment.payload.elements.push(
                        {
                            title: movie.content.title,
                            subtitle: movie.content.synopsis,
                            image_url: movie.content.posterUrl,
                            buttons: [
                                {
                                    type: "postback",
                                    title: "Elegir",
                                    payload: movie.content.title
                                }
                            ]

                        }
                    )
                }

            });
            break;
        }
        case "GENERIC_TEMPLATE_MOVIES_GENRE_PLACE": {
            database.movies.forEach(movie => {
                //Example : ['comedia', 'accion']
                const movie_genres = movie.content.genre.split(', ').map(genre => genre.toLowerCase());

                // Movie contains selected genre
                if (movie_genres.indexOf(context.data.genre.toLowerCase()) !== -1) {

                    movie.cinemasIds.forEach(cinema => {
                        //Movie is on selected place
                        if (cinema.name.toLowerCase() === context.data.place.toLowerCase()) {
                            response.attachment.payload.elements.push(
                                {
                                    title: movie.content.title,
                                    subtitle: movie.content.synopsis,
                                    image_url: movie.content.posterUrl,
                                    buttons: [
                                        {
                                            type: "postback",
                                            title: "Elegir",
                                            payload: movie.content.title
                                        }
                                    ]

                                }
                            )
                        }
                    })
                }

            });
            break;
        }
        case "GENERIC_TEMPLATE_SCHEDULE": {
            //Find id of selected movie
            const selected_movie = database.movies_id.find(movie => {
                return movie.title === context.data.movie;
            })
            database.schedules.contentCinemaShows.forEach(contentCinema => {
                //Find content for selected movie
                if (contentCinema.contentId === selected_movie.id) {
                    contentCinema.cinemaShows.forEach(cinemaShow => {
                        //Check if cinemas is for selected place
                        if (cinemaShow.cinema.name === context.data.place) {
                            cinemaShow.shows.forEach(show => {
                                //Check if show is for selected date
                                var show_date = moment(show.date).dayOfYear();
                                var user_date = moment(context.data.date).dayOfYear();
                                if (show_date === user_date) {
                                    response.attachment.payload.elements.push(
                                        {
                                            title: `Día: ${show.dateToDisplay}   Hora: ${show.timeToDisplay}`,
                                            subtitle: show.formatLang,
                                        }
                                    )
                                }
                            })
                        }
                    });

                }
            })
            if (!response.attachment.payload.elements.length) {
                response = { text: `No encontré horarios para ${context.data.date_synonym}. Recuerda que la cartelera cambia todos los jueves.` };
            }
            //End of dialog, clear context
            userContext.updateUserContext(sender_psid, {});

            break;
        }
    }
    /**
     * Response is now nurtured for user to receive it, send it to user
     */
    //console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))

    //await sendAPI(sender_psid, response, { with_typing: true })
}
/*
* Handle responses which we offer Quick Replies. 
* Data for specifically what quick reply is given to user is set on Watson
* data for quick replies:  context.payload.data
*
*/
async function handelQuickRepliesResponse(sender_psid, text_response, context) {
    const watson_payload = context.payload;
    let response = { text: text_response, quick_replies: [] };

    switch (watson_payload.data) {
        case "QUICK_REPLIES_LOCATIONS": {
            //Find id of selected movie
            const { id } = database.movies_id.find(movie => {
                return movie.title === context.data.movie;
            });
            database.schedules.contentCinemaShows.forEach(contentCinema => {
                //Find content for selected movie
                if (contentCinema.contentId === id) {
                    //Save on context the cinema options for selected movie
                    const data_to_change = {
                        cinemas: []
                    };
                    contentCinema.cinemaShows.forEach(cinemaShow => {
                        cinemaShow.shows.some(show => {
                            var show_date = moment(show.date).dayOfYear();
                            var user_date = moment(context.data.date).dayOfYear();
                            // shows for selected date
                            if (show_date === user_date) {
                                response.quick_replies.push({
                                    content_type: "text",
                                    title: show.cinemaName,
                                    payload: show.cinemaName,
                                });
                                //Modify user watson context to update what locations are availabe for that movie
                                data_to_change.cinemas.push(show.cinemaName);
                                // Exit cinemaShow.shows iteration as it already found 
                                // a show for selected date on that cinema
                                return true;
                            }
                        })
                    });
                    //Update user context with cinema
                    userContext.mergeUserContext(sender_psid, data_to_change);
                }
            });
            //No posible response
            if (!response.quick_replies.length) {
                response = { text: `Lo siento! No hay lugares donde pasen ${context.data.movie}` };
            }
            break;
        };
        case "QUICK_REPLIES_DATE": {
            const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
            //Array so as not to repeat days of show => 2 Saturday options
            const days_of_show = [];
            //Find id of selected movie
            const { id } = database.movies_id.find(movie => {
                return movie.title === context.data.movie;
            });
            database.schedules.contentCinemaShows.forEach(contentCinema => {
                //Find content for selected movie
                if (contentCinema.contentId === id) {
                    contentCinema.cinemaShows.forEach(cinemaShow => {
                        //Check if cinemas is for selected place
                        cinemaShow.shows.forEach(show => {
                            //Check if show is for selected date
                            const show_date = moment(show.date);
                            const now_date = moment().tz("America/Montevideo");
                            if (show_date.dayOfYear() >= now_date.dayOfYear()) {
                                if (days_of_show.indexOf(show_date.weekday()) === -1) {
                                    days_of_show.push(show_date.weekday());
                                    response.quick_replies.push({
                                        content_type: "text",
                                        title: weekdays[show_date.weekday()],
                                        payload: show_date.format("DD/MM/YYYY"),
                                    });
                                }
                            }
                        })
                    });
                }
            });
            //No posible response
            if (!response.quick_replies.length) {
                response = { text: `Lo siento! No hay días que pasen ${context.data.movie}` };
            }
            break;
        }
        case "QUICK_REPLIES_DATE_PLACE": {
            const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
            //Array so as not to repeat days of show => 2 Saturday options
            const days_of_show = [];
            //Find id of selected movie
            const { id } = database.movies_id.find(movie => {
                return movie.title === context.data.movie;
            });
            database.schedules.contentCinemaShows.forEach(contentCinema => {
                //Find content for selected movie
                if (contentCinema.contentId === id) {
                    contentCinema.cinemaShows.forEach(cinemaShow => {
                        //Check if cinemas is for selected place
                        if (cinemaShow.cinema.name === context.data.place) {
                            cinemaShow.shows.forEach(show => {
                                //Check if show is for selected date
                                const show_date = moment(show.date);
                                const now_date = moment().tz("America/Montevideo");
                                if (show_date.dayOfYear() >= now_date.dayOfYear()) {
                                    if (days_of_show.indexOf(show_date.weekday()) === -1) {
                                        days_of_show.push(show_date.weekday());
                                        response.quick_replies.push({
                                            content_type: "text",
                                            title: weekdays[show_date.weekday()],
                                            payload: show_date.format("DD/MM/YYYY"),
                                        });
                                    }
                                }
                            })
                        }
                    });
                }
            });
            //No posible response
            if (!response.quick_replies.length) {
                response = { text: `Lo siento! No hay horarios para ${context.data.movie} en ${context.data.place}` };
                // Clear conversation context
                userContext.updateUserContext(sender_psid, {});
            }
            break;
        }
    };
    /**
     * Response is now nurtured for user to receive it, send it to user
     */
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true })
}


