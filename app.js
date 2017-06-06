var request = require('request');
var http = require('http');
var https = require('https');
var jsonlint = require('jsonlint');
var jsonlint = require('fuzzyset.js');
var compact = require('underscore');
var lev = require('fast-levenshtein');
var tabletojson = require('tabletojson');
var cheerio = require('cheerio');
var jsonQuery = require('json-query')
var durableJsonLint = require('durable-json-lint');
var jp = require("jsonpath");
var sw = require("stopword");
//var song = '"Never Gonna Fall in Love Again" by Eric Carmen (iTunes)';
//var song = '"From a Distance" by Bette Midler (iTunes)';
//var song = '"Can\'t Smile Without You" by Barry Manilow (iTunes)';
//var song = '"Smoke Gets in Your Eyes" by The Platters (iTunes)';
//var song = '"Nina, Pretty Ballerina" by ABBA (iTunes);'
//var song = 'Ritchie Valens ~ Come On Let\'s Go (HQ)';
//var song = 'Lovely Sunny Day - Demis Roussos';
//var song = 'Mary Hopkin - Goodbye (1969)';
//var song='Annette Funicello (Calendar Girl)';
//var song = 'Oh What a Night - Frankie Valli & Gerry Polci - HQ best quality';
//var song = 'Diana Ross & The Supremes - Stop! In The Name Of Love';
//var song='Ronettes - Be My Baby - (Remastered Video & Stereo Music - 1965) - Bubblerock - HD';
//var song='Firehouse - I Live My Life for You';
var song='Firehouse - When I Look Into Your Eyes';
//var song="Johnny Mathis - We're All Alone";

// function getlookup(tmp, callbackfunc) {
//     var lookupOptions = {
//         host: 'lookup.dbpedia.org',
//         path: '/api/search.asmx/KeywordSearch?QueryString=' + encodeURIComponent(tmp),
//         method: 'GET',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         }
//     }

//     http.request(lookupOptions, function (res) {
//         var stra = '';
//         res.setEncoding('utf8');
//         res.on('data', function (data) {
//             stra += data;
//         });
//         res.on('end', function () {
//             var retval = chkdet(JSON.parse(stra));
//             callbackfunc(retval);
//         });
//     }).end();
// }

// function chkdet(a) {
//     var artist = arr[2].replace(/[^a-zA-Z0-9 ]/g, "");

//     for (var i = 0; i < a.results.length; i++) {
//         var fndflg = false;
//         fndflg = arrfunc(cnvr2arr(a.results[i].description), artist);

//         if (fndflg === true) {
//             var classidx = a.results[i].classes;
//             var classflg = false;
//             for (var k = 0; k < classidx.length; k++) {
//                 if (classidx[k].label === 'single') {
//                     classflg = true;
//                     return JSON.parse('{"uri":"' + a.results[i].uri + '", "artist":"' + artist + '"}');
//                 }
//             }
//             if (classflg === false) {
//                 fndflg = false;
//             }
//         }


//         var catgidx = a.results[i].categories;
//         if (fndflg === false) {
//             for (var m = 0; m < catgidx.length; m++) {
//                 fndflg = arrfunc(cnvr2arr(catgidx[m].label), artist);
//                 if (fndflg === true) {
//                     return JSON.parse('{"uri":"' + a.results[i].uri + '", "artist":"' + artist+ '"}');
//                 }
//             }
//         } else {
//             fndflg = false;
//         }
//     }
//     if (a.results.length>0)  
//         return JSON.parse('{"uri":"' + a.results[0].uri + '", "artist":"' + artist+ '"}');
// }
//http://dbpedia.org/sparql?output=json&query=SELECT%20Distinct%20*%20Where%20{%20?resource%20dbo:abstract%20?abstract.%20?resource%20dct:subject%20?subject.%20Filter%20langMatches(lang(?abstract),%22EN%22).%20?abstract%20bif:contains%20%22Biggest_Part_of_Me%22.%20}
function getlookup(song, artist, artistfrm, callbackfunc) {
    var sparqltmp = 'SELECT Distinct * Where { ?resource dbo:abstract ?abstract. ?resource dct:subject ?subject. Filter langMatches(lang(?abstract),"EN"). ?abstract bif:contains "' + artistfrm + ' AND \'song\'".}'
    var lookupOptions = {
        host: 'dbpedia.org',
        path: '/sparql?output=json&query=' + encodeURIComponent(sparqltmp),
        method: 'GET'
    }
    console.log(lookupOptions);
    console.log(sparqltmp);
    console.log(lookupOptions.host + lookupOptions.path);
    http.request(lookupOptions, function (res) {
        var stra = '';
        res.setEncoding('utf8');
        res.on('data', function (data) {
            stra += data;
        });
        res.on('end', function () {
            var retval = chkdet(JSON.parse(stra), song, artist);
            callbackfunc(retval);
        });
    }).end();
}


