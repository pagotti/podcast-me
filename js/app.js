/*

2015 By Vagner Pagotti (@skeletony)
MIT License

*/

var page = 1, maxPage = 3;

function navigate(i) {
    beforePage(i);

    $("[data-page]").each(function () {
        if ($(this).data("page") === page) {
            $(this).addClass("hide");
        }
    });
    
    page += i;
        
    $("[data-page]").each(function() {
        if ($(this).data("page") === page) {
            $(this).removeClass("hide");
        }
    });
    
    afterPage(i);
    
    // refresh pager
    if (page === 1)
        $("#previous").addClass("hide");
    else
        $("#previous").removeClass("hide");
    if (page === maxPage)
        $("#next").addClass("hide");
    else
        $("#next").removeClass("hide");
}

function captureUrl(v) {
    var re, match;
    re = /url\(('?[^']+'?|"?[^"]+"?)\)/gi;
    match = re.exec(v);
    if (match) {
        return match[1];
    }
}

function capturePixel(v) {
    var re, match;
    re = /([0-9]+)px/gi,
    match = re.exec(v);
    if (match)  {
        return match[1];
    }
}

function beforePage(i) {
    var ctx, canvas, cutter, profile, url, img, x, y, w, h;
    if (page === 1 && i > 0) {
        canvas = $("#avatarWork")[0];
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cutter = $("#cutter");
        if (cutter.hasClass("hide")) {
            ctx.drawImage($("#avatarImg")[0], 0, 0);
        } else {
            x = capturePixel(cutter.css("left"));
            y = capturePixel(cutter.css("top"));
            w = capturePixel(cutter.css("width"));
            h = capturePixel(cutter.css("height"));
            ctx.drawImage($("#avatarImg")[0], x, y, w, h, 0, 0, canvas.width, canvas.height);
        }
        
    } else if (page === 2 && i > 0) {
        canvas = $("#avatarFinal")[0];
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage($("#avatarWork")[0], 0, 0);
        profile = $("#profile");
        url = captureUrl(profile.css("background-image"));
        x = capturePixel(profile.css("left"));
        y = capturePixel(profile.css("top"));
        w = capturePixel(profile.css("width"));
        h = capturePixel(profile.css("height"));
        img = new Image();
        if (url) {
            img.onload = function() {
                ctx.drawImage(img, x, y, w, h);
            }
            img.src = url;
        }
    }
    
}

function afterPage(i) {
}

function getCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
}

function getChangedPixels(pix, color) {
    var i, r, g, b;
    r = parseInt(color.substr(1, 2), 16);
    g = parseInt(color.substr(3, 2), 16);
    b = parseInt(color.substr(5, 2), 16);
    for (i = 0; i < pix.data.length; i += 4) {
        if (pix.data[i + 3] != 0) { 
            pix.data[i] = r;
            pix.data[i + 1] = g;
            pix.data[i + 2] = b;
        }
    }
    return pix;
}

function getImageFromSelector(sel) {
    var url, w, h, canvas, ctx, img;
    url = captureUrl(sel.css("background-image"));
    w = capturePixel(sel.css("width"));
    h = capturePixel(sel.css("height"));
    canvas = getCanvas(w, h);
    ctx = canvas.getContext("2d");
    img = new Image();
    if (url) {
        img.onload = function() {
            ctx.drawImage(img, 0, 0, w, h);
        }
        img.src = url;
    }
    return img;
}

function changeProfileColor(color) {
    var pix, img, canvas, ctx, profile;
    profile = $("#profile");
    img = getImageFromSelector(profile);
    canvas = getCanvas(img.width, img.height);
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    pix = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(getChangedPixels(pix, color), 0, 0);
    profile.css("background-image", "url(" + canvas.toDataURL("image/png") + ")");
}

$(document).ready(function(){
    $("#loadButton").on("click", function() { $("#imageLoader").click(); });

    $("#imageLoader").change(function(e) {
        var reader, canvas, ctx, img, x, y, w, h, factor;
        reader = new FileReader();
        canvas = $("#avatarImg")[0];
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        reader.onload = function(event){
            img = new Image();
            img.onload = function(){
                if (img.width != img.height) {
                    if (img.height < canvas.height && img.width < canvas.width) {
                        // centralize
                        x = Math.floor((canvas.width - img.width)/2);
                        y = Math.floor((canvas.height - img.height)/2);
                        ctx.drawImage(img, x, y);
                    } else {
                        x = 0; y = 0; 
                        w, h, factor;
                        if (img.height > img.width) {
                            // fit to height
                            factor = canvas.height / img.height;
                            h = Math.floor(factor * img.height);
                            w = Math.floor(factor * img.width);
                            x = Math.floor((canvas.width - w)/2);
                        } else {
                            // fit to width
                            factor = canvas.width / img.width;
                            h = Math.floor(factor * img.height);
                            w = Math.floor(factor * img.width);
                            y = Math.floor((canvas.height - h)/2);
                        }
                        ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);
                    }
                } else {
                    // fit to content
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);     
    });
    
    $("#cutterButton").on("click", function() {
        $("#cutter").toggleClass("hide");
        $(this).toggleClass("active");
    });
    
    $("#cutter").draggable({containment: "parent"}).
                 resizable({aspectRatio: true, containment: "parent"});
    
    $("#profile").draggable({containment: "parent"}).
                  resizable({aspectRatio: true, containment: "parent"});
    
    $(".profile").on("click", function() {
        var profile, icon;
        profile = $("#profile");
        icon = $(this).data("icon");
        if (!profile.data("icon") != icon) {
            profile.data("icon", icon);
            profile.css("background-image", "url(images/" + icon + ".png)");
            changeProfileColor($("#color").val());
        }
        $(".profile").each(function() { $(this).removeClass("active"); });
        $(this).addClass("active");
    });

    $("#color").simplecolorpicker({ theme: 'fontawesome' }).
        on('change', function() { 
            changeProfileColor($(this).val());
    });

    $(".downsize").on("click", function() {
        $(".downsize").each(function() { $(this).removeClass("active"); });
        $(this).addClass("active");
    });
    
    $("#download").on("click", function() {
        var size, prefix, canvas, ctx;
        size = $(".downsize").filter(".active").data("size");
        prefix = $(".downsize").filter(".active").data("prefix");
        canvas = getCanvas(size, size);
        ctx = canvas.getContext("2d");
        ctx.drawImage($("#avatarFinal")[0], 0, 0, size, size);
        if (typeof document.createElement("a").download === "string") {
            $("#download")[0].download = prefix + "_podcastfied";
            $("#download")[0].href = canvas.toDataURL("image/png");
        } else {
            // alternative for browser without support to html5 download attribute
            canvas.toBlob(function(b) { saveAs(b, prefix + "_podcastfied.png") });
        }
    });

    $("#next").on("click", function() { navigate(1) });
    $("#previous").on("click", function() { navigate(-1) });
    
});
