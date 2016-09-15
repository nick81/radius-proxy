const jsonfile = require('jsonfile')
const config = require('./config').getOtpConfig();
const userlist = require('./user.json');
const qr = require('./qr');
const otp = require('./otp');

const params = process.argv;


function capitalizeName(name) {
    var namearr = name.split("");
    return namearr.map((l, i, arr) => {
        if (i == 0) {
            return l.toUpperCase();
        } else if (arr[i - 1] === "-" || arr[i - 1] === " ") {
            console.log(arr[i - 1])
            return l.toUpperCase();
        } else {
            return l;
        }
    }).join("")
}

function createAllQrCodes() {

    userlist.map(function (u) {
        let options = {
            label: capitalizeName(u.user) + ":" + config.defaultOtpRealm,
            secret: u.otpkey
        };
        let path = config.qrCodePath + u.user + ".svg";
        let otpauth = otp.getOTPUrl(options);
        qr.createQrCodeToFile(otpauth, path);
    });
}

function createUser(username) {
    jsonfile.readFile(config.userFile, function (err, userlist) {
        if (err) {
            console.error('Error:', err);
            return
        }
        let userfound = userlist.filter(u => u.user == username)
        if (userfound.length > 0) {
            console.log('user ' + username + ' exist')
            return
        }
        let otpkey = otp.generateSecret();
        let newuser = {
            user: username,
            otpkey: otpkey
        }
        userlist.push(newuser)
        jsonfile.writeFile(config.userFile, userlist,{spaces: 2}, (err)=>{
          if (err){console.error("Error:",err);}
          console.log('User '+ username + ' added!')
        })
    })
}

if (process.argv[2] == "createuser" ){
  if (!process.argv[3]){
    console.log('no username exists');
    return
  }
  createUser(process.argv[3])
  createAllQrCodes()
}

module.exports = {
    createAllQrCodes,
    capitalizeName
}
