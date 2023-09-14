const convertTimeShow = (date) => {
    let year = date.getFullYear().toString();

    let month = '';
    if (date.getMonth() + 1 < 10) {
        month = '0' + (date.getMonth() + 1).toString();
    } else {
        month = (date.getMonth() + 1).toString();
    }

    let day = '';
    if (date.getDate() < 10) {
        day = '0' + date.getDate().toString();
    } else {
        day = date.getDate().toString();
    }

    let hour = '';
    if (date.getHours() < 10) {
        hour = '0' + date.getHours().toString();
    } else {
        hour = date.getHours().toString();
    }
    let minute = '';
    if (date.getMinutes() < 10) {
        minute = '0' + date.getMinutes().toString();
    } else {
        minute = date.getMinutes().toString();
    }
    let second = '';
    if (date.getSeconds() < 10) {
        second = '0' + date.getSeconds().toString();
    } else {
        second = date.getSeconds().toString();
    }

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
};

const convertTimeToString = (date) => {
    let year = date.getFullYear().toString();

    let month = '';
    if (date.getMonth() + 1 < 10) {
        month = '0' + (date.getMonth() + 1).toString();
    } else {
        month = (date.getMonth() + 1).toString();
    }

    let day = '';
    if (date.getDate() < 10) {
        day = '0' + date.getDate().toString();
    } else {
        day = date.getDate().toString();
    }

    let hour = '';
    if (date.getHours() < 10) {
        hour = '0' + date.getHours().toString();
    } else {
        hour = date.getHours().toString();
    }
    let minute = '';
    if (date.getMinutes() < 10) {
        minute = '0' + date.getMinutes().toString();
    } else {
        minute = date.getMinutes().toString();
    }
    let second = '';
    if (date.getSeconds() < 10) {
        second = '0' + date.getSeconds().toString();
    } else {
        second = date.getSeconds().toString();
    }

    return year + month + day + hour + minute + second;
};

const convertTimeToStringFull = (date) => {
    let year = date.getFullYear().toString();

    let month = '';
    if (date.getMonth() + 1 < 10) {
        month = '0' + (date.getMonth() + 1).toString();
    } else {
        month = (date.getMonth() + 1).toString();
    }

    let day = '';
    if (date.getDate() < 10) {
        day = '0' + date.getDate().toString();
    } else {
        day = date.getDate().toString();
    }

    let hour = '';
    if (date.getHours() < 10) {
        hour = '0' + date.getHours().toString();
    } else {
        hour = date.getHours().toString();
    }
    let minute = '';
    if (date.getMinutes() < 10) {
        minute = '0' + date.getMinutes().toString();
    } else {
        minute = date.getMinutes().toString();
    }
    let second = '';
    if (date.getSeconds() < 10) {
        second = '0' + date.getSeconds().toString();
    } else {
        second = date.getSeconds().toString();
    }
    let minisec = date.getMilliseconds().toString();

    return year + month + day + hour + minute + second + minisec;
};

export {
    convertTimeToString, convertTimeShow, convertTimeToStringFull
}
