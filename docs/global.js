window.xhr = (reqContent, url, options = {}, callback) => {
    return new Promise((resolve, reject) => {
        if (typeof options == "function") callback = options;
        if (typeof options == "function") options = {};
        if (options.type == undefined)        options.type = "POST";
        if (options.contentType == undefined) options.contentType = "json";
        var xhr = new XMLHttpRequest();
        xhr.open(options.type, url, true);
        if (options.type == "GET") {
            xhr.send();
        } else if (options.contentType == "form") {
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send("data="+JSON.stringify(reqContent));
        } else if (options.contentType == "json") {
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify(reqContent));
        } else if (options.contentType == "none") {
            xhr.send(reqContent);
            // for file uploads (multipart/form-data)
        } else if (options.contentType) {
            xhr.setRequestHeader("Content-type", options.contentType);
            xhr.send(reqContent);
        }
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                let res = JSON.parse(this.responseText);
                let err = null;
                if (!String(this.status).startsWith("2")) {
                    console.error("HTTP error "+this.status);
                    err = this.status;
                }
                if (err) reject(err);
                else resolve(res);
                if (callback) callback(res, err);
            }
        };
        // resolve(5);
    });
}
var YTapiKey = "AIzaSyBnQnpboWUfWyR8aW6HuQV5MAlxZ5FQ090";
var maxResults = 6;

(function Video() {

    var url = "https://www.googleapis.com/youtube/v3/playlistItems"
    +"?key="+YTapiKey
    +"&part=snippet"
    +"&maxResults="+maxResults
    +"&playlistId=";
    var personalURL = url+"UUy6jcAF6fZGttRvihyQixbA";
    var commissionsURL = url+"PL84-DNDSU8p5WP6jA7hvOCV9dIKBNjdCS";
    var personal = xhr(null, personalURL, {type: "GET"});
    var commissions = xhr(null, commissionsURL, {type: "GET"});
    Promise.all([personal, commissions]).then((results) => {
        console.log("==--==--==--> YouTube Personal + Commissions");
        console.log(results);
        // combine video and commission responses
        var items = results[0].items.concat(results[1].items);
        items.sort(function(a, b) {
            var dateA = new Date(a.snippet.publishedAt);
            var dateB = new Date(b.snippet.publishedAt);
            return dateB - dateA; // sort by date ascending
        });
        items = items.splice(0, maxResults);
        for (var i = 0; i < items.length; i++) {
            var url = items[i].snippet.resourceId.videoId;
            var img = items[i].snippet.thumbnails.high.url;
            var title = items[i].snippet.title;
            var item = document.querySelector("section.video .thumbnails a.item:nth-child("+(i+1)+")");
            item.setAttribute("href", "https://www.youtube.com/watch?v="+url);
            item.querySelector("img").setAttribute("src", img);
        }
        document.querySelector("section.video").classList.remove("hidden");

    }, (err) => {
        throw Error("Could not fetch YouTube playlistItems");
        console.log(err);
    });

})();

(function Synctan() {

    var url = "https://www.googleapis.com/youtube/v3/playlistItems"
    +"?key="+YTapiKey
    +"&part=snippet"
    +"&maxResults="+maxResults
    +"&playlistId=UUoMimPRPeR28TM3_0cinjVQ";
    xhr(null, url, {type: "GET"}).then((result) => {
        console.log("==--==--==-->YouTube Synctan");
        console.log(result);
        var items = result.items;
        for (var i = 0; i < items.length; i++) {
            var url = items[i].snippet.resourceId.videoId;
            var img = items[i].snippet.thumbnails.high.url;
            var title = items[i].snippet.title;
            var item = document.querySelector("section.synctan .thumbnails a.item:nth-child("+(i+1)+")");
            item.setAttribute("href", "https://www.youtube.com/watch?v="+url);
            item.querySelector("img").setAttribute("src", img);
        }
        document.querySelector("section.synctan").classList.remove("hidden");
    }, (err) => {
        throw Error("Could not fetch YouTube playlistItems");
        console.log(err);
    });

})();

$(document).ready(() => {

(function Lacuna() {

    // Lacuna
    var clientID = "6ibYZTmF5qnpvp88S9V3werVrC18WCdC";
    var url = "http://api.soundcloud.com/users/247370320/tracks"
        +"?limit="+maxResults
        +"&client_id="+clientID;
    xhr(null, url, {type: "GET"}).then((tracks) => {
        console.log("==--==--==--> SoundCloud Lacuna");
        console.log(tracks);
        for (var i = 0; i < tracks.length; i++) {
            var url = tracks[i].permalink_url;
            var img = tracks[i].artwork_url.replace("large", "t300x300");
            var item = $("section.lacuna .thumbnails a.item:nth-child("+(i+1)+")");
            item.attr("href", url);
            item.find("img").attr("src", img);
        }
        $("section.lacuna").removeClass("hidden");
    }, (err) => {
        throw Error("Could not fetch SoundCloud tracks");
        console.log(err);
    });

})();

// discord/email popups
$(document).on("click", function(e) {

    if ($(e.target).hasClass("has-popup") || $(e.target).hasClass("popup")) {
        if ($(e.target).find("input").hasClass("hidden")) {
            // hidden
            $("a.has-popup input").addClass("hidden");
            $(e.target).find("input").select().removeClass("hidden");
        } else {
            // not hidden
            $(e.target).find("input").addClass("hidden");
        }
    } else {
        // clicked anywhere
        $("a.has-popup input").addClass("hidden");
    }

});

});
