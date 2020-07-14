///<reference path="./lib/sub.ts"/>

$(function() {
    document.addEventListener('deviceready', onDeviceReady, false);

    function onDeviceReady() {
        console.log('deviceready');
//        alert('deviceready');
        util.popup();
    }




});
