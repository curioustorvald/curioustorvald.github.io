"use strict";

const dropdownIdToDBname = {
    "literal_dog":["개"],
    "literal_wolf":["늑대"],
    "literal_cat":["고양이"],
    "group_felidae":["고양이과","고양잇과","사자","호랑이","표범","카라칼","퓨마","쿠거","마운틴라이언"],
    "literal_fox":["여우"],
    "literal_rabbit":["토끼"],
    "group_aves":["조류","새","앵무","수리","올빼미","부엉이"],
    "group_pisces":["어류","물고기","잉어"],
    "literal_dragon":["드래곤"],
    "literal_deer":["노루/사슴","사슴","노루"],
    "group_raccoons":["레서판다/라쿤/너구리","레서판다","라쿤","너구리"],
    "literal_bear":["곰"],
    "group_rodentia":["설치류","다람쥐","청설모","날다람쥐","쥐"],
    "group_mustelidae":["족제비과","오소리","족제비"],
    "group_bovidae":["소/양","소","염소","양","젖소"],
    "group_camelidae":["낙타/알파카/라마","낙타","알파카","라마"],
    "literal_bat":["박쥐"],
    "literal_fantasy_sergal":["세르갈"],
    "literal_fantasy_protogen":["프로토겐"],
    "literal_fantasy_henelsia":["헤넬시아","나비 고양이"]
}

const dropdownStyle = ["Cyber","Kemo","Kemo Toon","Toon","Semi","Real","Real Toon"]

// 외부 JSON 가져오기
// Localhost에서 작동시킬 시 보안 문제로 로딩 안될 수 있음. 보안 설정을 잠깐 끄거나 서버에 올려서 돌리시오.
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

var furdb = {}
var creatorThesaurus = {}

function forEachFur(action) {
    Object.keys(furdb).filter(i => !isNaN(i)).forEach(v => action(furdb[v]))
}

function mapFurs(transformation) {
    return Object.keys(furdb).filter(i => !isNaN(i)).map(v => transformation(furdb[v]))
}

function filterFurs(predicate) {
    return Object.keys(furdb).filter(i => !isNaN(i)).filter(v => predicate(furdb[v]))
}

function template(strings, ...keys) {
    return (function(...values) {
        let dict = values[values.length - 1] || {}
        let result = [strings[0]]
        keys.forEach(function(key, i) {
            let value = Number.isInteger(key) ? values[key] : dict[key]
            result.push(value, strings[i + 1])
        })
        return result.join('')
    })
}

const tagDocumentation = {
    "creator_name":{"ko":"퍼슈트의 제작자를 나타냅니다. 자작 퍼슈트의 경우 '자작'을 사용하십시오","en":"Creator of the fursuit. Use 'DIY' for DIY suits"},
    "name":{"ko":"퍼슈트 캐릭터의 이름 (한/영)","en":"Name of the character in Korean/English"},
    "actor_name":{"ko":"퍼슈트 오너의 이름 (한국어)","en":"Name of the actor in Korean"},
    "species_ko":{"ko":"퍼슈트 캐릭터의 종 (한국어)","en":"Species of the character in Korean"},
    "style":{"ko":"퍼슈트 캐릭터의 스타일 (Real, Real Toon, Kemo, Kemo Toon, Semi)","en":"Style of the character (Real, Real Toon, Kemo, Kemo Toon, Semi)"},
    "is_partial":{"ko":"캐릭터가 파셜인지 여부 (TRUE, FALSE)","en":"If the suit is partial-suit (TRUE, FALSE)"},
    "country":{"ko":"오너의 국적 (ISO 3166-1 Alpha-3 코드)","en":"Nationality of the actor in ISO 3166-1 Alpha-3 Code"},
    "birthday_from":{"ko":"활동개시일 검색에서 가장 이른 날짜. 해당 날짜를 포함함 (yyyymmdd)","en":"Earliest day in birthday search, inclusive (yyyymmdd)"},
    "birthday_to":{"ko":"활동개시일 검색에서 가장 늦은 날짜. 해당 날짜를 포함함 (yyyymmdd)","en":"Latest day in birthday search, inclusive (yyyymmdd)"}
}

