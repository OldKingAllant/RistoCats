function perform_logout() {
    window.localStorage.removeItem('jwt');
    window.location.href = '/static/pages/login.html';
}

if(window.localStorage.getItem('lang') == null) {
    window.localStorage.setItem('lang', 'en');
}