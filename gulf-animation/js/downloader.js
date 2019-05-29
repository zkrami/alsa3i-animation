


var handleData = function(toDownload){
    var file = new File([JSON.stringify(toDownload)], "review.json", {type: "text/plain;charset=utf-8"});
    saveAs(file);
}