const i18n = {
    "ko": {
        "TagSyntaxError": "태그가 올바르지 않게 입력되었습니다: ",
        "TagOptions": "태그 옵션:",
        "SearchTags": "검색어: ",
        "IsExactMatch": "검색어 정확히 매칭",
        "IsIncludeWip": "미완성 퍼슈트 포함",
        "Submit": "검색",
        "Reset": "초기화",
        "WillShowAllOnEmptySearch": "입력 칸을 비우고 검색하면 모든 퍼슈트를 보여줍니다",
        "AdvancedSearch": "태그 검색",
        "SimpleSearch": "쉬운 검색",
        "SimpleSearchActor": "소유자: ",
        "SimpleSearchCreator": "제작자: ",
        "SimpleSearchName": "이름 (한/영): ",
        "SimpleSearchBirthday": "활동개시일 (yyyymmdd): ",
        "SimpleSearchBirthday2": "활동개시일: ",
        "SimpleSearchSpecies": "종: ",
        "SimpleSearchStyle": "스타일: ",
        "SimpleSearchIsPartial": "파셜 여부: ",
        "SimpleSearchColourCombi": "색상 조합: ",
        "SimpleSearchColourCombi0": "바탕색",
        "SimpleSearchColourCombi1": template`염색${0}`,
        "SimpleSearchEyesSclera": "역안?",
        "SimpleSearchEyesColour": "홍채",
        "SimpleSearchHairColour": "염색",
        "SimpleSearchHairStreak": "브릿지",
        "SimpleSearchEyes": "눈 색: ",
        "SimpleSearchHair": "머리카락:",
        "MadeBy": "제작: ",
        "ThisManySearchResults": template`${0}개의 검색 결과:`,
        "None": "없음",
        "Any": "아무거나"
    },
    "en": {
        "TagSyntaxError": "Entered tag is malformed: ",
        "TagOptions": "Tag Options:",
        "SearchTags": "Search Tags: ",
        "IsExactMatch": "Exact Match?",
        "IsIncludeWip": "Include Not Yet Completed?",
        "Submit": "Submit",
        "Reset": "Reset",
        "WillShowAllOnEmptySearch": "Blank search tag will show all the fursuits",
        "AdvancedSearch": "Search By Tags",
        "SimpleSearch": "Easy Search",
        "SimpleSearchActor": "Owner: ",
        "SimpleSearchCreator": "Creator: ",
        "SimpleSearchName": "Name (Korean/English): ",
        "SimpleSearchBirthday": "Day of Birth (yyyymmdd): ",
        "SimpleSearchBirthday2": "Day of Birth: ",
        "SimpleSearchSpecies": "Species: ",
        "SimpleSearchStyle": "Style: ",
        "SimpleSearchIsPartial": "Partial? ",
        "SimpleSearchColourCombi": "Colour Schemes: ",
        "SimpleSearchColourCombi0": "Background",
        "SimpleSearchColourCombi1": template`Foreground #${0}`,
        "SimpleSearchEyesSclera": "Sclera",
        "SimpleSearchEyesColour": "Iris",
        "SimpleSearchHairColour": "Dye",
        "SimpleSearchHairStreak": "Streak",
        "SimpleSearchEyes": "Eye Colour: ",
        "SimpleSearchHair": "Hair Colour: ",
        "MadeBy": "Made by ",
        "ThisManySearchResults": template`Showing ${0} search results:`,
        "None": "None",
        "Any": "Any"
    }
}

const nulsel = `<option value="dont_care">&mdash;</option>`
function nonesel() {
    return `<option value="none">${i18n[lang].None}</option>`
}
function anysel() {
    return `<option value="any">${i18n[lang].Any}</option>`
}

// haskell-inspired array functions
Array.prototype.head = function() {
    return this[0]
}
Array.prototype.last = function() {
    return this[this.length - 1]
}
Array.prototype.tail = function() {
    return this.slice(1)
}
Array.prototype.init = function() {
    return this.slice(0, this.length - 1)
}

var lang = "ko"

function pageinit() {
    // DB 로드
    loadJSON("workshopaliases.json", true, response => {
        creatorThesaurus = JSON.parse(response)
        
        loadJSON("furdb.json", true, response => {
            furdb = JSON.parse(response)
            // jobs that need DB to be there
            populateColourSelection()
            populateEyesSelection()
            populateHairSelection()
            // these are here to just make them pop up in sync with more heavy tasks
            populateSpeciesSelection()
            populateStyleSelection()
        })
    })
    // 선택된 언어로 문서 출력
    reloadI18n()
    
    clearResults()
}