function chkdet(t, song, artist) {
    var a = t.results.bindings;
    var fndflgsong = false;
    var maxlen = 0;
    var maxstr;
    var uri;
    for (var i = 0; i < a.length; i++) {
        var cmprstr = cnvr2arr(/^(?:.*\/)(.*)/.exec(a[i].resource.value)[1], "_");
        var tmp = findLongestCommonSubstring_Quick(cmprstr, cnvr2arr(song, " "));
        if (tmp.length > maxlen) {
            maxlen = tmp.length;
            maxstr = tmp;
            uri = a[i].resource.value;
        }
    }
    if (maxlen > 0)
        return JSON.parse('{"uri":"' + uri + '", "song":"' + maxstr + '", "artist":"' + artist + '"}');
    else
        return JSON.parse('{"uri":"", "song":"", "artist":""}');
}


findLongestCommonSubstring_Quick = function (a, b) {
    var longest = "";
    // loop through the first string
    for (var i = 0; i < a.length; ++i) {
        // loop through the second string
        for (var j = 0; j < b.length; ++j) {
            // if it's the same letter
            if (a[i] === b[j]) {
                var str = a[i];
                var k = 1;
                // keep going until the letters no longer match, or we reach end
                while (i + k < a.length && j + k < b.length // haven't reached end
                    &&
                    a[i + k] === b[j + k]) { // same letter
                    str = str + " " + a[i + k];
                    ++k;
                }
                // if this substring is longer than the longest, save it as the longest
                if (str.length > longest.length) {
                    longest = str
                }
            }
        }
    }
    return longest;
}


function getsection(tmp, callbackfunc) {
    var sectionlookupOptions = {
        host: 'en.wikipedia.org',
        path: '/w/api.php?format=json&action=parse&&prop=sections&page=' + /^(?:.*\/)(.*)/.exec(tmp.uri)[1],
        method: 'GET'
    }

    console.log(sectionlookupOptions.host+sectionlookupOptions.path);
    console.log(tmp.uri);
    https.request(sectionlookupOptions, function (res) {
        var stra = '';
        res.setEncoding('utf8');
        res.on('data', function (data) {
            stra += data;
        });
        res.on('end', function () {
            var retval = chksecdet(JSON.parse(stra), tmp.artist, tmp.uri);
            callbackfunc(retval);
        });
    }).end();
}

function chksecdet(a, artist, uri) {
    var secobj = a.parse.sections;
    var fndflg = false;
    var chartflg = false;
    var chartidx = -1;
    var str = [0, 0, 0];
    for (var i = 0; i < secobj.length; i++) {
        fndflg = arrfunc(cnvr2arr(secobj[i].line, " "), cnvr2arr(artist, " "), artist);

        if (fndflg === true) {
            chartidx = secobj[i].index;
            break;
        } else {
            if (chartflg === false) {
                chartflg = chartfunc(cnvr2arr(secobj[i].line, " "), cnvr2arr("Chart performance", " "), "Chart performance");
                if (chartflg === true) {
                    chartidx = secobj[i].index;
                    chartno = secobj[i].number;
                    str[0] = secobj[i].index;
                }
            }

        }
    }
    if (fndflg === false) {
        if (chartidx != -1) {
            return JSON.parse('{"chartidx":"' + chartidx + '", "uri":"' + uri + '", "artist":"' + artist + '",' + '"srchflg":true}');
        } else
            console.log("debug here");
    } else {
        return JSON.parse('{"chartidx":"' + chartidx + '", "uri":"' + uri + '", "artist":"' + artist + '",' + '"srchflg":false}');
    }
}


