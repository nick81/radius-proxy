var ActiveDirectory = require('activedirectory');
const config = require('./config').getAuthConfig();

// var config = config.getAuthConfig();
var ad = new ActiveDirectory(config.ldap);

function buildUser(user) {

    if (user.match(/\\|@/)) return user;
    if (config.standardPrefix && config.standardSuffix) {
        return config.standardPrefix + user + config.standardSuffix;
    } else if (!config.standardPrefix && config.standardSuffix) {
        return user + config.standardSuffix;
    } else if (config.standardPrefix && !config.standardSuffix) {
        return config.standardPrefix + user;
    } else {
        return user;
    }

}

function authenticate(user, password) {
    user = buildUser(user);

    return new Promise(function (resolve, reject) {
        ad.authenticate(user, password, function (err, auth) {
            if (err) {
                console.log('ERROR: ' + JSON.stringify(err));
                reject(err);
            }
            resolve(auth);
        })
    })
}

function isMember(user, group) {
    return new Promise(function (resolve, reject) {
        ad.isUserMemberOf(user, group, function (err, isMember) {
            if (err) {
                console.log('ERROR: ' + JSON.stringify(err));
                reject(err);
            }
            resolve(isMember);
        })
    })
}

function getUserGroups(user) {

    return new Promise((resolve, reject) => {
        ad.getGroupMembershipForUser(buildUser(user), function (err, groups) {
            if (err) {
                console.log('ERROR: ' + JSON.stringify(err));
                return;
            }
            if ((!groups) || (groups.length == 0)) {
                // console.log("GRUPPEN:", groups)
                resolve(false)
            } else {
                resolve(groups.map(g => g.cn))
            }
        });
    })
}

module.exports = {
    authenticate,
    isMember,
    getUserGroups
};