function populateSpeciesSelection() {
    let output = `${nulsel}`
    Object.keys(dropdownIdToDBname).forEach(key => {
        output += `<option value="${key}">`
        output += dropdownIdToDBname[key][0]//.join('/')
        output += `</option>`
    })
    document.getElementById("simplesearch_dropdown_species").innerHTML = output
}

function populateStyleSelection() {
    let output = `${nulsel}`
    dropdownStyle.forEach(value => {
        output += `<option value="${value}">`
        output += value
        output += `</option>`
    })
    document.getElementById("simplesearch_input_style").innerHTML = output
}

function populateColourSelection() {
    let bgCols = {}
    let fgCols = {}
    
    forEachFur(prop => {
        let colours = prop.colours
        if (colours.length > 0) {
            if (!bgCols[colours[0]])
                bgCols[colours[0]] = 1
            for (let i = 1; i < colours.length; i++) {
                if (!fgCols[colours[i]])
                    fgCols[colours[i]] = 1
            }
        }
    })
        
    let bgColList = Object.keys(bgCols).sort()
    let fgColList = Object.keys(fgCols).sort()
    
    let bgSel = nulsel + bgColList.map(s => `<option value="${s}">${s}</option>`).join('')
    let fgSel = nulsel + fgColList.map(s => `<option value="${s}">${s}</option>`).join('')
    
    document.getElementById("simplesearch_colour_background").innerHTML = bgSel
    document.getElementById("simplesearch_colour1").innerHTML = fgSel
    document.getElementById("simplesearch_colour2").innerHTML = fgSel
    document.getElementById("simplesearch_colour3").innerHTML = fgSel
}

function populateEyesSelection() {
    let cols = {}
    
    forEachFur(prop => {
        let colours = prop.eyes
        colours.forEach(col => {
            if (!cols[col] && col != "역안")
                cols[col] = 1
        })
    })
        
    let colList = Object.keys(cols).sort()
    let scleraList = ["역안"]
    
    let colSel = nulsel + colList.map(s => `<option value="${s}">${s}</option>`).join('')
    let sclearSel = nulsel + scleraList.map(s => `<option value="${s}">${s}</option>`).join('')
    
    document.getElementById("simplesearch_eyes").innerHTML = colSel
    document.getElementById("simplesearch_eyes_sclera").innerHTML = sclearSel
}

function populateHairSelection() {
    let bgCols = {}
    let fgCols = {}
    
    forEachFur(prop => {
        let colours = prop.hairs
        if (colours.length > 0) {
            if (!bgCols[colours[0]])
                bgCols[colours[0]] = 1
            for (let i = 1; i < colours.length; i++) {
                if (!fgCols[colours[i]])
                    fgCols[colours[i]] = 1
            }
        }
    })
        
    let bgColList = Object.keys(bgCols).sort()
    let fgColList = Object.keys(fgCols).sort()
    
    let bgSel = nulsel + nonesel() + anysel() + bgColList.map(s => `<option value="${s}">${s}</option>`).join('')
    let fgSel = nulsel + nonesel() + anysel() + fgColList.map(s => `<option value="${s}">${s}</option>`).join('')
    
    document.getElementById("simplesearch_hair_dye").innerHTML = bgSel
    document.getElementById("simplesearch_hair_streak").innerHTML = fgSel
}

