const jwt = require('jsonwebtoken')

/**
 * "verifies" email by checking if it
 * is in the database
 * @param {*} payload JWT payload
 * @returns 
 */
function verify_mail(payload) {
    if(payload.mail == null) {
        return false;
    }

    //Check against database
    return process.db_driver.getUserByMail(payload.mail) != null;
}

/**
 * Extracts payload from google ticket
 * 
 * @param {*} token Google ID token
 * @returns 
 */
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

/**
 * Tries to extract payload from google ticket,
 * returns true if success, false if exception.
 * Also checks if the mail in the payload
 * corresponds to the one in the jwt
 * 
 * @param {*} token Google ID token
 * @param {*} mail Email
 * @returns 
 */
async function verify_google_token(token, mail) {
    try {
        //Check that the database mail and the google mail match
        let payload = await extract_token_payload(token);

        if(payload.mail != mail) {
            return false;
        }
    } catch(err) {
        return false;
    }

    return true;
}

/**
 * 1. Verify JWT signature and extract payload
 * 2. Verify mail in DB
 * 3. Verify google ID token
 * 
 * @param {*} token JWT
 * @param {*} the_secret JWT secret
 * @returns Decoded payload or false
 */
async function verify_token(token, the_secret) {
    let decoded = null;
    //First decode the JWT
    try { decoded = jwt.verify(token, the_secret) }
    catch(except) {
        return false;
    }

    //Check database
    if(!verify_mail(decoded)) {
        return false;
    }

    //If the JWT is not used for testing, verify the google ID token
    if(!decoded.test && !(await verify_google_token(decoded.google_token, decoded.mail))) {
        return false;
    }

    return decoded;
}

module.exports.verify_token = verify_token;
module.exports.extract_token_payload = extract_token_payload;