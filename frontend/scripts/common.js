function perform_logout() {
    window.localStorage.removeItem('jwt');
    window.location.href = '/static/pages/login.html';
}