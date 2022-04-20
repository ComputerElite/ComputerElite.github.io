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


var lastID = "";
var lastSongKey = "";
var got404 = false;
var coverFetched = false

function SetImage(id) {
    if(id != lastID) coverFetched = false
    if(id.startsWith("custom_level_") && id != lastID && !useLocalhost && !stats["fetchedKey"] && !(streamHost && streamId)) {
        fetch("https://api.beatmaps.io/maps/hash/" + id.replace("custom_level_", "")).then((result) => {
            result.json().then((json) => {
                try {
                    UpdateAllFieldsOfName("key", json["versions"][0]["key"])
                } catch {}
                
                try {
                    if(lastSongKey != "") {
                        try {
                            UpdateAllFieldsOfNameHidden("prekeyContainer", false)
                        } catch {}
                    } else {
                        try {
                            UpdateAllFieldsOfNameHidden("prekeyContainer", true)
                        } catch {}
                    }
                    UpdateAllFieldsOfName("preKey", lastSongKey)
                } catch {}
                lastSongKey = json["versions"][0]["key"]
            })
        }).catch((err) => {})
    } else if((useLocalhost || (streamHost && streamId)) && stats["fetchedKey"]) {
        try {
            UpdateAllFieldsOfName("key", stats["key"])
        } catch {}
        if(lastSongKey != "") {
            try {
                UpdateAllFieldsOfNameHidden("prekeyContainer", false)
            } catch {}
        } else {
            try {
                UpdateAllFieldsOfNameHidden("prekeyContainer", true)
            } catch {}
        }
        UpdateAllFieldsOfName("preKey", lastSongKey)
        lastSongKey = stats["key"]
    }
    else if(id != lastID || got404 || !coverFetched) {
        if(streamHost && streamId) {
            fetch(location.protocol + "//" + streamHost + "/api/cover/" + streamId).then((res) => {
                res.text().then((base64) => {
                    if(res.status != 200) {
                        UpdateAllFieldsOfNameSrc("cover", "default.png")
                        got404 = true;
                    } else {
                        UpdateAllFieldsOfNameSrc("cover", base64)
                        got404 = false;
                        coverFetched = true
                    }
                })
            })
        } else if(useLocalhost) {
            fetch(useLocalhost ? localip + "cover" : "http://" + ip + ":53502/cover/base64").then((res) => {
                res.text().then((base64) => {
                    if(res.status != 200) {
                        UpdateAllFieldsOfNameSrc("cover", "default.png")
                        got404 = true;
                    } else {
                        UpdateAllFieldsOfNameSrc("cover", base64)
                        got404 = false;
                        coverFetched = true
                    }
                })
            }).catch((err) => {
                // Fallback to default cover
                got404 = true
                UpdateAllFieldsOfNameSrc("cover", "default.png")
            })
        } else if(stats["coverFetchable"]) {
            fetch(useLocalhost ? localip + "cover" : "http://" + ip + ":53502/cover/base64").then((res) => {
                res.text().then((base64) => {
                    if(res.status != 200) {
                        UpdateAllFieldsOfNameSrc("cover", "default.png")
                        got404 = true;
                    } else {
                        UpdateAllFieldsOfNameSrc("cover", base64)
                        got404 = false;
                        coverFetched = true
                    }
                })
            }).catch((err) => {
                // Fallback to default cover
                got404 = true
                UpdateAllFieldsOfNameSrc("cover", "default.png")
            })
        }
        
    }
    lastID = id
}


