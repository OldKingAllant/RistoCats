const jwt = require('jsonwebtoken')

function verify_mail(payload) {
    if(payload.mail == null) {
        return false;
    }

    //Check against database
    return process.db_driver.getUserByMail(payload.mail) != null;
}

async function extract_token_payload(token) {
    const ticket = await process.oauth_client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    let payload = ticket.getPayload();

    return {
        mail: payload.email,
        sub: payload.sub 
    };
}

async function verify_google_token(token, mail) {
    try {
        let payload = await extract_token_payload(token);

        if(payload.mail != mail) {
            return false;
        }
    } catch(err) {
        return false;
    }

    return true;
}

async function verify_token(token, the_secret) {
    let decoded = null;
    try { decoded = jwt.verify(token, the_secret) }
    catch(except) {
        return false;
    }

    if(!verify_mail(decoded)) {
        return false;
    }

    if(!decoded.test && !(await verify_google_token(decoded.google_token, decoded.mail))) {
        return false;
    }

    return decoded;
}

module.exports.verify_token = verify_token;
module.exports.extract_token_payload = extract_token_payload;