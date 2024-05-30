const jwt = require('jsonwebtoken')

function verify_mail(payload) {
    if(payload.mail == null) {
        return false;
    }

    //Check against database
    return process.db_driver.getUserByMail(payload.mail) != null;
}

function verify_google_token(payload) {
    //Validate google token
}

function verify_token(token, the_secret) {
    let decoded = null;
    try { decoded = jwt.verify(token, the_secret) }
    catch(except) {
        return false;
    }

    if(!verify_mail(decoded)) {
        return false;
    }

    return decoded;
}

module.exports = verify_token;