// var bar = document.getElementById("energybar")
// var barContainer = document.getElementById("energybarContainer")
// var songName = document.getElementById("songName")
// var songAuthor = document.getElementById("songAuthor")
// var mapper = document.getElementById("mapper")
// var diff = document.getElementById("diff")
// var combo = document.getElementById("combo")
// var score = document.getElementById("score")
// var cover = document.getElementById("cover")
// var key = document.getElementById("key")
// var rank = document.getElementById("rank")
// var percentage = document.getElementById("percentage")
// var songSub = document.getElementById("songSub")
// var njs = document.getElementById("njs")
// var bpm = document.getElementById("bpm")
// var timePlayed = document.getElementById("timePlayed")
// var totalTime = document.getElementById("totalTime")
// var mpCode = document.getElementById("mpCode")
// var mpCodeContainer = document.getElementById("mpCodeContainer")
// var prekey = document.getElementById("preKey")
// var prekeyContainer = document.getElementById("preKeyContainer")
// var customTextContainer = document.getElementById("customText")

// var williamGayContainer = document.getElementById("williamGayContainer")
// var pinkCuteContainer = document.getElementById("pinkCuteContainer")
// var eraCuteContainer = document.getElementById("eraCuteContainer")

var url_string = window.location.href
var url = new URL(url_string);
var ip = url.searchParams.get("ip");
var rate = url.searchParams.get("updaterate")
var decimals = url.searchParams.get("decimals")

var showmpcode = url.searchParams.get("dontshowmpcode")
if(showmpcode == null) showmpcode = true;
else showmpcode = false

var alwaysupdate = url.searchParams.get("alwaysupdate")
if(alwaysupdate == null) alwaysupdate = false;
else alwaysupdate = true

var nosetip = url.searchParams.get("nosetip")
if(nosetip == null) nosetip = false;
else nosetip = true

var long = url.searchParams.get("unnecessarilylongparameterwhichsetsupdateratewithc00lstufftofuqy0u0ffs0youdontwriteitbtwpinkcuteandwilliamgayandblameenderforthisideaandcomputerforimplementingitintotheoverlaysgotabitcarriedawaytypingthissohavefunnowbutwhatifitellyouthisisntdoingwhatyouarethinkingbcicandowhatiwantwithcodeandyouaretypingittogetrickrolledsoicanhavemyfunevenwhenitsnotaprilfirst")
if(long != null) {
    alert("You're crazy stop typing this stuff. Here have fun:")
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_self")
}

var williamGay = url.searchParams.get("williamgay")
if(williamGay != null) {
    try {
        UpdateAllFieldsOfNameHidden("williamGayContainer", false)
    } catch {}
} else {
    try {
        UpdateAllFieldsOfNameHidden("williamGayContainer", true)
    } catch {}
}

var eraCute = url.searchParams.get("eracute")
if(eraCute != null) {
    try {
        UpdateAllFieldsOfNameHidden("eraCuteContainer", false)
    } catch {}
} else {
    try {
        UpdateAllFieldsOfNameHidden("eraCuteContainer", true)
    } catch {}
}

var pinkCute = url.searchParams.get("pinkcute")
if(pinkCute != null) {
    try {
        UpdateAllFieldsOfNameHidden("pinkCuteContainer", false)
    } catch {}
} else {
    try {
        UpdateAllFieldsOfNameHidden("pinkCuteContainer", true)
    } catch {}
}

var alwaysshowmpcode = url.searchParams.get("alwayshowmpcode")
if(alwaysshowmpcode == null) alwaysshowmpcode = false;
else alwaysshowmpcode = true

var chartwidth = url.searchParams.get("chartwidth")
if(chartwidth == null) chartwidth = 100;

var showenergyBar = url.searchParams.get("dontshowenergy")
if(showenergyBar == null) showenergyBar = true;
else showenergyBar = false

var streamId = url.searchParams.get("streamid")
var streamHost = url.searchParams.get("streamhost")

var customText = url.searchParams.get("customtext");
if(!customText) {
    try {
        UpdateAllFieldsOfName("customTextContainer", customText)
    } catch {}
} else {
    try {
        UpdateAllFieldsOfNameHidden("customTextContainer", true)
    } catch {}
}

