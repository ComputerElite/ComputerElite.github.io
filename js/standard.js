function MakeTextGetRequest(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    if (request.status == 200) {
        return request.responseText;
    } else {
        return "Something went wrong: " + request.status;
    }
}

function MakeJSONGetRequest(url) {
    return JSON.parse(MakeTextGetRequest(url));
}

function MakeTextGetRequestAsync(url) {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('GET', url, false);
        request.send(null);
        if (request.status == 200) {
            resolve(request.responseText);
        } else {
            reject("Something went wrong: " + request.status);
        }
    })
}

function GetCookie(cookieName) {
    var name = cookieName + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function SetCookie(name, value, expiration) {
    var d = new Date();
    d.setTime(d.getTime() + (expiration * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function MakeJSONGetRequestAsync(url) {
    return new Promise((resolve, reject) => {
        MakeTextGetRequestAsync(url).then(res => {
            resolve(JSON.parse(res))
        }).catch(err => [
            reject(err)
        ])
    });
}

function mouseX(evt) {
    if (evt.pageX) {
        return evt.pageX;
    } else if (evt.clientX) {
        return evt.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
    } else {
        return null;
    }
}
  
function mouseY(evt) {
    if (evt.pageY) {
        return evt.pageY;
    } else if (evt.clientY) {
        return evt.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    } else {
        return null;
    }
}

function InIframe () {
    var inFrame = false;
    try {
        inFrame = window.self !== window.top;
    } catch (e) {
    }
    console.log("in IFrame: " + inFrame)
    return inFrame;
}

function ByteSizeToString(input, decimals = 2) {
    // TB
    if(input > 1099511627776) {
        return (input / 1099511627776).toFixed(decimals) + " TB"
    }
    // GB
    else if(input > 1073741824) {
        return (input / 1073741824).toFixed(decimals) + " GB"
    }
    // MB
    else if(input > 1048576) {
        return (input / 1048576).toFixed(decimals) + " MB"
    }
    // KB
    else if(input > 1024) {
        return (input / 1024).toFixed(decimals) + " KB"
    }
    // Bytes
    else {
        return input + " Bytes"
    }
}

//May be used later for sorting
function compareVersions(v1, comparator, v2) {
    "use strict";
    var comparator = comparator == '=' ? '==' : comparator;
    if(['==','===','<','<=','>','>=','!=','!=='].indexOf(comparator) == -1) {
        throw new Error('Invalid comparator. ' + comparator);
    }
    var v1parts = v1.split('.'), v2parts = v2.split('.');
    var maxLen = Math.max(v1parts.length, v2parts.length);
    var part1, part2;
    var cmp = 0;
    for(var i = 0; i < maxLen && !cmp; i++) {
        part1 = parseInt(v1parts[i], 10) || 0;
        part2 = parseInt(v2parts[i], 10) || 0;
        if(part1 < part2)
            cmp = 1;
        if(part1 > part2)
            cmp = -1;
    }
    return eval('0' + comparator + cmp);
}

function AddZeroToNumber(number, length = 2) {
    return ('000000000000000000' + number).slice(-length)
}

function UnixToDataAndTime(timestamp) {
    var date = new Date(timestamp * 1000);
    return AddZeroToNumber(date.getDate()) + "." + AddZeroToNumber(date.getMonth()) + "." + AddZeroToNumber(date.getFullYear(), 4) + " " + AddZeroToNumber(date.getHours()) + ":" + AddZeroToNumber(date.getMinutes()) + ":" + AddZeroToNumber(date.getSeconds())
}




/// Testing of personal-ish project. Will only track me as it posts to localhost or everony crazy enough to have my not published analytics server running on their PC
var o = document.createElement("script")
o.src = "http://localhost:502/analytics.js"
document.head.appendChild(o)