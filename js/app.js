var page = 1;
var maxPage = 3;

function navigate(i) {
    beforePage(i);

    $("[data-page]").each(function() {
        if ($(this).data("page") == page)
            $(this).addClass("hide");
    });
    
    page += i;
        
    $("[data-page]").each(function() {
        if ($(this).data("page") == page)
            $(this).removeClass("hide");
    });
    
    afterPage(i);
    
    // refresh pager
    if (page == 1)
        $("#previous").addClass("hide");
    else
        $("#previous").removeClass("hide");
    if (page == maxPage)
        $("#next").addClass("hide");
    else
        $("#next").removeClass("hide");
}

function captureUrl(v) {
    var re = /url\((['"]?.+['"]?)\)/gi;
    var match = re.exec(v);
    if (match)
        return match[1];
}

function capturePixel(v) {
    var re = /([0-9]+)px/gi;
    var match = re.exec(v);
    if (match)
        return match[1];
}

function beforePage(i) {
    var ctx;
    var canvas;
    if (page == 1 && i > 0) {
        canvas = $("#avatarWork")[0];
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var cutter = $("#cutter");
        if (cutter.hasClass("hide")) {
            ctx.drawImage($("#avatarImg")[0], 0, 0);
        } else {
            var x = capturePixel(cutter.css("left"));
            var y = capturePixel(cutter.css("top"));
            var w = capturePixel(cutter.css("width"));
            var h = capturePixel(cutter.css("height"));
            ctx.drawImage($("#avatarImg")[0], x, y, w, h, 0, 0, canvas.width, canvas.height);
        }
        
    } else if (page == 2 && i > 0) {
        canvas = $("#avatarFinal")[0];
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage($("#avatarWork")[0], 0, 0);
        var profile = $("#profile");
        var url = captureUrl(profile.css("background-image"));
        var x = capturePixel(profile.css("left"));
        var y = capturePixel(profile.css("top"));
        var w = capturePixel(profile.css("width"));
        var h = capturePixel(profile.css("height"));
        var img = new Image();
        if (url) {
            img.onload = function() {
                ctx.drawImage(img, x, y, w, h);
                $("#download")[0].href = canvas.toDataURL("image/png");
            };
            img.src = url;
        };
    }
    
}

function afterPage(i) {
}

function getCanvas(w, h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

function getChangedPixels(pix, color) {
    var r = parseInt(color.substr(1,2), 16);
    var g = parseInt(color.substr(3,2), 16);
    var b = parseInt(color.substr(5,2), 16);
    for (var i=0;i<pix.data.length;i+=4) 
        if (pix.data[i+3] != 0) { 
            pix.data[i]=r;
            pix.data[i+1]=g;
            pix.data[i+2]=b;
        }
    return pix;
};

function getImageFromSelector(sel) {
    var url = captureUrl(sel.css("background-image"));
    var x = capturePixel(sel.css("left"));
    var y = capturePixel(sel.css("top"));
    var w = capturePixel(sel.css("width"));
    var h = capturePixel(sel.css("height"));
    var canvas = getCanvas(w, h);
    var ctx = canvas.getContext("2d");
    var img = new Image();
    if (url) {
        img.onload = function() {
            ctx.drawImage(img, x, y, w, h);
        };
        img.src = url;
    };
    return img;    
};

function changeProfileColor(color) {
    var img = getImageFromSelector($("#profile"));        
    var canvas = getCanvas(img.width, img.height);
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(getChangedPixels(data, color), 0, 0);
    $("#profile").css("background-image", "url(" + canvas.toDataURL("image/png") + ")");
}

$(document).ready(function(){
    $("#loadButton").on("click", function() { $("#imageLoader").click(); });
    $("#imageLoader").change(function(e) {
        var reader = new FileReader();
        var canvas = $("#avatarImg")[0];
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        reader.onload = function(event){
            var img = new Image();
            img.onload = function(){
                if (img.width != img.height) {
                    if (img.height < canvas.height && img.width < canvas.width) {
                        // centralize
                        var x = Math.floor((canvas.width - img.width)/2);
                        var y = Math.floor((canvas.height - img.height)/2);
                        ctx.drawImage(img, x, y);
                    } else {
                        var x = 0; y = 0; 
                        var w, h, factor;
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
                    };
                } else {
                    // fit to content
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
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
        var profile = $("#profile");
        var icon = $(this).data("icon");
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
        var size = $(this).data("size");
        var canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d");
        ctx.drawImage($("#avatarFinal")[0], 0, 0, size, size);
        $("#download")[0].download = $(this).data("prefix") + "_podcastfied";
        $("#download")[0].href = canvas.toDataURL("image/png");
    });

    $("#next").on("click", function() { navigate(1) });
    $("#previous").on("click", function() { navigate(-1) });
    
});
