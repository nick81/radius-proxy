const radius = require('radius');
const moment = require('moment');
const config = require('./config').getRadiusConfig();

const authenticated = {};
const delayObj = {};

function startServer(server) {
    server.on("listening", function () {
        var address = server.address();
        console.log("radius server listening " +
            address.address + ":" + address.port);
    });
    server.bind(1812);
    return server;
}

function getAuthUser(user) {
    if (!authenticated[user]) {
        return false;
    } else {
        if (authenticated[user].validTime < new Date()) {
            delete authenticated[user];
            return false
        } else {
            return authenticated[user];
        }
    }
}

function setAuthUser(user, groups) {
    let timeToSaveUser = config.timeToSaveUser || 30;
    let validTime = moment().add(timeToSaveUser, 's')

    let userObj = {
        validTime: validTime
    }
    if (groups.length > 0) {
        userObj.groups = groups
    }
    authenticated[user] = userObj

}

function delAuthUser(user) {
    if (authenticated[user]) delete authenticated[user]
}


function setDelay(user) {
    let timeToDelayUser = config.timeToDelayUser || 30;
    let validTime = moment().add(timeToDelayUser, 's')
    delayObj[user] = new Date();
}

function checkDelay(user, diff = 30000) {
    if (delayObj[user]) {
        if (new Date() - obj[user] < diff) {
            return true;
        } else {
            delete obj[user]
            return false;
        }
    } else {
        return false;
    }
}

function challengeCodeNeeded(user, conf) {
    let authuser = getAuthUser(user)
    if (!authuser || !conf.challengeCodeUserGroup) return false

    if (authuser.groups.indexOf(conf.challengeCodeUserGroup) >= 0) {
        return true
    } else {
        return false
    }

}

function sendMsg(server, options, rinfo) {

    var response = radius.encode_response({
        packet: options.packet,
        code: options.code,
        secret: options.secret,
        attributes: options.attributes
    });
    console.log("Send:", options.code)
    server.send(response, 0, response.length, rinfo.port, rinfo.address, function (err, bytes) {
        if (err) {
            console.log('Error sending response to ', rinfo);
        }
    });
}

let setCleanTimer = (function (obj, diff, repeat) {
    setInterval(function () {
        for (let key in obj) {
            if (new Date() - obj[key] > diff) {
                delete obj[key];
            }
        }
    }, repeat)
}(authenticated, diff = 60000, repeat = 10000));



module.exports = {
    startServer,
    setDelay,
    checkDelay,
    sendMsg,
    getAuthUser,
    setAuthUser,
    delAuthUser,
    challengeCodeNeeded
};