function reloadI18n() {
    document.getElementById("will_show_anything_string").innerText = i18n[lang].WillShowAllOnEmptySearch
    
    
    let tagdocOutput = ""
    
    tagdocOutput += "<p>"+i18n[lang].TagOptions+"</p><ul>"
    Object.keys(tagDocumentation).forEach(it => {
        tagdocOutput += "<li>"+it+" &ndash; "+tagDocumentation[it][lang]+"</li>"
    })
    tagdocOutput += "</ul><p>"+i18n[lang].WillShowAllOnEmptySearch+"</p>"
    
    document.getElementById("tagdoc").innerHTML = tagdocOutput
    
    // 검색폼 다국어화
    document.getElementById("simplesearch_header").innerText = i18n[lang].SimpleSearch
    document.getElementById("simplesearch_input_creatorname_string").innerText = i18n[lang].SimpleSearchCreator
    document.getElementById("simplesearch_input_furname_string").innerText = i18n[lang].SimpleSearchName
    document.getElementById("simplesearch_input_bday_title_string").innerText = i18n[lang].SimpleSearchBirthday
    document.getElementById("simplesearch_dropdown_species_string").innerText = i18n[lang].SimpleSearchSpecies
    document.getElementById("simplesearch_input_is_partial_string").innerText = i18n[lang].SimpleSearchIsPartial
    document.getElementById("simplesearch_input_style_string").innerText = i18n[lang].SimpleSearchStyle
    document.getElementById("simple_submit_button").setAttribute("value", i18n[lang].Submit)
    document.getElementById("simple_reset_button").setAttribute("value", i18n[lang].Reset)
    
    document.getElementById("simplesearch_colour_string").innerText = i18n[lang].SimpleSearchColourCombi
    document.getElementById("simplesearch_colourcombi0").innerText = i18n[lang].SimpleSearchColourCombi0
    document.getElementById("simplesearch_colourcombi1").innerText = i18n[lang].SimpleSearchColourCombi1(1)
    document.getElementById("simplesearch_colourcombi2").innerText = i18n[lang].SimpleSearchColourCombi1(2)
    document.getElementById("simplesearch_colourcombi3").innerText = i18n[lang].SimpleSearchColourCombi1(3)
    
    document.getElementById("simplesearch_input_eyes_string").innerText = i18n[lang].SimpleSearchEyes
    document.getElementById("simplesearch_eyes_sclera_string").innerText = i18n[lang].SimpleSearchEyesSclera
    document.getElementById("simplesearch_eyes_string").innerText = i18n[lang].SimpleSearchEyesColour
    
    document.getElementById("simplesearch_input_hair_string").innerText = i18n[lang].SimpleSearchHair
    document.getElementById("simplesearch_hair_dye_string").innerText = i18n[lang].SimpleSearchHairColour
    document.getElementById("simplesearch_hair_streak_string").innerText = i18n[lang].SimpleSearchHairStreak

    
    document.getElementById("searchform_header").innerText = i18n[lang].AdvancedSearch
    document.getElementById("searchtags_string").innerText = i18n[lang].SearchTags
    document.getElementById("exactmatch_string").innerText = i18n[lang].IsExactMatch
    document.getElementById("includewip_string").innerText = i18n[lang].IsIncludeWip
    document.getElementById("includewip_string2").innerText = i18n[lang].IsIncludeWip
    document.getElementById("submit_button").setAttribute("value", i18n[lang].Submit)
}