if(rate == null) rate = 100
if(decimals == null) decimals = 2
console.log("update rate: " + rate)
console.log("decimals for percentage: " + decimals)
console.log("ip: " + ip)
console.log("show mp code: " + showmpcode)
console.log("show energy bar: " + showenergyBar)

var useLocalhost = false;
const localip = 'http://localhost:53510/api/raw';

try {
    UpdateAllFieldsOfNameHidden("prekeyContainer", true)
} catch {}

var stats = {}

var firstRequest = true
var enabled = true
var alreadyDisabled = false


if(streamId && streamHost) {
    console.log("Using websocket of overlay streaming service")
    var ws = new WebSocket(location.protocol.replace("http", "ws") + "//" + streamHost);
    ws.onopen = () => {
        console.log('WebSocket Opened');
        ws.send("data|" + streamId);
    }

    var lastUpdate = Date.now()

    ws.onmessage = ( data ) => {
        var json = JSON.parse(data.data)
        UpdateOverlay(json)
        setTimeout(() => {
            ws.send("data|" + streamId);
            lastUpdate = Date.now()
        }, Date.now() - lastUpdate > rate ? 0 : rate - (Date.now() - lastUpdate)  )
       
        
    }

    ws.onclose = () => {
        console.error('Websocket Closed');
    }
} else {
    if(!ip) ip = prompt("Please enter your Quests IP:", "192.168.x.x");
    fetch(localip).then((res) => {
        useLocalhost = true
        console.log(`Using client at ${localip} to fetch data`)
    }).catch(() => {
        useLocalhost = false
        console.log(`falling back to Quest ip (${ip})`)
    })
    var pullingLoop = setInterval(function() {
        if(!enabled) {
            if(!alreadyDisabled) basicSetNotConnected();
            alreadyDisabled = true
            return
        }
        alreadyDisabled = false
        fetch(useLocalhost ? localip + "?ip=" + ip + (nosetip ? "&nosetip" : "") : "http://" + ip + ":53502/data").then((response) => {
            response.json().then((json) => {
                //console.log(stats)
                
            })
        })
    }, rate)
}

function UpdateOverlay(json) {
    if(json["location"] == 1 || json["location"] == 2 || json["location"] == 3 || json["location"] == 4 || alwaysupdate || firstRequest) {
        stats = json
        firstRequest = false
    } else {
        stats["location"] = json["location"]
        stats["mpGameId"] = json["mpGameId"]
        stats["mpGameIdShown"] = json["mpGameIdShown"]
    }
    
    if(json["connected"] != undefined && !json["connected"]) {
        basicSetNotConnected()
    } else {
        setAll()
    }
}

function UpdateAllFieldsOfName(name, innerHTML) {
    Array.prototype.forEach.call(document.getElementsByClassName(name), e => {
        e.innerText = innerHTML;
    })
}

function UpdateAllFieldsOfNameHidden(name, hidden) {
    Array.prototype.forEach.call(document.getElementsByClassName(name), e => {
        e.style.visibility = hidden ? "hidden" : "visible"
    })
}

function UpdateAllFieldsOfStokeDashOffset(name, offset) {
    Array.prototype.forEach.call(document.getElementsByClassName(name), e => {
        e.style.strokeDashoffset = offset
    })
}

function UpdateAllFieldsOfNameSrc(name, src) {
    Array.prototype.forEach.call(document.getElementsByClassName(name), e => {
        e.src = src
    })
}

