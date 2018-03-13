const database = require('../database');
const moment = require('moment-timezone');
const { getUserContext, mergeUserContext, updateUserContext } = require('../userContext');

function schedule_getIdMovies(date, place, movie) {
    var arr = [];
    database.schedules.contentCinemaShows.forEach(contentCinema => {
        if (!movie || contentCinema.contentId === movie) {
            contentCinema.cinemaShows.forEach(cinemaShow => {
                if (!place || cinemaShow.cinema.name.toLowerCase() === place.toLowerCase()) {
                    cinemaShow.shows.some(show => {
                        if (date) {
                            var show_date = moment(show.date).dayOfYear();
                            var user_date = moment(date).dayOfYear();
                        }
                        if (!date || show_date === user_date) {
                            arr.push(contentCinema.contentId)
                            return true;
                        }
                    })
                }
            });
        }
    });
    return arr;
}

// function getSubsection(quantity, given_arr, pagecount, callback) {
//     //Set pageview to 0 on context
//     if (!pagecount) {
//         const data = {
//             movies_pageview: 0
//         }
//         mergeUserContext(sender_psid, data)
//     }

//     //Show always quantity number of elements
//     var start = (pagecount || 0) * quantity;
//     var end = start + quantity;
//     // array of quantity elements      
//     var arr = given_arr.slice(start, end);

//     //Generate content        
//     arr.forEach(elem => {
//         callback.call(elem);
//         response.attachment.payload.elements.push(
//             {
//                 title: movie.content.title,
//                 subtitle: movie.content.synopsis,
//                 image_url: movie.content.posterUrl,
//                 buttons: [
//                     {
//                         type: "postback",
//                         title: "Elegir",
//                         payload: movie.content.title
//                     }
//                 ]

//             }
//         )
//     })
//     //If movies shown are less than total, add the View more button
//     if (end <= (searched_movies.length - 1)) {
//         response.attachment.payload.elements.push({
//             title: "Ver más opciones",
//             subtitle: "Clickea el botón debajo para ver más opciones de películas",
//             image_url: "http://iponline.in/images/view-more.png",
//             buttons: [{
//                 type: "postback",
//                 title: "Ver más",
//                 payload: "ver mas"
//             }]
//         })
//     }
// }

exports.schedule_getIdMovies = schedule_getIdMovies;