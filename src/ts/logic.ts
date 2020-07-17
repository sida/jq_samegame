interface Size {
    x: number;
    y: number;
}

interface BoardPosition {
    x: number;
    y: number;
}

class SameLogic {
    /// 空ブロック番号
    static Empty = 0;

    boardSize: Size = {
        x: 20,
        y: 10
    };

    /// 仮想画面０が空き、１〜blockTypeNum＋１の値が入る
    /// 左下が(0,0)
    board!: number[][];

    /// ブロックの種類
    blockTypeNum: number = 5;

    /// 上下左右
    static Dir4List: BoardPosition[] = [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 1 }
    ];

    /// スコアクラスオブジェクト
    private score!: Score;
    /// 手数
    private playNum!: number;

    /// ファクトリ
    static createGame(x: number, y: number, t: number): SameLogic {
        let l = new SameLogic();
        l.score = new Score();
        l.playNum = 0;
        l.blockTypeNum = t;
        l.boardSize = { x: x, y: y };
        l.initBoard();
        return l;
    }

    private savedData: any = undefined;

    getSavedData(): any {
        return this.savedData;
    }

    save() {
        this.savedData = this.seriarize();
    }

    seriarize(): any {
        const data = {
            score: this.score.score,
            board: this.board,
            playNum: this.playNum
        };
        // ディープコピーして返す
        return JSON.parse(JSON.stringify(data));
    }

    unSeriarize(data: any) {
        this.score.score = data.score;
        this.board = data.board;
        this.playNum = data.playNum;
    }

    undo() {
        if (this.savedData) {
            this.unSeriarize(this.savedData);
            this.savedData = undefined;
        }
    }

    hasUndoData(): boolean {
        return typeof this.savedData !== "undefined" && this.savedData !== null;
    }

    /// 初期化
    private initBoard() {
        this.board = new Array<number[]>(this.boardSize.x);
        for (let ix = 0; ix < this.boardSize.x; ix++) {
            let col = new Array<number>(this.boardSize.y);
            for (let iy = 0; iy < this.boardSize.y; iy++) {
                col[iy] = Math.floor(Math.random() * this.blockTypeNum) + 1;
            }
            this.board[ix] = col;
        }
    }

    getBoard(): number[][] {
        return this.board;
    }

    getScore(): number {
        return this.score.score;
    }

    getPlayNum(): number {
        return this.playNum;
    }

    /// 指定座標のブロックを取得。範囲外は空ブロック０を返す
    lookBlock(pos: BoardPosition): number {
        if (!this.checkBoardPos(pos)) {
            // 範囲外
            return SameLogic.Empty; // 空ブロック
        }
        return this.board[pos.x][pos.y];
    }

    private setBlock(blockType: number, pos: BoardPosition) {
        if (this.checkBoardPos(pos)) {
            this.board[pos.x][pos.y] = blockType;
        }
    }

    /// 指定座標でブロックを削除(0に書き換えるだけで位置は変わらない)
    deleteBlock(pos: BoardPosition): number {
        let l = this.checkBlock(pos);
        if (l.length <= 1) {
            return 0;
        }
        l.forEach(pos => {
            this.board[pos.x][pos.y] = SameLogic.Empty;
        });
        // 消したブロック数だけスコア追加
        this.score.clearBlocks(l.length);
        // 手数カウント
        this.playNum++;
        return l.length;
    }

    /// 0ブロックを削除。deleteBlockのあとに実行するとブロックを詰める
    cleanEmpty() {
        for (let ix = 0; ix < this.boardSize.x; ix++) {
            while (!this.checkDoneCleanEmpty(ix)) {
                for (let iy = 0; iy < this.boardSize.y - 1; iy++) {
                    const pos: BoardPosition = { x: ix, y: iy };
                    const b = this.lookBlock(pos);
                    if (b === SameLogic.Empty) {
                        const upperPos: BoardPosition = { x: ix, y: iy + 1 };
                        const upperBlock = this.lookBlock(upperPos);
                        this.setBlock(upperBlock, pos);
                        this.setBlock(SameLogic.Empty, upperPos);
                    }
                }
            }
        }
    }

    /// 指定列が処理済みかをチェック
    /// 空ブロックのつながりを０、ブロックのつながりを１の配列を作って
    /// 0,1 と配列の長さがが３以上を処理残として判定
    private checkDoneCleanEmpty(posX: number) {
        let list: number[] = [];
        let isCurrentEmpty: boolean = false;

        let pos: BoardPosition = { x: posX, y: 0 };
        isCurrentEmpty = this.lookBlock(pos) == SameLogic.Empty;
        list.push(isCurrentEmpty ? 0 : 1);
        // 1,0のリストを作成
        for (let iy = 1; iy < this.boardSize.y; iy++) {
            pos.y = iy;
            const b = this.lookBlock(pos);

            if (isCurrentEmpty) {
                if (b !== SameLogic.Empty) {
                    list.push(1);
                }
            } else {
                if (b === SameLogic.Empty) {
                    list.push(0);
                }
            }
            isCurrentEmpty = b == SameLogic.Empty;
        }
        // 処理、未処理判定
        if (list.length === 2 && list[0] === SameLogic.Empty) {
            return false;
        }
        if (list.length > 2) {
            return false;
        }
        return true;
    }

    /// 縦１列が全て空の列を削除して左詰め
    createEmptyCol() {
        let cleanBoard = this.board.filter((col: number[]) => {
            return !this.isEmptyCol(col);
        });

        const delCount = this.boardSize.x - cleanBoard.length;

        let emptyCol: number[] = new Array<number>();
        for (let ii = 0; ii < this.boardSize.y; ii++) {
            emptyCol.push(0);
        }

        for (let ii = 0; ii < delCount; ii++) {
            cleanBoard.push(emptyCol);
        }
        this.board = cleanBoard;
    }

    /// 配列の要素が全て０ならtrueを返す
    private isEmptyCol = (col: number[]): boolean => {
        for (let ii = 0; ii < col.length; ii++) {
            if (col[ii] > 0) {
                return false;
            }
        }
        return true;
    };

    /// 指定座標で取得できるブロック
    checkBlock(pos: BoardPosition): BoardPosition[] {
        if (!this.checkBoardPos(pos)) {
            // 範囲外
            return [];
        }
        let blockType = this.lookBlock(pos);
        if (blockType === SameLogic.Empty) {
            // 空ブロックが指定された
            return [];
        }
        if (this.getBlock4(blockType, pos).length === 0) {
            // 周囲に同じブロックがない
            return [];
        }
        return this.getTargetBlockList(blockType, pos); // 取れるブロックの座標リストを返す
    }

    /// 範囲内か？範囲内ならtrueを返す
    private checkBoardPos(pos: BoardPosition): boolean {
        if (pos.x < 0) {
            return false;
        }

        if (pos.y < 0) {
            return false;
        }

        if (pos.x >= this.boardSize.x) {
            return false;
        }

        if (pos.y >= this.boardSize.y) {
            return false;
        }

        return true;
    }

    /// 選択できるブロックを洗い出す
    /// 指定したブロックの上下左右に同じブロックがあればリストアップして登録
    /// 登録したブロックの上下左右に同じブロックがあれば同じように登録・・・を繰り返して
    /// 登録数が変わらなければ完了
    /// ブロックの登録管理はBlockStockerで行い重複したブロックは登録されない
    private getTargetBlockList(
        blockType: number,
        pos: BoardPosition
    ): BoardPosition[] {
        let blockStocker = new BlockStocker();
        // 指定されたブロックを登録
        blockStocker.add(pos);
        let prevBlockCount = 0;
        while (true) {
            let currentList = blockStocker.result();
            if (currentList.length == prevBlockCount) {
                // ブロック数に変化がなかったので完了
                break;
            }
            if (currentList.length > 1000) {
                throw new Error("消しブロック取得異常");
            }
            prevBlockCount = currentList.length;
            // 指定されたブロックと接触しているブロックが同じなら全て登録
            currentList.forEach(p => {
                blockStocker.addList(this.getBlock4(blockType, p));
            });
        }
        return blockStocker.result();
    }

    /// 上下左右にある同じブロックの座標のリストを取得
    private getBlock4(blockType: number, pos: BoardPosition): BoardPosition[] {
        let list: BoardPosition[] = [];
        if (this.lookBlock(pos) !== blockType) {
            return list;
        }
        SameLogic.Dir4List.forEach(p => {
            let dirPos = { x: pos.x + p.x, y: pos.y + p.y };
            let blockT = this.lookBlock(dirPos);
            if (blockType === blockT) {
                list.push(dirPos);
            }
        });
        return list;
    }

    /// ゲーム終了判定（繋がったブロックがないか？）
    isGameEnd(): boolean {
        for (let ix = 0; ix < this.boardSize.x; ix++) {
            for (let iy = 0; iy < this.boardSize.y; iy++) {
                let pos = { x: ix, y: iy };
                if (this.checkBlock(pos).length > 0) {
                    return false;
                }
            }
        }
        this.savedData = undefined; // ゲーム終了後はundoできないように
        return true;
    }

    // 指定ブロックの残り数
    getRest(blockType: number): number {
        let counter: number = 0;
        for (let ix = 0; ix < this.boardSize.x; ix++) {
            for (let iy = 0; iy < this.boardSize.y; iy++) {
                let pos = { x: ix, y: iy };
                if (this.lookBlock(pos) == blockType) {
                    counter++;
                }
            }
        }
        return counter;
    }

    getAllRest(): number {
        let counter: number = 0;
        for (let ix = 0; ix < this.boardSize.x; ix++) {
            for (let iy = 0; iy < this.boardSize.y; iy++) {
                let pos = { x: ix, y: iy };
                if (this.lookBlock(pos) != 0) {
                    counter++;
                }
            }
        }
        return counter;
    }
}

/// ブロックの座標をユニークなものだけ保持してリストアップする
class BlockStocker {
    list: Map<number, BoardPosition>;

    constructor() {
        this.list = new Map<number, BoardPosition>();
    }

    add(p: BoardPosition) {
        let key = p.x * 30 + p.y;
        this.list.set(key, p);
    }

    addList(list: BoardPosition[]) {
        list.forEach(pos => {
            this.add(pos);
        });
    }

    result(): BoardPosition[] {
        return Array.from(this.list.values());
    }
}

class Score {
    private _score: number;

    constructor() {
        this._score = 0;
    }

    clearBlocks(blockNum: number) {
        if (blockNum <= 1) {
            return;
        }
        this._score += (blockNum - 2) * (blockNum - 2);
    }

    addAllClearBonus() {
        this._score += 1000;
    }

    get score() {
        return this._score;
    }

    set score(v: number) {
        this._score = v;
    }
}