function gettable(tmp, callbackfunc) {
    //https://en.wikipedia.org/w/api.php?format=json&action=parse&prop=text&page=When%20Will%20I%20See%20You%20Again&section=5
    var tablelookupOptions = {
        host: 'en.wikipedia.org',
        path: '/w/api.php?format=json&action=parse&prop=text&page=' + /^(?:.*\/)(.*)/.exec(tmp.uri)[1] + '&section=' + tmp.chartidx,
        method: 'GET'
    }

    https.request(tablelookupOptions, function (res) {
        var stra = '';
        var wkflg = false;
        var yrflg = false;
        var a;
        res.setEncoding('utf8');
        res.on('data', function (data) {
            stra += data;
        });
        res.on('end', function () {
            var retval = JSON.parse(stra);
            //var retval=JSON.parse(retvall);

            var $ = cheerio.load(retval.parse.text['*']);
            if ($('table[class=multicol],tbody,tr,td').children('.wikitable').length > 0) {
                var b = JSON.parse(tablefnd(retval.parse.text['*']));
                callbackfunc(b);
            } else {
                a = JSON.parse(tablenotfnd(retval.parse.text['*']));
                var trya = jp.query(a, '$[*]');

                trya.forEach(function (entry, i) {
                    for (var subentry in entry.heading) {
                        if (arrfunc(cnvr2arr(entry.heading[subentry], " "), cnvr2arr("All time", " "), "All time")) {
                            a[i].type = "All time Chart";
                            break;
                        } else if (arrfunc(cnvr2arr(entry.heading[subentry], " "), cnvr2arr("Year", " "), "Year")) {
                            a[i].type = "Yearly Chart";
                            break;
                        } else if (arrfunc(cnvr2arr(entry.heading[subentry], " "), cnvr2arr("Chart", " "), "Chart")) {
                            a[i].type = "Weekly Chart";
                            break;
                        }
                    };
                });
                callbackfunc(a);
            }
        });
    }).end();
}

function tablenotfnd(tmp) {
    $ = cheerio.load(tmp);
    var arrth = [];
    var arrtd = [];
    var heading = "";
    var cmstr = '[';
    var tblflg = false;
    $('table').each(function (i, elem) {

        if (arrfunc(cnvr2arr(elem.attribs.class, " "), cnvr2arr("wikitable", " "), "wikitable") === true) {
            cmstr += '{"type":"empty",'
            for (var i = 0; i < elem.children.length; i++) {
                if ((elem.children[i].type === "tag") && (elem.children[i].name === "tr")) {
                    var tmp = elem.children[i]
                    for (var j = 0; j < tmp.children.length; j++) {
                        if ((tmp.children[j].type === "tag") && (tmp.children[j].name === "th")) {
                            var tmpstr = recursefrtxt(tmp.children[j]);
                            arrth.push(tmpstr);
                            tblflg = true;
                        } else if ((tmp.children[j].type === "tag") && (tmp.children[j].name === "td")) {
                            var tmpstr = recursefrtxt(tmp.children[j]);
                            arrtd.push([arrth[arrtd.length], tmpstr]);
                        }
                    }
                    if (tblflg === true) {
                        if (/},$/g.test(cmstr))
                            cmstr = cmstr.replace(/},$/g, '}],')
                        var tmpstr = '"heading":[';
                        arrth.forEach(function (entry, d) {
                            if (d + 1 === arrth.length)
                                tmpstr += ('"' + entry + '"');
                            else
                                tmpstr += ('"' + entry + '",');
                        });
                        tmpstr += '],"data":[';
                        cmstr += tmpstr;
                        tblflg = false;
                    }
                    tmpstr = '{';
                    arrtd.forEach(function (entry, d) {
                        if (d + 1 === arrtd.length)
                            tmpstr += ('"' + entry[0] + '":"' + entry[1] + '"');
                        else
                            tmpstr += ('"' + entry[0] + '":"' + entry[1] + '",');
                    });
                    tmpstr += '},';
                    cmstr += tmpstr;
                    arrtd = [];
                }
            }
            cmstr += ']},';

            arrth = [];
        }

    });
    cmstr += ']';

    var k = chkjson(cmstr);
    return k;
}

