"use strict";

function loadArticle(filePath, callback) {
    let xobj = new XMLHttpRequest()
        xobj.overrideMimeType("application/html")
    xobj.open('GET', filePath, true)
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText)
          }
    }
    xobj.send(null)
}


let pageselection = "index" // what's on the root of the panels.json
let sect = {}

function changepage(pagename) {
    pageselection = pagename
    panelnavinit()
}

function siteheaderinit() {
    document.getElementsByTagName("siteheader")[0].innerHTML = `<h1 class="site_header">Torvald’s Tech&nbsp;Tales</h1>`
    
    sect.article_title = document.getElementsByTagName("ARTICLE_TITLE")[0]
    sect.article_timestamp = document.getElementsByTagName("ARTICLE_TIMESTAMP")[0]
    sect.article_share = document.getElementsByTagName("ARTICLE_SHARE")[0]
    sect.article_body = document.getElementsByTagName("ARTICLE_BODY")[0]
    sect.article_goback = document.getElementsByTagName("ARTICLE_GOBACK")[0]
}

function timestampToReadable(str) {
    let year = str.substring(0,4)
    let month = str.substring(4,6)
    let date = str.substring(6,8)
    let hour = str.substring(8,10)
    let minute = str.substring(10,12)
    return `${year}-${month}-${date} ${hour}:${minute}`
}

function presentArticle(articleRecord) {
    let timestampStr = articleRecord.f.split('_',1)[0]
    sect.article_title.innerHTML = `<h2>${articleRecord.t}</h2>`
    sect.article_timestamp.innerHTML = timestampToReadable(timestampStr)
    // todo: sect.article_share, sect.article_goback
    loadArticle(`articles/${articleRecord.f}`, (html) => {
        sect.article_body.innerHTML = html
    })
}

function pageinit() {
    presentArticle({"t":"Test Article","f":"202202041136_test_article.html"})
}