function basicSetNotConnected() {
    try {
        SetPercentage(1.0)
    } catch {}
    try {
        UpdateAllFieldsOfName("songName", format("Quest disconnected"))
    } catch {}
    try {
        UpdateAllFieldsOfName("songAuthor", format(""))
    } catch {}
    try {
        UpdateAllFieldsOfName("mapper", format(""))
    } catch {}
    try {
        UpdateAllFieldsOfName("diff", intToDiff(4))
    } catch {}
    try {
        UpdateAllFieldsOfName("combo", format(0, 1))
    } catch {}
    try {
        UpdateAllFieldsOfName("score", format(AddComma(0), 1))
    } catch {}
    try {
        UpdateAllFieldsOfName("rank", format("SS", 2))
    } catch {}
    try {
        UpdateAllFieldsOfName("percentage", format(trim(100)) + " %")
    } catch {}
    try {
        UpdateAllFieldsOfName("songSub", format(0))
    } catch {}
    try {
        UpdateAllFieldsOfName("njs", format(trim(0)))
    } catch {}
    try {
        UpdateAllFieldsOfName("bpm", format(trim(0), 1))
    } catch {}
    try {
        UpdateAllFieldsOfName("mpCode", "not in lobby")
    } catch {}
    try {
        UpdateAllFieldsOfNameHidden("mpCodeContainer", true)
    } catch {}
    try {
        updateTime(ToElapsed(10), ToElapsed(5))
    } catch {}
}

function setAll() {
    try {
        SetPercentage(stats["energy"])
    } catch {}
    try {
        UpdateAllFieldsOfName("songName", format(stats["levelName"]))
    } catch {}
    try {
        UpdateAllFieldsOfName("songAuthor", format(stats["songAuthor"]))
    } catch {}
    try {
        UpdateAllFieldsOfName("mapper", format(stats["levelAuthor"]))
    } catch {}
    try {
        UpdateAllFieldsOfName("diff", intToDiff(stats["difficulty"]))
    } catch {}
    try {
        UpdateAllFieldsOfName("combo", format(stats["combo"], 1))
    } catch {}
    try {
        UpdateAllFieldsOfName("score", format(AddComma(stats["score"]), 1))
    } catch {}
    try {
        UpdateAllFieldsOfName("rank", format(stats["rank"], 2))
    } catch {}
    try {
        UpdateAllFieldsOfName("percentage", format(trim(stats["accuracy"] * 100)) + " %")
    } catch {}
    try {
        SetImage(stats["id"])
    } catch {}
    try {
        UpdateAllFieldsOfName("songSub", format(stats["levelSubName"]))
    } catch {}
    try {
        UpdateAllFieldsOfName("njs", format(trim(stats["njs"])))
    } catch {}
    try {
        UpdateAllFieldsOfName("bpm", format(trim(stats["bpm"]), 1))
    } catch {}
    try {
        if(stats["location"] == 2 || stats["location"] == 5 || stats["location"] == 7) {
            // Is in mp lobby or song
            if(stats["mpGameIdShown"] && showmpcode || alwaysshowmpcode) {
                UpdateAllFieldsOfName("mpCode", format(stats["mpGameId"]))
            } else {
                UpdateAllFieldsOfName("mpCode", "*****")
            }
        } else {
            UpdateAllFieldsOfName("mpCode", "not in lobby")
        }
    } catch {}
    try {
        if((stats["location"] == 2 || stats["location"] == 5 || stats["location"] == 7) && showmpcode) {
            UpdateAllFieldsOfNameHidden("mpCodeContainer", false)
        } else {
            UpdateAllFieldsOfNameHidden("mpCodeContainer", true)
        }
    } catch {}
    try {
        updateTime(ToElapsed(stats["endTime"]), ToElapsed(stats["time"]))
    } catch {}

    try {
        if(!showenergyBar) {
            UpdateAllFieldsOfNameHidden("barContainer", true)
        }
    } catch {}
    try {
        SetFPS(stats["fps"], chartwidth)
    } catch {}
    try {
        UpdateEnergy(stats["energy"])
    } catch {}
}

function AddComma(input) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function trim(input) {
    return input.toFixed(decimals)
}

function ToElapsed(input) {
    var date = new Date(0);
    date.setSeconds(input); // specify value for SECONDS here
    var timeString = date.toISOString().substr(14, 5);
    return timeString
}

function unformatTime(timeString) {
    return parseInt(timeString.split(":")[0]) * 60 + parseInt(timeString.split(":")[1])
}