const database_file = require('../database_file');
const { getUserContext, mergeUserContext, updateUserContext } = require('../userContext');
const constants = require('../constants');
const moment = require('moment-timezone');
const { sendAPI, callSendAPI } = require('./sendAPI');
const { schedule_getIdMovies } = require('./dataFunctions')


/**
* Get movies based on a (date)
*
*/
exports[constants.GENERIC_TEMPLATE_MOVIES] = async (sender_psid, response, context) => {
    //Answer user that search has began
    await sendAPI(sender_psid, { text: "Déjame mostrarte..." }).catch(err => { console.log(err); });

    //Set pageview to 0 on context
    if (!context.data.movies_pageview) {
        const data = {
            movies_pageview: 0
        }
        mergeUserContext(sender_psid, data)
    }

    response_movies(response, context);

    //No movies found, reset context
    if (!response.attachment.payload.elements.length) {
        updateUserContext(sender_psid, {});
    }

    // Response is now nurtured for user to receive it, send it to user
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};
function response_movies(response, context, database = database_file) {
    //ids of movies available for selected date
    const id_movies = schedule_getIdMovies(database, context.data.date);

    //Show always 9 or less movies
    var start = (context.data.movies_pageview || 0) * 9;
    var end = start + 9;
    var movies_shown = database.movies.slice(start, end);

    movies_shown.forEach(movie => {
        if (id_movies.indexOf(movie.content.id) !== -1) {
            response.attachment.payload.elements.push({
                title: movie.content.title,
                subtitle: movie.content.synopsis,
                image_url: movie.content.posterUrl,
                buttons: [{
                    type: "postback",
                    title: "Elegir",
                    payload: movie.content.title
                }]

            })
        }
    });

    //If movies shown are less than total, add the View more button
    if (end <= (database.movies.length - 1)) {
        response.attachment.payload.elements.push({
            title: "Ver más opciones",
            subtitle: "Clickea el botón debajo para ver más opciones de películas",
            image_url: "http://iponline.in/images/view-more.png",
            buttons: [{
                type: "postback",
                title: "Ver más",
                payload: "ver mas"
            }]
        })
    }
    if (!response.attachment.payload.elements.length) {
        response = { text: `No encontré peliculas para ${context.data.date_synonym}. Recuerda que la cartelera cambia todos los jueves.` };
    }

}


/**
* Get movies based on a (date, place)
*
*/
exports[constants.GENERIC_TEMPLATE_MOVIES_PLACE] = async (sender_psid, response, context) => {
    //Answer user that search has began
    await sendAPI(sender_psid, { text: "Déjame mostrarte..." }).catch(err => { console.log(err); });

    //Set pageview to 0 on context
    if (!context.data.movies_pageview) {
        const data = {
            movies_pageview: 0
        }
        mergeUserContext(sender_psid, data)
    }

    response_movies_place(response, context);

    //No movies found, reset context    
    if (!response.attachment.payload.elements.length) {
        updateUserContext(sender_psid, {});
    }

    // Response is now nurtured for user to receive it, send it to user
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};
function response_movies_place(response, context, database = database_file) {
    //ids of movies available for selected date and place
    const id_movies = schedule_getIdMovies(database, context.data.date, context.data.place);

    // array of ALL movies that fullfil whats needed
    const searched_movies = database.movies.filter(movie => {
        return (id_movies.indexOf(movie.content.id) !== -1)
    });

    //Show always 9 or less movies
    var start = (context.data.movies_pageview || 0) * 9;
    var end = start + 9;
    // array of 0-9 movies that fullfil whats needed        
    var movies_shown = searched_movies.slice(start, end);

    //Generate content
    movies_shown.forEach(movie => {
        response.attachment.payload.elements.push({
            title: movie.content.title,
            subtitle: movie.content.synopsis,
            image_url: movie.content.posterUrl,
            buttons: [{
                type: "postback",
                title: "Elegir",
                payload: movie.content.title
            }]

        })
    });

    //If movies shown are less than total, add the View more button
    if (end <= (searched_movies.length - 1)) {
        response.attachment.payload.elements.push({
            title: "Ver más opciones",
            subtitle: "Clickea el botón debajo para ver más opciones de películas",
            image_url: "http://iponline.in/images/view-more.png",
            buttons: [{
                type: "postback",
                title: "Ver más",
                payload: "ver mas"
            }]
        })
    }

    if (!response.attachment.payload.elements.length) {
        response = { text: `No encontré peliculas para ${context.data.date_synonym} en ${context.data.place}. Recuerda que la cartelera cambia todos los jueves.` };
    }
}