function setLangKo() {
    lang = "ko"
    reloadI18n()
}
function setLangEn() {
    lang = "en"
    reloadI18n()
}
function textOrQos(s) {
    return (s.trim().length === 0) ? "???" : s
}
function showOverlay(id) {
    let prop = furdb[id]
    
    let displayFurName = textOrQos((prop.name_ko + " " + prop.name_en).trim())
            
    let displayFurNameJa = (prop.name_ja).trim()
                        
    let furAliases = (prop.aliases).trim()
                        
    let actorName = (prop.actor_name).trim()
                        
    let displayActorName = textOrQos(actorName.split("/").shift())
    let displayCreatorName = textOrQos((prop.creator_name).trim().replace("/자작", ""))
    if (displayCreatorName == "자작") displayCreatorName = displayActorName
                        
    let displayActorLinkHref = (prop.actor_link.includes(":") ? "" : "@") + prop.actor_link
    if (displayActorLinkHref == "@") displayActorLinkHref = ""
                        
    let displayActorLinkName = (displayActorLinkHref == "") ? "" : ("@" + displayActorLinkHref.split("/").pop())
                        
                        
    let displayCreatorLinkHref = prop.creator_link
    let displayCreatorLinkName = (displayCreatorLinkHref == "") ? "" : ((displayCreatorLinkHref.startsWith("https://twitter.com/")) ? `@${displayCreatorLinkHref.split("/").pop()}` : `(링크)`)
    
    let tdtemplate = template`<tr><td class="tableFormLabel" style="color:#888">${0}</td><td style="color:#333">${1}</td></tr>`
    
    let output = `<dummycentre><bigfurbox>`
    
    let actorLinkFull = `<a href="${displayActorLinkHref}" target="_blank" rel="noopener noreferrer">${displayActorLinkName}</a>`
    let creatorLinkFull = (prop.creator_name == "자작") ? actorLinkFull : `<a href="${displayCreatorLinkHref}" target="_blank" rel="noopener noreferrer">${displayCreatorLinkName}</a>`
    
    output += `<imgbox>`
    
    if (prop.photo)
        output += `<img src="${prop.photo}" />`
    else
        output += `<img src="no-image-available.png" />`
    
    if (prop.photo_copying)
        output += `<copying>&#169; ${prop.photo_copying}</copying>`
    
    output += `</imgbox>`
    
    output += `<parbox>`
    output += `<refsheetflexwrapper>`
        
        output += `<refselem1>`
        output += `<table>`
        output += `<thead><tr><th colspan="2">`
        output += `<h4 style="font-size: 20px">${displayFurName} ${displayFurNameJa}</h4>`
        if (furAliases.length > 0)
            output += `<h5>${furAliases.replaceAll('/', '<br />')}</h5>`
        output += `</th></tr></thead>`
        output += tdtemplate(i18n[lang].SimpleSearchSpecies, prop.species_ko)
        output += tdtemplate(i18n[lang].SimpleSearchStyle, prop.style.replaceAll('?',''))
        output += tdtemplate(i18n[lang].SimpleSearchActor, displayActorName + `&nbsp; ${actorLinkFull}`)
        output += tdtemplate(i18n[lang].SimpleSearchCreator, displayCreatorName + `&nbsp; ${creatorLinkFull}`)
        output += tdtemplate(i18n[lang].SimpleSearchBirthday2, prop.birthday)
        output += `</table>`
        
        output += `</refselem1>`
        
        if (prop.ref_sheet) {
            output += `<img class="refsElem2" src="${prop.ref_sheet}" />`
            if (prop.ref_sheet_copying)
                output += `<copying>&#169; ${prop.ref_sheet_copying}</copying>`
        }
        else
            output += `<p style="color:#AAA; text-align:center">(레퍼런스 시트가 없어요)</p>`
        
    output += `</refsheetflexwrapper>`
    output += `</parbox>`
    
    output += `</bigfurbox></dummycentre>`
    
    document.getElementById("moreinfo_overlay").innerHTML = output
    document.getElementById("moreinfo_overlay").style.display = "block"
}
function hideOverlay() {
    document.getElementById("moreinfo_overlay").style.display = "none"
}

function makeOutput(searchResults) {
    let output = `<p>${i18n[lang].ThisManySearchResults(searchResults.length)}</p>`
    
    searchResults.forEach(it => {
        let id = it.id
        let prop = it.prop
        
        let displayFurName = textOrQos((prop.name_ko + " " + prop.name_en).trim())
            
        let displayFurNameJa = (prop.name_ja).trim()
                            
        let furAliases = (prop.aliases).trim()
        if (furAliases == "") furAliases = String.fromCharCode(0x3000)
                            
        let actorName = (prop.actor_name).trim()
                            
        let displayActorName = textOrQos(actorName.split("/").shift())
                            
        let displayActorLinkHref = (prop.actor_link.includes(":") ? "" : "@") + prop.actor_link
        if (displayActorLinkHref == "@") displayActorLinkHref = "???"
                            
        let displayActorLinkName = displayActorLinkHref.split("/").pop()
                            
        let displayCreatorName = textOrQos((prop.creator_name).trim().replace("/자작", ""))
        if (displayCreatorName == "자작") displayCreatorName = displayActorName
                            
        let displayCreatorLinkHref = prop.creator_link
                                  
        output += `<furbox>`
        output += `<imgbox onclick="showOverlay(${id})">`
        
        if (prop.photo)
            output += `<img src="${prop.photo}" />`
        else if (prop.ref_sheet)
            output += `<img src="${prop.ref_sheet}" />`
        else
            output += `<img src="no-image-available.png" />`
            
        output += `</imgbox>`
        output += `<infobox>`
        output += `<h4 title="${(furAliases.length == 0) ? `${displayFurName} ${displayFurNameJa}`.trim() : `${displayFurName} ${displayFurNameJa} (${furAliases})`}">${displayFurName}</h4>`
        output += `<h5 title="${actorName}">${displayActorName}<br /><a href="${displayActorLinkHref}" target="_blank" rel="noopener noreferrer">${displayActorLinkName}</a></h5>`
        output += `<h5>${i18n[lang].MadeBy + ((displayCreatorLinkHref.length == 0) ? displayCreatorName : `<a href="${displayCreatorLinkHref}" target="_blank" rel="noopener noreferrer">${displayCreatorName}</a>`)}</h5>`
        output += `</infobox></furbox>`
    })
    
    document.getElementById("searchResults").innerHTML = output
}

