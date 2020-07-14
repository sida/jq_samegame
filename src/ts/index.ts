
$(function() {
    document.addEventListener('deviceready', onDeviceReady, false);
    function onDeviceReady() {
        console.log('deviceready');
        console.log(device.platform);
        alert(device.platform);
    }

    $("#button1").click(function() {
        console.log('click!!');

		$("#div1").dialog({
			modal:true, //モーダル表示
			title:"テストダイアログ1", //タイトル
			buttons: { //ボタン
			"確認": function() {
				$(this).dialog("close");
				}
			}
		});
	});
});
