const radius = require('radius');
const socketserver = require("dgram").createSocket("udp4");

const auth = require('./auth');
const otp = require('./otp');
const radiusserver = require('./radiusserver');
const server = radiusserver.startServer(socketserver);

const config = require('./config');

server.on("message", function (msg, rinfo) {

    var conf = config.getConfigFromRadiusClients(rinfo.address);

    var packet = radius.decode({
        packet: msg,
        secret: conf.secret
    });

    const username = packet.attributes['User-Name'];
    const password = packet.attributes['User-Password'];
    const challange = !!packet.attributes.State || null;

    function sendMsg(code) {
        let attributes = conf.attributes || []

        if (conf.authAttributes && conf.authAttributes.groups) {
            let authuser = radiusserver.getAuthUser(username)
                // console.log(authuser)
            if (authuser && authuser.groups && authuser.groups.length > 0) {
                authuser.groups.forEach(g => attributes.push([conf.authAttributes.groups, g]))
            }
        }
        var options = {
            packet: packet,
            secret: conf.secret,
            code: code,
            attributes: attributes
        }
        radiusserver.sendMsg(server, options, rinfo);
    }

    if (packet.code != 'Access-Request') {
        console.log('unknown packet type: ', packet.code);
        return;
    }
    console.log('Access-Request for ' + username);

    if (challange) {
        // TODO: Perhaps check User if challengeCode needed?
        if (!radiusserver.getAuthUser(username)) {
            sendMsg('Access-Reject')
                // TODO: Implement OTP Check
        } else if (radiusserver.checkDelay(username)) {
            sendMsg('Access-Reject')
        } else {
            if (otp.checkOTP(username, password)) {
                sendMsg('Access-Accept');
            } else {
                sendMsg('Access-Reject')
            }
        }
    } else {
        Promise.all([
                auth.isMember(username, conf.group),
                auth.authenticate(username, password),
                auth.getUserGroups(username)
            ]).then(function (values) {
                if (!values[0] || !values[1]) {
                    sendMsg('Access-Challenge');
                    return;
                }
                radiusserver.setAuthUser(username, values[2])
                if (conf.challengeCode && radiusserver.challengeCodeNeeded(username, conf)) {
                    sendMsg('Access-Challenge');
                } else {
                    sendMsg('Access-Accept');
                }
            })
            .catch(function (err) {
                console.log("ERROR:", err)
                if (conf.challengeCode) {
                    sendMsg('Access-Challenge');
                } else {
                    sendMsg('Access-Reject');
                }
            })
    }

});
