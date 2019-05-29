$(function () {

    var el = document.documentElement
        , rfs = // for newer Webkit and Firefox
            el.requestFullscreen
            || el.webkitRequestFullScreen
            || el.mozRequestFullScreen
            || el.msRequestFullscreen
        ;

    function requestFullscreen() {
        if (typeof rfs != "undefined" && rfs) {
            rfs.call(el);
        }
        $(window).off("mousemove", requestFullscreen);

    }
    $(window).on("mousemove", requestFullscreen);


});