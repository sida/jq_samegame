
$(function () {

    document.addEventListener('deviceready', onDeviceReady, false);
    let logic = SameLogic.createGame(20, 10, 5);
    let selectBlockPostionList: BoardPosition[] = [];

    function isSelected(): boolean {
        return selectBlockPostionList.length > 0;
    }

    function onDeviceReady() {
        console.log('deviceready');
        onCreate()
    }

    window.addEventListener("resize", function (event) {
        console.log("ブラウザのウィンドウサイズが変更されました");
        clearTimeout();
        setTimeout(() => { onResize(); }, 100);
    });

    $('#title_icon').click(()=>{
        console.log('click icon');
        openDialogConfirmNewGame(
            ()=>{console.log('ok');},
            ()=>{console.log('cancel');});
    });

    let detector = new Hammer(this.body);
    detector.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
    detector.on('swipeup', () => {
        onSwipeUp();
    });

    function onCreate() {
        onResize();

        for (let iy = 9; iy >= 0; iy--) {
            for (let ix = 0; ix < 20; ix++) {
                let blockImagFilePath = sprintf('./img/blocks/%03d.png', logic.lookBlock({ x: ix, y: iy }));
                let blockImgElement = $("<img />", {
                    src: sprintf(blockImagFilePath),
                    class: 'block',
                    id: `${createBlockId({ x: ix, y: iy })}`,
                    on: {
                        click: function (event: Event) {
                            onClickBlock(ix, iy);
                        },
                    }
                });
                $("#board").append(blockImgElement);
            }
            $("#board").append('<br />');
        }

        updateCounterView();
        updateScoreView();
        updateRestBlocksView();
    }

    function createBlockId(pos: BoardPosition) {
        return sprintf('cood_%02dy%02dx', pos.y, pos.x);
    }

    function onClickBlock(x: number, y: number) {
        if (logic.isGameEnd()) {
            resetSelectViewBlock();
            selectBlockPostionList = [];
            return;
        }

        if (isSelected()) {
            // 選択中なので解除
            resetSelectViewBlock();
            selectBlockPostionList = [];
        }
        // 選択
        selectBlockPostionList = logic.checkBlock({ x: x, y: y });
        // 表示更新
        setSelectViewBlock(selectBlockPostionList);
    }

    function setSelectViewBlock(list: BoardPosition[]) {
        list.forEach(pos => {
            let block = getBlockJQueryElement(pos);
            block.css({
                filter: "opacity(75%)"
            });
        });
    }

    function resetSelectViewBlock() {
        blockEditer(
            (elem: JQuery<Element>) => {
                elem.css({ filter: "opacity(100%)" });
            }
        );
    }

    function getBlockJQueryElement(pos: BoardPosition): JQuery<Element> {
        let id = createBlockId(pos);
        return $('#' + id);
    }

    function reloadBlockView() {
        for (let iy = 9; iy >= 0; iy--) {
            for (let ix = 0; ix < 20; ix++) {
                let blockImagFilePath = sprintf('./img/blocks/%03d.png', logic.lookBlock({ x: ix, y: iy }));
                getBlockJQueryElement({ x: ix, y: iy }).attr({
                    src: blockImagFilePath
                }).css({ filter: "opacity(100%)" });
            }
        }
    }

    function updateCounterView() {
        for (let ii = 1; ii <= 5; ii++) {
            let id = sprintf('#counter%03d', ii);
            $(id).text(logic.getRest(ii));
        }
    }

    function updateScoreView() {
        $('#score').text(sprintf('%04d',logic.getScore()));
    }

    function updateRestBlocksView() {
        $('#rest_blocks').text(sprintf('%04d',logic.getAllRest()));
    }

    function blockEditer(f: (elem: JQuery<Element>) => void) {
        for (let iy = 9; iy >= 0; iy--) {
            for (let ix = 0; ix < 20; ix++) {
                f($('#' + createBlockId({ x: ix, y: iy })));
            }
        }
    }

    function onResize() {
        const SCREEN_WIDTH: number = 640;
        const SCREEN_HEIGHT: number = 380;
        // 横幅で縮尺を算出
        let zoom: number = window.innerWidth / SCREEN_WIDTH;
        if ((SCREEN_HEIGHT * zoom) > window.innerHeight) {
            // 縦幅がオーバーするようなら縦幅で縮尺を算出
            zoom = window.innerHeight / SCREEN_HEIGHT;
        }

        let left = (window.innerWidth - SCREEN_WIDTH * zoom) / 2;
        let top = (window.innerHeight - SCREEN_HEIGHT * zoom) / 2;

        $("#main_content").css(
            {
                transform: `scale(${zoom})`,
                top: `${top}px`,
                left: `${left}px`
            });
    }

    function onSwipeUp() {
        if (selectBlockPostionList.length <= 0) {
            // 選択しているブロックが無い
            return;
        }
        if (logic.isGameEnd()) {
            return;
        }
        logic.deleteBlock(selectBlockPostionList[0]);
        logic.cleanEmpty();
        logic.createEmptyCol();
        selectBlockPostionList = [];
        // 全ブロックの表示更新
        reloadBlockView();
        updateCounterView();
        updateScoreView();
        updateRestBlocksView();

        if (logic.isGameEnd()) {
            if (logic.getAllRest() == 0) {
                console.log('compleat');
            }
            // TODO
            console.log('end game');
            openDialogEndGame(
                ()=>{console.log('end!!')},
                logic.getAllRest() == 0
            );
        }
    }

    function openDialogEndGame(okCallBack:()=>void, isComplete:boolean) {
        $('#dialog').show();
        $('#dialog_game_end').show();
        $('#dialog_confirm_new_game').hide();

        $('.dialog_game_end_message').hide();
        if (isComplete) {
            $('.dialog_game_end_message').show();
        }
        $('.btn_ok').click(()=>{
            $('#dialog').hide();
            okCallBack();
        });
    }

    function openDialogConfirmNewGame(okCallBack:()=>void, cancelCallBack:()=>void) {
        $('#dialog').show();
        $('#dialog_game_end').hide();
        $('#dialog_confirm_new_game').show();

        $('.btn_ok').click(()=>{
            $('#dialog').hide();
            okCallBack();
        });

        $('.btn_cancel').click(()=>{
            $('#dialog').hide();
            cancelCallBack();
        });
    }

});
