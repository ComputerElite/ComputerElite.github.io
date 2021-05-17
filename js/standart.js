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