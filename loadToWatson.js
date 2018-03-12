const database = require('./database');
const moment = require('moment');
const Conversation = require('watson-developer-cloud/conversation/v1');
require('dotenv').config();


var conversation = new Conversation({
    username: process.env.WATSON_USERNAME,
    password: process.env.WATSON_PASSWORD,
    version_date: '2018-02-16'
});

/**
 * first delete all movies -> delete movies entity
 */

const deleteMovie = () => {
    return new Promise((resolve, reject) => {
        var params = {
            workspace_id: process.env.WORKSPACE_ID,
            entity: 'movie'
        };
        conversation.deleteEntity(params, function (err, response) {
            if (err) {
                reject(err);
            } else {
                resolve("ALL MOVIES DELETED");
            }

        });
    })
};


/**
 * then recreate the movie entity but empty
 */
const createMovie = () => {
    return new Promise((resolve, reject) => {

        var params = {
            workspace_id: process.env.WORKSPACE_ID,
            entity: 'movie'
        };

        conversation.createEntity(params, function (err, response) {
            if (err) {
                reject(err);
            } else {
                resolve("MOVIE ENTITY CREATED");
            }
        });
    })
}


/**
 * and then add new values
 */
const addValuesMovie = () => {
    return new Promise((resolve, reject) => {
        let pushed_movies = 0;
        database.movies_id.forEach((item, index) => {
            var params = {
                workspace_id: process.env.WORKSPACE_ID,
                entity: 'movie',
                value: item.title
            };

            conversation.createValue(params, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    pushed_movies++;
                    console.log(`Success adding ${item.title}: item n° ${index + 1}`);
                    if (pushed_movies === database.movies_id.length)
                        resolve("All done here.");
                }
            });

        });


    })
};

// (async function () {
//     await deleteMovie().then(result => console.log(result)).catch(err => console.log(err));
//     await createMovie().then(result => console.log(result)).catch(err => console.log(err));
//     await addValuesMovie().then(result => console.log(result)).catch(err => console.log(err));
// })();


//ids of movies available for selected date
const id_movie_for_date = [];
database.schedules.contentCinemaShows.forEach(contentCinema => {
    //Find content for selected movie
    contentCinema.cinemaShows.forEach(cinemaShow => {
        //Check if cinemas is for selected place            
        if (cinemaShow.cinema.name.toLowerCase() === 'movie portones') {
            cinemaShow.shows.some(show => {
                //Check if show is for selected date
                var show_date = moment(show.date).dayOfYear();
                var user_date = moment().dayOfYear();
                if (show_date === user_date) {

                    //Movie found is displayed on selected (date, place)
                    id_movie_for_date.push(contentCinema.contentId)
                    //Exit iteration
                    return true;
                }
            });
        }
    });

});
// array of ALL movies that fullfil whats needed
const searched_movies = database.movies.filter(movie => {
    return (id_movie_for_date.indexOf(movie.content.id) !== -1)
});

searched_movies.map(movie => {
    console.log(movie.content.title)
    
})