function clearResults() {
    document.getElementById("searchResults").innerHTML = `<p>&nbsp;</p><p style="text-align: center; font-style: oblique; color: #777">(검색 결과가 여기 표시됩니다)</p>`
}

function simplequery() {
    let creatorName = document.getElementById("simplesearch_input_creatorname").value
    if (creatorName == "") creatorName = undefined
    let furName = document.getElementById("simplesearch_input_furname").value
    if (furName == "") furName = undefined
    let birthdayFrom = document.getElementById("simplesearch_input_bday_from").value
    if (birthdayFrom == "") birthdayFrom = undefined
    let birthdayTo = document.getElementById("simplesearch_input_bday_to").value
    if (birthdayTo == "") birthdayTo = undefined
    let species = document.getElementById("simplesearch_dropdown_species").value
    if (species == "dont_care") species = undefined
    let isPartial = document.getElementById("simplesearch_input_is_partial").value
    if (isPartial == "dont_care") isPartial = undefined
    let style = document.getElementById("simplesearch_input_style").value
    if (style == "dont_care") style = undefined
    
    let searchFilter = {}
    
    let colourCombi = ["_background","1","2","3"].map(s => {
        let t = document.getElementById(`simplesearch_colour${s}`).value
        return (t == "dont_care") ? undefined : t
    })
    // special treatment for colourCombi because 0th elem must be nullable, but others must be "collapsed"
    colourCombi = [colourCombi[0]].concat(colourCombi.tail().filter(it => it != undefined))
    
    let hairCols = ["_dye","_streak"].map(s => {
        let t = document.getElementById(`simplesearch_hair${s}`).value
        return (t == "dont_care") ? undefined : t
    }) // there are only two of them, and both must be nullable
    
    let eyeCols = ["_sclera",""].map(s => {
        let t = document.getElementById(`simplesearch_eyes${s}`).value
        return (t == "dont_care") ? undefined : t
    }).filter(it => it !== undefined)
        
    if (creatorName !== undefined) searchFilter.creator_name = creatorName
    if (furName !== undefined) searchFilter.name = furName
    if (birthdayFrom !== undefined) searchFilter.birthday_from = birthdayFrom
    if (birthdayTo !== undefined) searchFilter.birthday_to = birthdayTo
    if (isPartial !== undefined) searchFilter.is_partial = isPartial
    if (species !== undefined) searchFilter.species_ko = dropdownIdToDBname[species]
    if (style !== undefined) searchFilter.style = style

    if (colourCombi.length > 0) searchFilter.colours = colourCombi
    if (eyeCols.length > 0) searchFilter.eyes = eyeCols
    if (hairCols.length > 0) searchFilter.hairs = hairCols
        
    let includeWIP = document.getElementById("includewip_simple").checked
    
    makeOutput(performSearch(searchFilter, "simple", false, includeWIP))
}

function query() {
    let query = document.getElementById("searchtags").value
    let exactMatch = document.getElementById("exactmatch").checked
    let includeWIP = document.getElementById("includewip").checked
    
    makeOutput(performSearch(parseSearchTags(query), "tags", exactMatch, includeWIP))
}

/*
Composes searchFilter by obtaining key-value pair from Danbooru tagging syntax
단부루식 태그 문법에서 key와 value를 분리해 searchFilter를 만듦
 */
