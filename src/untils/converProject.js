var epsg = require('epsg-to-proj')
var proj = require('proj4')

const transformLatLng = (lat, lng, projection) => {
    let point = null;
    if (projection == 4326) {
        point = {
            lat: lat,
            long: lng
        }
    } else {
        var pointConvert = proj(epsg[4326], epsg[projection], [Number(lng), Number(lat)]);
        point = {
            lat: pointConvert[1],
            long: pointConvert[0]
        }
    }
    return point;
}

export { transformLatLng }


