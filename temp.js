function chkdet(a) {
    var cmprstr = arr[2].replace(/[^a-zA-Z0-9 ]/g, "");
    var cmprarr = cmprstr.split(" ");
    var fndflg = false;
    for (var i = 0; i < a.results.length; i++) {
        var wrdarr = a.results[i].description.replace(/[^a-zA-Z0-9 ]/g, "").split(" ");        
        wrdarr = compact.compact(wrdarr);

        for (var j = 0; j < wrdarr.length; j++) {
            var strs = ""

            if (j + (cmprarr.length - 1) <= wrdarr.length) {
                k = j + (cmprarr.length - 1);
                l = j;
                while (l < k) {
                    strs += wrdarr[l] + " ";
                    l++;
                }
                if (lev.get(strs, cmprstr) < 5) {
                    fndflg = true;
                    //var classcat=a.results[i].classes;

                    console.log(strs + " " + cmprstr + " " + a.results[i].uri);
                }


            }
        }
        var catgidx = a.results[i].categories;
        if (fndflg === false) {
            for (var m = 0; m < catgidx.length; m++) {
                var tmpstrr = catgidx[m].label.replace(/[^a-zA-Z0-9 ]/g, "");
                var wrdarru = tmpstrr.split(" ");
                var wrdarry = compact.compact(wrdarru);
                for (var v = 0; v < wrdarry.length; v++) {
                    var strs = ""

                    if (v + (cmprarr.length - 1) <= wrdarry.length) {
                        k = v + (cmprarr.length - 1);
                        l = v;
                        while (l < k) {
                            strs += wrdarry[l] + " ";
                            l++;
                        }
                        //console.log(strs+ " "+cmprstr+" "+lev.get(strs, cmprstr))
                        if (lev.get(strs, cmprstr) < 5) {
                            fndflg = true;
                            console.log(">>" + catgidx.uri);
                        }
                    }
                }


            }
        } else
            fndflg = false;
    }

}