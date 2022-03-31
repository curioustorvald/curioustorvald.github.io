"use strict";

function loadArticle(filePath, callback) {
    let xobj = new XMLHttpRequest()
        xobj.overrideMimeType("application/html")
    xobj.open('GET', filePath, true)
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4) {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback((xobj.status == "200") ? xobj.responseText : null)
          }
    }
    xobj.send(null)
}

function loadJSON(jsonPath, callback) {
    let xobj = new XMLHttpRequest()
        xobj.overrideMimeType("application/json")
    xobj.open('GET', jsonPath, true)
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4) {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback((xobj.status == "200") ? xobj.responseText : null)
          }
    }
    xobj.send(null)
}


let pageselection = "index" // what's on the root of the panels.json
let currentarticle = undefined
let sect = {}
let panels = {}

let nothing_here_quotes = [
   "M’aiq is tired now. Go bother somebody else.",
   "M’aiq is done talking.",
   "M’aiq knows many things, no?",
   "M’aiq wishes you well."
]

function changepage(pagename) {
    qd.a = undefined
    pageselection = pagename
    populateNav(panels)
    pageinit()
}

function init() {
    sect.article_title = document.getElementsByTagName("ARTICLE_TITLE")[0]
    sect.article_timestamp = document.getElementsByTagName("ARTICLE_TIMESTAMP")[0]
    sect.article_share = document.getElementsByTagName("ARTICLE_SHARE")[0]
    sect.article_body = document.getElementsByTagName("ARTICLE_BODY")[0]
    sect.article_goback = document.getElementsByTagName("ARTICLE_GOBACK")[0]

    loadJSON("panels.json", o => {
        panels = JSON.parse(o)
        populateNav(panels)
        pageinit()
    })
}

function pageinit() {
//     _presentArticle({"t":"Test Article","f":"202202041136_test_article.html"})
    let schema = panels[pageselection].schema
    let filename = panels[pageselection].source

    // process query string for 'a' (article)
    // syntax: <category>_<filename>
    // e.g. cg_202202041337_terrarum_lighting1
    if (qd.a && qd.a[0]) {
        let delim = qd.a[0].search('_')
        let cat = qd.a[0].substring(0, delim)
        let article = qd.a[0].substring(delim+1)
        pageselection = cat
        populateNav(panels)
        loadJSON(`articles/articles_${cat}.json`, (jsonText) => {
            if (jsonText == null) showArticleNotFound()
            else {
                let records = JSON.parse(jsonText)
                let index = records.findIndex(r => r.f == article)
                if (index >= 0)
                    _presentArticleByRecord(records[index])
                else
                    showArticleNotFound()
            }
        })
    }
    else {
        if ("LIST" == schema)
            presentList()
        else if ("HOME" == schema) {
            sect.article_title.innerHTML = ''
            sect.article_timestamp.innerHTML = ''
            sect.article_share.innerHTML = ''
            sect.article_goback.innerHTML = ''
            loadArticleFromFileAndShow("index")
        }
        else if ("FRAME" == schema) {
            loadArticle(`pages/${filename}.html`, (html) => {
                document.getElementsByTagName("CONTENTSANCHOR")[0].innerHTML = html
            })
        }
    }
}

function showArticleNotFound() {
    sect.article_title.innerHTML = '<h3>Article Not Found</h3>'
    sect.article_timestamp.innerHTML = ''
    sect.article_share.innerHTML = ''
    sect.article_goback.innerHTML = createGoback(pageselection)
    sect.article_body.innerHTML = '<p>The article you are looking for, or have been shared, is regrettably not found in this blog.</p>'
}

function populateNav(db) {
    let currentPage = location.href.split("/").slice(-1)
    let output = `<div class="sub_content"><ul class="sub_menu">`

    Object.keys(db).forEach(id => {
        let css_class = (pageselection == id) ? "sub_link selected" : "sub_link"
        let action = db[id].schema
        let href = ("HREF" == action || "HOME" == action) ? db[id].source :
                `javascript:changepage(%22${id}%22)`

        output += `<li class="columngap"><a href="${href}" class="${css_class}">${db[id].label}</a></li>`
    })

    output += "</ul></div>"

    document.getElementsByTagName("panelnavwrapper")[0].innerHTML = output
}


function timestampToReadable(str) {
    let year = str.substring(0,4)
    let month = str.substring(4,6)
    let date = str.substring(6,8)
    let hour = str.substring(8,10)
    let minute = str.substring(10,12)
    return `${year}-${month}-${date} ${hour}:${minute}`
}

function createShareLink(cat, name) {
    let t = "Share This Article"
    return `<a href="javascript:copySharelink()">${t}</a>`
}

function copySharelink() {
    let link = `${pageselection}_${currentarticle}`
    clipit(`${window.location.href.split('?')[0]}?a=${link}`)
}

function clipit(value) {
    let holder = document.getElementById("clipboard_dummy_container")
    holder.style.display = "block"
    holder.style.opacity = 0

    try {
        let temp = document.getElementById("clipboard_dummy")
        temp.value = value
        temp.select()
        temp.setSelectionRange(0,99999)
        document.execCommand("copy")

        alert("Link Copied")
    }
    catch (e) {
        console.log(e)
    }
    finally {
        holder.style.display = "none" // because this inputbox must be hidden
    }
}

function presentArticle(id, index) {
    loadJSON(`articles/articles_${id}.json`, (jsonText) => {
        _presentArticleByRecord(JSON.parse(jsonText)[index])
    })
}

function createGoback(cat) {
    return (panels[cat] && panels[cat].label) ? `<a href="javascript:presentList()"><sym>🖘</sym>&ensp;Go Back to ${panels[cat].label}</a>` : ``
}

function _presentArticleByRecord(articleRecord) {
    let timestampStr = articleRecord.f.split('_',1)[0]
    currentarticle = articleRecord.f

    sect.article_title.innerHTML = `<h2>${articleRecord.t}</h2>`
    sect.article_timestamp.innerHTML = timestampToReadable(timestampStr)
    sect.article_share.innerHTML = createShareLink()
    sect.article_goback.innerHTML = createGoback(pageselection)

    loadArticleFromFileAndShow(articleRecord.f)
}

function loadArticleFromFileAndShow(filename) {
    loadArticle(`articles/${filename}.html`, (html) => {
        sect.article_body.innerHTML = html
    })
}

function presentList(id) {
    let catRecord = panels[id || pageselection] // {id:..., schema:..., label:..., source:...,}

    sect.article_timestamp.innerHTML = ''
    sect.article_share.innerHTML = ''
    sect.article_goback.innerHTML = ''
    sect.article_title.innerHTML = `<h2>Articles with “${catRecord.label}” Topic:</h2>`

    loadJSON(`articles/articles_${catRecord.id}.json`, (jsonText) => {
        let articleListHTML = '<article_list_container>'
        let articles = JSON.parse(jsonText)
        if (articles.length > 0) {
            articles.reverse().forEach((rec, i, a) => {
                articleListHTML += `<article_list><a href="javascript:presentArticle('${catRecord.id}',${a.length - i - 1})">${rec.t}</a></article_list>`
            })
        }
        else {
            articleListHTML += `<center class=nothing_here>${nothing_here_quotes[(Math.random() * nothing_here_quotes.length)|0]}</center>`
        }
        articleListHTML += `</article_list_container>`
        sect.article_body.innerHTML = articleListHTML
    })
}