/*
* Get movies based on (genre, date)
*
*/
exports[constants.GENERIC_TEMPLATE_MOVIES_GENRE] = async (sender_psid, response, context) => {
    //Set pageview to 0 on context
    if (!context.data.movies_pageview) {
        const data = {
            movies_pageview: 0
        }
        mergeUserContext(sender_psid, data)
    }

    response_movies_genre(response, context)
    
    //No movies found, reset context
    if (!response.attachment.payload.elements.length) {
        updateUserContext(sender_psid, {});
    }

    //Response is now nurtured for user to receive it, send it to user
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};
function response_movies_genre(response, context, database = database_file) {
    //ids of movies available for selected date        
    const id_movies = schedule_getIdMovies(database, context.data.date);

    // array of ALL movies that fullfil whats needed        
    var searched_movies = database.movies.filter(movie => {
        //Example : ['comedia', 'accion']
        const movie_genres = movie.content.genre.split(', ').map(genre => genre.toLowerCase());
        return ((id_movies.indexOf(movie.content.id) !== -1) &&
            (movie_genres.indexOf(context.data.genre.toLowerCase()) !== -1))
    });

    //Show always 9 or less movies
    var start = (context.data.movies_pageview || 0) * 9;
    var end = start + 9;
    // array of 0-9 movies that fullfil whats needed        
    var movies_shown = searched_movies.slice(start, end);

    //Generate content        
    movies_shown.forEach(movie => {
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
    })
    //If movies shown are less than total, add the View more button
    if (end <= (searched_movies.length - 1)) {
        response.attachment.payload.elements.push({
            title: "Ver más opciones",
            subtitle: "Clickea el botón debajo para ver más opciones de películas",
            image_url: "http://iponline.in/images/view-more.png",
            buttons: [{
                type: "postback",
                title: "Ver más",
                payload: "ver mas"
            }]
        })
    }

    if (!response.attachment.payload.elements.length) {
        response = { text: `No encontré peliculas para ${context.data.date_synonym} del género ${context.data.genre}. Recuerda que la cartelera cambia todos los jueves.` };
    }

}


/*
* Get movies based on (genre, date)
*
*/
exports[constants.GENERIC_TEMPLATE_MOVIES_GENRE_PLACE] = async (sender_psid, response, context) => {
    //Set pageview to 0 on context
    if (!context.data.movies_pageview) {
        const data = {
            movies_pageview: 0
        }
        mergeUserContext(sender_psid, data)
    }

    response_movies_genre_place(response, context)

    //No movies found, reset context
    if (!response.attachment.payload.elements.length) {
        updateUserContext(sender_psid, {});
    }

    //Response is now nurtured for user to receive it, send it to user
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};
function response_movies_genre_place(response, context, database = database_file) {
    //ids of movies available for selected date and place        
    const id_movies = schedule_getIdMovies(database, context.data.date, context.data.place);

    // array of ALL movies that fullfil whats needed        
    var searched_movies = database.movies.filter(movie => {
        //Example : ['comedia', 'accion']
        const movie_genres = movie.content.genre.split(', ').map(genre => genre.toLowerCase());
        return ((id_movies.indexOf(movie.content.id) !== -1) &&
            (movie_genres.indexOf(context.data.genre.toLowerCase()) !== -1))
    });

    
    //Show always 9 or less movies
    var start = (context.data.movies_pageview || 0) * 9;
    var end = start + 9;
    // array of 0-9 movies that fullfil whats needed        
    var movies_shown = searched_movies.slice(start, end);

    //Generate content        
    movies_shown.forEach(movie => {
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
    })
    //If movies shown are less than total, add the View more button
    if (end <= (searched_movies.length - 1)) {
        response.attachment.payload.elements.push({
            title: "Ver más opciones",
            subtitle: "Clickea el botón debajo para ver más opciones de películas",
            image_url: "http://iponline.in/images/view-more.png",
            buttons: [{
                type: "postback",
                title: "Ver más",
                payload: "ver mas"
            }]
        })
    }

    if (!response.attachment.payload.elements.length) {
        response = { text: `No encontré peliculas para ${context.data.date_synonym} del género ${context.data.genre} en ${context.data.place}. Recuerda que la cartelera cambia todos los jueves.` };
    }
}


/**
 * Get schedule for selected (date, movie, place)
 * 
 */
exports[constants.GENERIC_TEMPLATE_SCHEDULE] = async (sender_psid, response, context) => {

    await sendAPI(sender_psid, { text: "Te muestro los horarios..." }).catch(err => { console.log(err); });

    response_schedule(response, context);

    //End of dialog, clear context
    updateUserContext(sender_psid, {});

    //Response is now nurtured for user to receive it, send it to user
    console.log('\n GENERATED RESPONSE: ' + JSON.stringify(response, null, 1))
    await sendAPI(sender_psid, response, { with_typing: true }).catch(err => { console.log(err); });
};
function response_schedule(response, context, database = database_file) {
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
}

exports.test = {
    response_movies: response_movies,
    response_movies_place: response_movies_place,
    response_movies_genre: response_movies_genre,
    response_movies_genre_place: response_movies_genre_place,
    response_schedule: response_schedule,
}