function tablefnd(tmp) {
    $ = cheerio.load(tmp);
    var fndh3flg = false;
    var arrth = [];
    var arrtd = [];
    var retk = "";
    var cmstr = "[";
    var tblflg = false;
    $('table[class=multicol],tbody,tr,td').children().each(function (i, elem) {
        if (elem.name === 'h3') {
            cmstr = ('{"type":"' + recursefrtxt(elem) + '",');
            fndh3flg = true;
        } else if ((elem.name === "table") && (fndh3flg === true)) {
            cmstr += cmstr;
            for (var i = 0; i < elem.children.length; i++) {
                if ((elem.children[i].type === "tag") && (elem.children[i].name === "tr")) {
                    var tmp = elem.children[i];
                    for (var j = 0; j < tmp.children.length; j++) {
                        if ((tmp.children[j].type === "tag") && (tmp.children[j].name === "th")) {
                            var tmpstr = recursefrtxt(tmp.children[j]);
                            arrth.push(tmpstr);
                            tblflg = true;
                        } else if ((tmp.children[j].type === "tag") && (tmp.children[j].name === "td")) {
                            var tmpstr = recursefrtxt(tmp.children[j]);
                            arrtd.push([arrth[arrtd.length], tmpstr]);
                        }
                    }

                    if (tblflg === true) {
                        if (/},$/g.test(cmstr))
                            cmstr = cmstr.replace(/},$/g, '}],')
                        var tmpstr = '"heading":[';
                        arrth.forEach(function (entry, d) {
                            if (d + 1 === arrth.length)
                                tmpstr += ('"' + entry + '"');
                            else
                                tmpstr += ('"' + entry + '",');
                        });
                        tmpstr += '],"data":[';
                        cmstr += tmpstr;
                        tblflg = false;
                    }

                    var tmpstr = '{';
                    arrtd.forEach(function (entry, d) {
                        if (d + 1 === arrtd.length)
                            tmpstr += ('"' + entry[0] + '":"' + entry[1] + '"');
                        else
                            tmpstr += ('"' + entry[0] + '":"' + entry[1] + '",');
                    });
                    tmpstr += "},";
                    cmstr += tmpstr;
                    arrtd = [];

                }
            }
            cmstr += "]},";
            fndh3flg = false;
        } else if (fndh3flg === true) {
            fndh3flg = false;
        }
        retk += cmstr;
        cmstr = "";
    });
    retk += "]";
    retk = chkjson(retk);
    return retk
}

function chkjson(jsonstr) {
    jsonstr = jsonstr.replace(/\,(?!\s*[\{|\[\"\w])/g, "");
    jsonstr = jsonstr.replace(/{},?/g, "");
    jsonstr = jsonstr.replace(/^"(.*)"$/, '$1');
    return jsonstr;
}

function recursefrtxt(elem) {
    var str = "";
    for (var i = 0; i < elem.children.length; i++) {
        if (elem.children[i].type === "text") {
            str += elem.children[i].data;
        } else if (elem.children[i].type === "tag") {
            str += recursefrtxt(elem.children[i]);
        }
    }
    return str.replace(/\r?\n|\r/g, " ");
}

function arrfunc(wrdarr, cmprarr, artist) {
    for (var j = 0; j < wrdarr.length; j++) {
        var strs = ""

        if (j + (cmprarr.length - 1) < wrdarr.length) {
            k = j + cmprarr.length;
            l = j;
            while (l < k) {
                strs += wrdarr[l] + " ";
                l++;
            }
            if (lev.get(strs, cmprarr.join(" ")) < 4)
                return true;
        }
    }
    return false;
}


function chartfunc(wrdarr) {
    var cnt = 0;
    for (var ele in wrdarr) {
        switch (wrdarr[ele].toLowerCase()) {
            case 'performance':
                {
                    cnt++
                    if (cnt >= 2)
                        return true;
                    else
                        break;
                }
            case 'chart':
                {
                    cnt++
                    if (cnt >= 1)
                        return true;
                    else
                        break;
                }
            case 'charts':
                {
                    cnt++
                    if (cnt >= 1)
                        return true;
                    else
                        break;
                }
        }
    }

    return false;
}



function cnvr2arr(tmp, splitstr) {
    if (tmp == null)
        tmp = " ";
    if (splitstr === "_")
        var wrdarry = tmp.toLowerCase().replace(/[-]/, " ").replace(/[^a-zA-Z0-9_' ]/g, "").split(splitstr);
    else
        var wrdarry = tmp.toLowerCase().replace(/[-]/, " ").replace(/[^a-zA-Z0-9' ]/g, "").split(splitstr);
    wrdarry = compact.compact(wrdarry);
    return wrdarry;
}

function gettitle(strtmp, callbackfunc) {

    var parsetitle = {
        host: 'localhost',
        port: 3000,
        path: '/api/qrytitle?title=' + encodeURIComponent(strtmp),
        method: 'GET'
    }

    http.request(parsetitle, function (res) {
        var stra = "";
        res.setEncoding('utf8');
        res.on('data', function (data) {
            stra += data;
        });
        res.on('end', function () {
            callbackfunc(stra);
        });
    }).end();
}

gettitle(song, function (a) {
    a = JSON.parse(a)
    var strsngrfrm = "";


    for (d in a.singer) {
        if (strsngrfrm === "")
            strsngrfrm = "('" + a.singer[d].replace(/[']+/g, "''") + "'";
        else
            strsngrfrm = strsngrfrm + " OR '" + a.singer[d].replace(/[']+/g, "''") + "'";
    };
    strsngrfrm = strsngrfrm + ")";
    getlookup(a.song, a.singer,strsngrfrm, function (jsonobj) {
        getsection(jsonobj, function (secobj) {
            gettable(secobj, function (tableobj) {
                console.log(tableobj);
            });
        });
    });
});