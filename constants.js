module.exports = {
    /**
     * Data constants, used for knowing which action to take and what to respond with
     */
    /**
     * Template Data Constants
     */
    // Get movies based on a (date)
    GENERIC_TEMPLATE_MOVIES: "GENERIC_TEMPLATE_MOVIES",
    //Get movies based on (genre, date)
    GENERIC_TEMPLATE_MOVIES_GENRE: "GENERIC_TEMPLATE_MOVIES_GENRE",
    //Get movies based on (genre, date, place)
    GENERIC_TEMPLATE_MOVIES_GENRE_PLACE: "GENERIC_TEMPLATE_MOVIES_GENRE_PLACE",
    //Get schedule for selected (date, movie, place)
    GENERIC_TEMPLATE_SCHEDULE: "GENERIC_TEMPLATE_SCHEDULE",
    /**
     * Quick Replies Data Constants
     */
    //Get quick replies of locations available for (date, movie)
    QUICK_REPLIES_LOCATIONS: "QUICK_REPLIES_LOCATIONS",
    //Get quick repies of possible dates for selected (movie)
    QUICK_REPLIES_DATE: "QUICK_REPLIES_DATE",
    //Get quick repies of possible dates for selected (movie, place)    
    QUICK_REPLIES_DATE_PLACE: "QUICK_REPLIES_DATE_PLACE",

}