function parseSearchTags(searchstrr) {
    let searchstr = searchstrr.trim()
    
    if (searchstr.length == 0) return undefined
    
    let tokens = searchstr.split(' ')
    let searchFilter = new Object()
    // populate searchfilter object
    tokens.forEach(v => {
        // example tag: "creator:DIY"
        // split key-value
        let kvpair = v.split(':')
        
        if (kvpair[0].startsWith("name_")) kvpair[0] = "name" // 이름 언어 구분 제거
        
        searchFilter[kvpair[0]] = kvpair[1]
    })

    return searchFilter
}

// 문자열을 검색하기 좋게 소문자로 바꾸고 띄어쓰기와 언더스코어를 없앰 (언더스코어는 사용자가 검색어에 띄어쓰기 대신 집어넣을 가능성 있음)
String.prototype.babostr = function() {
    return this.toLowerCase().replaceAll(" ","").replaceAll("_","")
}

/*
Perform search on the database (JSON)
JSON DB에서 검색 수행

May modify this code to perform searching by sending SQL query to real database
이 소스를 수정해 데이터베이스에 쿼리를 날리는 식으로 동작을 변경할 수 있음

## 검색 필터 규약

아래의 예시 필터를 보자:

filter = {
    "creator_name": "블루폭스",
    "species_ko": ["개","늑대"]
}

- 키값이 undefined여서는 안 됨
- 키값의 type이 array일 때에는, 그 조건에 한해 OR조건으로 처리
- 키값의 type이 object여서는 안 됨
- 이 외 type의 키값은 표준 매칭 방식을 따름

## 표준 매칭 방식

exactMatch가 참일 경우 문자열이 정확히 일치하는지를 검사, 그렇지 않으면 필터키값이 DB값의 일부인지 검사함

 */
