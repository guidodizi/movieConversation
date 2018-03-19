const moment = require('moment-timezone');
moment.locale('es');

exports.get_template_movies = function (res, context) {
    //get database from container
    const repositoryContainer = this;
    const database = this.database;
    const response = { ...res };

    //ids of movies available for selected date
    const id_movies = repositoryContainer.get_schedule_idMovies(context.data.date);

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

    return response;
}


exports.get_template_movies_place = function (res, context) {
    //get database from container
    const repositoryContainer = this;
    const database = this.database;
    const response = { ...res };


    //ids of movies available for selected date and place
    const id_movies = repositoryContainer.get_schedule_idMovies(context.data.date, context.data.place);

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

    return response;
}

exports.get_template_movies_genre = function (res, context) {
    //get database from container
    const repositoryContainer = this;
    const database = this.database;
    const response = { ...res };


    //ids of movies available for selected date        
    const id_movies = repositoryContainer.get_schedule_idMovies(context.data.date);

    // array of ALL movies that fullfil whats needed        
    var searched_movies = database.movies.filter(movie => {
        //Example : ['comedia', 'accion']
        const movie_genres = movie.content.genre.split(', ').join(',').split(',').map(genre => genre.toLowerCase());
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

    return response;
}


exports.get_template_movies_genre_place = function (res, context) {
    //get database from container
    const repositoryContainer = this;
    const database = this.database;
    const response = { ...res };


    //ids of movies available for selected date and place        
    const id_movies = repositoryContainer.get_schedule_idMovies(context.data.date, context.data.place);

    // array of ALL movies that fullfil whats needed        
    var searched_movies = database.movies.filter(movie => {
        //Example : ['comedia', 'accion']
        const movie_genres = movie.content.genre.split(', ').join(',').split(',').map(genre => genre.toLowerCase());
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

    return response;
}


exports.get_template_schedule = function (res, context) {
    //get database from container
    const repositoryContainer = this;
    const database = this.database;
    const response = { ...res };


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

    return response;
}

exports.get_template_new_releases = function (res, context) {
    //get database from container
    const repositoryContainer = this;
    const database = this.database;
    const response = { ...res };

    //Show always 9 or less movies
    var start = (context.data.movies_pageview || 0) * 9;
    var end = start + 9;
    var movies_shown = database.movies_newRelease.slice(start, end);

    movies_shown.forEach(movie => {
        if (id_movies.indexOf(movie.content.id) !== -1) {
            response.attachment.payload.elements.push({
                title: movie.content.title,
                subtitle: `Estreno: ${moment(movie.content.openingDate).format('LLLL')}`,
                image_url: movie.content.posterUrl,
                buttons: [{
                    type: "postback",
                    title: "Elegir",
                    payload: movie.content.title
                }]

            })
        }
    });

    return response;
}