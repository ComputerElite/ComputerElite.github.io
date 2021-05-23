function format(text, returnType = 0) {
    return text == "" ? (returnType >= 1 ? (returnType >= 2 ? "SS" : "0") : "N/A") : text
}

function intToDiff(diff) {
    switch (diff)
    {
        case 0:
            return "Easy";
        case 1:
            return "Normal";
        case 2:
            return "Hard";
        case 3:
            return "Expert";
        case 4:
            return "Expert +";
    }
    return "Unknown";
}

function SetPercentage(percentage) {
    try {
        bar.style.width = (percentage * 100) + "%"
    } catch {}
}


var lastID = "";

function SetImage(id) {
    if(!id.startsWith("custom_level_")) return;
    if(id == lastID) return;
    lastID = id
    fetch("https://beatsaver.com/api/maps/by-hash/" + id.replace("custom_level_", "")).then((result) => {
        result.json().then((json) => {
            cover.src = "https://beatsaver.com" + json["coverURL"]
            key.innerHTML = "Key: " + json["key"]
        })
    })
}

var url_string = window.location.href
var url = new URL(url_string);
var ip = url.searchParams.get("ip");
var rate = url.searchParams.get("updaterate")
var decimals = url.searchParams.get("decimals")
if(ip == null || ip == "") {
    ip = prompt("Please enter your Quests IP:", "192.168.x.x");
}
if(rate == null) rate = 1000
if(decimals == null) decimals = 2
console.log(rate)

var bar = document.getElementById("energybar")
var songName = document.getElementById("songName")
var songAuthor = document.getElementById("songAuthor")
var mapper = document.getElementById("mapper")
var diff = document.getElementById("diff")
var combo = document.getElementById("combo")
var score = document.getElementById("score")
var cover = document.getElementById("cover")
var key = document.getElementById("key")
var rank = document.getElementById("rank")
var percentage = document.getElementById("percentage")
var songSub = document.getElementById("songSub")
var njs = document.getElementById("njs")
var bpm = document.getElementById("bpm")

console.log("Ip: " + ip)

setInterval(function() {
    var s =  fetch("http://" + ip + ":3501").then((response) => {
        var stats = response.json().then((stats) => {
            console.log(stats)
            SetPercentage(stats["energy"])
            try {
                songName.innerHTML = format(stats["levelName"])
            } catch {}
            try {
                songAuthor.innerHTML = format(stats["songAuthor"])
            } catch {}
            try {
                mapper.innerHTML = format(stats["mapper"])
            } catch {}
            try {
                diff.innerHTML = intToDiff(stats["difficulty"])
            } catch {}
            try {
                combo.innerHTML = format(stats["combo"], 1)
            } catch {}
            try {
                score.innerHTML = format(AddComma(stats["score"]), 1)
            } catch {}
            try {
                rank.innerHTML = format(stats["rank"], 2)
            } catch {}
            try {
                percentage.innerHTML = format(trim(stats["percentage"] * 100)) + " %"
            } catch {}
            try {
                SetImage(stats["id"])
            } catch {}
            try {
                songSub.innerHTML = format(stats["levelSub"])
            } catch {}
            try {
                njs.innerHTML = format(stats["njs"])
            } catch {}
            try {
                bpm.innerHTML = format(stats["bpm"], 1)
            } catch {}
            try {
                updateTime(stats["totalTime"], stats["timePlayed"])
            } catch {}
        })
    })
}, rate)

function updateTime(songLength, currentTime) {
    //To-Do
    return;
}

function AddComma(input) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function trim(input) {
    return input.toFixed(decimals)
}