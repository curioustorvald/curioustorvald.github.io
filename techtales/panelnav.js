"use strict";

function loadJSON(jsonPath, isAsync, callback) {   
    let xobj = new XMLHttpRequest()
        xobj.overrideMimeType("application/json")
    xobj.open('GET', jsonPath, isAsync)
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText)
          }
    }
    xobj.send(null)
}

function panelnavinit() {
    loadJSON("panels.json", true, response => {
        populateNav(JSON.parse(response))
    })
}

function populateNav(db) {
    let currentPage = location.href.split("/").slice(-1)
    let output = `<div class="sub_content"><ul class="sub_menu">`
    
    Object.keys(db).forEach(id => {
        let css_class = (pageselection == id) ? "sub_link selected" : "sub_link"
        let action = db[id].schema
        let href = ("HREF" == action) ? db[id].source :
                `javascript:changepage(%22${id}%22)`
        
        output += `<li class="columngap"><a href="${href}" class="${css_class}">${db[id].label}</a></li>`
    })
    
    output += "</ul></div>"
    
    document.getElementsByTagName("panelnavwrapper")[0].innerHTML = output
}
