import $ from 'jquery';

$(function() {
    document.addEventListener('deviceready', onDeviceReady, false);

    function onDeviceReady() {
        console.log('deviceready');
        alert('deviceready');
    }
});
