const ipRegex = /((2(5[0-5]|[0-4][0-9])|1?[0-9]?[0-9])\\.){3}(2(5[0-5]|[0-4][0-9])|1?[0-9]?[0-9])/g

function GetBMBFLink() {
    return "http://" + localStorage.ip + ":50000/host/";
}

function IsBMBFReachable() {
    return new Promise((resolve, reject) => {
        fetch(GetBMBFLink() + "beatsaber/config").then(res => {
            if(res.status == 200) resolve(true)
            else resolve(false);
        }).catch(() => resolve(false))
    })
}