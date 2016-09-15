const qr = require('qr-image');
const fs = require('fs');


function createQrCode(data) {

    var qr_svg = qr.image(data, {
        type: 'svg',
        parse_url: true
    });
    return qr_svg
    // qr_svg.pipe(require('fs').createWriteStream('i_love_qr.svg'));
    // var buff = new Buffer(qr.image(data, { type: 'svg' }))
    // buff.pipe(buffer)
}

function createQrCodeToFile(data, filename) {
    createQrCode(data).pipe(fs.createWriteStream(filename))

}



module.exports = {
    createQrCode,
    createQrCodeToFile
}
