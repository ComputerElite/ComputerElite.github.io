Array.prototype.forEach.call(document.getElementsByClassName("menuItem"), i => {
    i.onclick = function() {
        Array.prototype.forEach.call(document.getElementsByClassName("menuItem"), e => {
            e.className = "menuItem" + (e.getAttribute("section") == this.getAttribute("section") ? " selected" : "")
        })
        Array.prototype.forEach.call(document.getElementsByClassName("contentItem"), e => {
            e.className = "contentItem" + (e.id == this.getAttribute("section") ? "" : " hidden")
        })
    }
})

function ClosePopup(id) {
    document.getElementById(id).className = "listContainer darken hidden"
}

function OpenPopup(id) {
    ClosePopup(id)
    document.getElementById(id).className = "listContainer darken"
}

function GotoStep(step) {
    Array.prototype.forEach.call(document.getElementsByClassName("restoreStep"), e => {
        e.className = `restoreStep${ e.id == "step" + step ? "" : " hidden"}`
    })
}

function TextBoxError(id, text) {
    ChangeTextBoxProperty(id, "#EE0000", text)
}

function TextBoxText(id, text) {
    ChangeTextBoxProperty(id, "#03cffc", text)
}

function TextBoxGood(id, text) {
    ChangeTextBoxProperty(id, "#00EE00", text)
}

function HideTextBox(id) {
    document.getElementById(id).style.visibility = "hidden"
}

function ChangeTextBoxProperty(id, color, innerHtml) {
    var text = document.getElementById(id)
    text.style.visibility = "visible"
    text.style.border = color + " 1px solid"
    text.innerHTML = innerHtml
}