const nameSearchAliases = ["name_ko", "name_en", "name_ja", "aliases"]
const pseudoCriteria = {"name":1}
const specialSearchTags = {"birthday_from":1, "birthday_to":1}
const arraySearchSpecial = {"colours":1, "hairs":1, "eyes":1, "species_ko":1}
const alwaysExactMatch = {"species_ko":1}
function performSearch(searchFilter, referrer, exactMatch, includeWIP) {
    let isSearchTagEmpty = searchFilter === undefined
    let foundFurs = [] // contains object in {id: (int), prop: (object)}

    let birthdayFrom = undefined
    let birthdayTo = undefined
    if (!isSearchTagEmpty) {
        birthdayFrom = searchFilter.birthday_from
        birthdayTo = searchFilter.birthday_to
    }
    
    //console.log(searchFilter)
    //console.log(exactMatch)
    
    for (const furid in furdb) {
        if (isNaN(furid)) continue
        
        let searchMatches = true
                
        // do not check for conditions if search term is empty -> will put every fursuits onto foundFurs
        // 검색 태그가 비어있으면 조건 검사를 하지 않음 -> searchMatches의 초기값이 참이기 때문에 모든 털들을 foundFurs에 집어넣게 됨
        if (!isSearchTagEmpty) {
            for (const searchCriterion in searchFilter) {

                try {
                    //console.log(`searchCriterion = ${searchCriterion}`)
                    // check if the tag is valid
                    // 태그가 올바른지 검사
                    if (searchCriterion in furdb[furid] || searchCriterion in pseudoCriteria || searchCriterion in specialSearchTags) {
                        const arraySearchMode = Array.isArray(searchFilter[searchCriterion])
                        
                        //console.log(`arraySearchMode = ${arraySearchMode}`)
                        //console.log(searchFilter[searchCriterion])
                        
                        // 검색어 sanitise
                        let searchTerm = undefined
                        if (arraySearchMode) {
                            searchTerm = searchFilter[searchCriterion].map(it => (it === undefined) ? it : it.babostr())
                        }
                        else {
                            searchTerm = searchFilter[searchCriterion].babostr()
                        }
                        
                        // disambiguate search term if the criterion is creator_name
                        // 메이커 검색어의 동음이의 처리
                        if (searchCriterion == "creator_name") {
                            if (arraySearchMode) {
                                searchTerm = searchTerm.map(it => (creatorThesaurus[it] !== undefined) ? creatorThesaurus[searchTerm].babostr() : it)
                            }
                            else {
                                if (creatorThesaurus[searchTerm] !== undefined) {
                                    searchTerm = creatorThesaurus[searchTerm].babostr()
                                }
                            }
                        }
                           
                        let matching = furdb[furid][searchCriterion]
                                                      
                        if (arraySearchMode) {
                            // some tags want AND match, not OR
                            if (searchCriterion in arraySearchSpecial) {
                                if (searchCriterion == "species_ko") {
                                    // tokenise using space, and OR-match each token by checking if (token === one of the searchword)
                                    let tokens = matching.split(' ')
                                    searchMatches &= tokens.map(tok => searchTerm.map(word => (tok === word))).flat().some(it => it)
                                }
                                else if (searchCriterion == "colours") {
                                    // index 0 must match the 0th search term; anything goes for 1st or more
                                    let baseColMatches = (searchTerm[0] === undefined) ? true : matching[0] === searchTerm[0]
                                    
                                    let partialMatch = (searchTerm[1] === undefined)
                                    searchTerm.tail().forEach(it => {
                                        partialMatch |= matching.tail().includes(it)
                                    })
                                    searchMatches &= baseColMatches & partialMatch
                                }
                                else if (searchCriterion == "hairs") {                                    
                                    let base = searchTerm[0]
                                    let streak = searchTerm[1]
                                    
                                    let baseMatches = (base === undefined) ? true :
                                        (base == "none") ? (!matching[0]) :
                                        (base == "any") ? (!!matching[0]) : // trust me, '!!' is required
                                            (base == matching[0])
                                    let streakMatches = (streak === undefined) ? true :
                                        (streak == "none") ? (!matching[1]) :
                                        (streak == "any") ? (!!matching[1]) : // trust me, '!!' is required
                                            (streak == matching[1])

                                    searchMatches &= baseMatches & streakMatches
                                }
                                else {
                                    let partialMatch = true
                                    searchTerm.forEach(it => {
                                        partialMatch &= matching.includes(it)
                                    })
                                    searchMatches &= partialMatch
                                }
                            }
                            else {
                                let partialMatch = false
                                searchTerm.forEach(it => {
                                    partialMatch |= (searchCriterion in alwaysExactMatch || exactMatch) ? (matching.babostr() == it) : matching.babostr().includes(it)
                                })
                                searchMatches &= partialMatch
                            }
                        }
                        else {
                            // 이름은 한/영/일/이명에 대해서도 검색해야 함
                            if (searchCriterion == "name") {
                                let partialMatch = false
                                nameSearchAliases.forEach(it => {
                                    partialMatch |= furdb[furid][it].babostr().includes(searchTerm)
                                })
                                searchMatches &= partialMatch
                            }
                            else {
                                searchMatches &= (searchCriterion in alwaysExactMatch || exactMatch) ? (matching.babostr() == searchTerm) : matching.babostr().includes(searchTerm)
                            }
                        }
                        
                        // 위 대입 식이 searchMatches에 AND하기 때문에 모든 조건을 만족해야만 searchMatches가 최종적으로 true가 됨
                        // OR로 하려면 let searchMatches = false 하고 searchMatches |= ... 하면 됨
                    }
                    // display error message if the tag is not valid
                    // 올바르지 않은 태그면 에러창 띄움
                    else if (!(searchCriterion in specialSearchTags)) {
                        //console.log(i18n[lang].TagSyntaxError + searchCriterion)
                        alert(i18n[lang].TagSyntaxError + searchCriterion)
                        return undefined
                    }
                }
                catch (e) {
                    console.log(e)
                    console.log(e.stack)
                }
            }
            
            // 활동개시일 조건은 별도로 검사
            // check birthday condition here
            if ((birthdayFrom !== undefined || birthdayTo !== undefined) && furdb[furid].birthday.length < 1) {
                searchMatches = false
            }
            if (
                ((birthdayFrom !== undefined && birthdayTo !== undefined) && (furdb[furid].birthday < birthdayFrom || furdb[furid].birthday > birthdayTo)) ||
                (birthdayFrom !== undefined && furdb[furid].birthday < birthdayFrom) ||
                (birthdayTo !== undefined && furdb[furid].birthday > birthdayTo)
            ) {
                searchMatches = false
            }
        }

        
        // do not return "hidden" furs /  hidden인 퍼슈트는 반환하지 않음
        if (searchMatches && !furdb[furid].is_hidden && (includeWIP || furdb[furid].is_done)) {
            foundFurs.push({id: furid, prop: furdb[furid]})
        }
    }

    return foundFurs
}
