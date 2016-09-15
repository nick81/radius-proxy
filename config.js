const configs = require('./configs.json');

module.exports.getConfigFromRadiusClients = function (serveraddress) {

    var config = configs.radiusClients.find(function (conf) {
            return conf.addresses.indexOf(serveraddress) != -1;
        })
    return config;
}

module.exports.getAuthConfig = function () {
    return configs.authServer;
}

module.exports.getOtpConfig = function () {
    return configs.otp;
}
module.exports.getRadiusConfig = function () {
    return configs.radiusConfig;
}
