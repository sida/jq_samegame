

$(function () {
	document.addEventListener('deviceready', onDeviceReady, false);
	function onDeviceReady() {
		console.log('deviceready');
		console.log(device.platform);

		console.log(sprintf('%05d',99));


		start();
	}

	function start() {
		setTimeout(function(){
			$('.input').css("visibility","visible");
		},3000);
	}
});
