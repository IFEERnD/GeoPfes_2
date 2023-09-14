const caculatorArea = (locations) => {
    if (!locations.length) {
        return 0;
    }
    if (locations.length < 3) {
        return 0;
    }
    let radius = 6371;

    const diameter = radius * 2;
    const circumference = diameter * Math.PI;
    const listY = [];
    const listX = [];
    const listArea = [];
// calculate segment x and y in degrees for each point

    const latitudeRef = locations[0].latitude;
    const longitudeRef = locations[0].longitude;
    for (let i = 1; i < locations.length; i++) {
        let latitude = locations[i].latitude;
        let longitude = locations[i].longitude;
        listY.push(calculateYSegment(latitudeRef, latitude, circumference));

        listX.push(calculateXSegment(longitudeRef, longitude, latitude, circumference));

    }

// calculate areas for each triangle segment
    for (let i = 1; i < listX.length; i++) {
        let x1 = listX[i - 1];
        let y1 = listY[i - 1];
        let x2 = listX[i];
        let y2 = listY[i];
        listArea.push(calculateAreaInSquareMeters(x1, x2, y1, y2));

    }

// sum areas of all triangle segments
    let areasSum = 0;
    listArea.forEach(area => areasSum = areasSum + area);


// get abolute value of area, it can't be negative
    let areaCalc = Math.abs(areasSum);// Math.sqrt(areasSum * areasSum);
    return areaCalc;

};

function calculateAreaInSquareMeters(x1, x2, y1, y2) {
    return (y1 * x2 - x1 * y2) / 2;
}

function calculateYSegment(latitudeRef, latitude, circumference) {
    return (latitude - latitudeRef) * circumference / 360.0;
}

function calculateXSegment(longitudeRef, longitude, latitude, circumference) {
    return (longitude - longitudeRef) * circumference * Math.cos((latitude * (Math.PI / 180))) / 360.0;
}


const caculatorDistance = (locations) => {
    if (!locations.length) {
        return 0;
    }
    if (locations.length < 2) {
        return 0;
    }
    let _Distance = 0;
    for (let i = 1; i < locations.length; i++) {
        _Distance += distance(locations[i-1].latitude, locations[i-1].longitude,
            locations[i].latitude, locations[i].longitude,)
    }
    return _Distance;
};

function distance(lat1, lon1, lat2, lon2){
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
};

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

export {
    caculatorArea, caculatorDistance
}
