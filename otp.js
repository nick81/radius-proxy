const speakeasy = require('speakeasy');
const config = require('./config').getOtpConfig();
const userlist = require('./user.json');
const qr = require('./qr');

function getUserSecret(user) {
    let founduser = userlist.filter((u) => u.user === user);
    if (founduser.length == 0) {
        return false;
    } else {
        return founduser[0].otpkey;
    }
}

function verifyOTP(key, challengeCode) {
    let verify = speakeasy.totp.verify({
        secret: key,
        encoding: 'base32',
        token: challengeCode,
        window: 3
    });
    return verify

}

function checkOTP(user, challengeCode) {
    let key = getUserSecret(user);
    return verifyOTP(key, challengeCode);
}

function getOTPUrl(options) {
    if (!options.label) options.label = config.defaultOtpRealm || "OTP password"
    let otpUri = "otpauth://totp/" + encodeURI(options.label) + "?secret=" + options.secret;
    // console.log(otpUri)
    return otpUri;
}

function generateSecret() {
    let secret = speakeasy.generateSecret();
    return secret.base32;
}

function getToken(secret) {
    var token = speakeasy.totp({
        secret: secret,
        encoding: 'base32'
    });
}


module.exports = {
    getOTPUrl,
    generateSecret,
    checkOTP
}
