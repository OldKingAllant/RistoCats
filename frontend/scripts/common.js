function perform_logout() {
    //Logout does not need server support.
    //We don't want to invalidate tokens, so we just
    //remove them from the client
    window.localStorage.removeItem('jwt');
    window.location.href = '/static/pages/login.html';
}

if(window.localStorage.getItem('lang') == null) {
    //Set default lang if not set
    window.localStorage.setItem('lang', 'en');
}