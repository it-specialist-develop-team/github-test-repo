var Tetris = {
	//プロパティ定義
	data      : null,					//ゲーム画面のブロックの状態を保持
	screen    : null,					//camvasのElementObjectのインスタンス
	context   : null,					//2D-canvasのインスタンス
	fields    : {x:12,y:21},			//ゲーム画面の幅(ブロック数)
	fallPoint : {						//落下中のブロックの中心座標
					x:0,
					y:1
				 },
	fallBlock : null,					//落下中のブロック
	nextBlock : null,					//次に落下するブロック
	speed	  : 1000,					//自動落下スピード
	color     : null,					//ミノの色
	seven 	  : new Array(0,1,2,3,4,5,6),
	countmino : 7,
	timer	  : null,
	holdscreen: null,
	holdcontext: null,
	holddate  : null,
	holdfields: {x:7,y:7},
	holdPoint :{
					x:3,
					y:3
				},
	holdtrig  :	0,
	holdBlock : null,
	moment	  : null,
	holdcolor : null,
	colormoment: null,
	nextscreen: null,
	nextcontext: null,
	nextnum   : 5,
	nextmino  : null,
	scolor	  : 0,
	nextfields: {x:7,y:35},
	nextdata  : null,
	nexttri   : null,


	//関数定義
	//※ここでは関数を一覧で見せたいので処理は書かない
	init		: function(canvasId){},	//初期化処理
	start       : function(){},			//ゲームを開始する為の処理
	gameOver	: function(){},			//ゲームオーバーになった時用のコールバックとして準備
	clearblock	: function(){},			//dataの中身を壁だけの状態にする
	drow        : function(){},			//dataの状態を画面に出力する
	hitcheck	: function(){},			//ブロックの衝突チェック
	keydownFunc : function(event){},	//キーが入力された時の処理
	lineCheck	: function(){},			//そろったラインが無いかをチェック
	putBlock    : function(){},			//ブロックをdataに反映させる
	timerFunc	: function(){},			//自動落下
	fp			: function(){},			//落下地点表示
	holddrow	: function(){},
	holdput		: function(){},
	nextdrow	: function(){},
	nextput		: function(){},
}



/**
 * ゲームの初期化
 * ゲーム準備に失敗した場合にはfalseを返します。
 *
 * @return boolean
 */
Tetris.init = function(canvasId){

	//ゲーム画面になるcanvasタグを取得する
	this.screen = document.getElementById(canvasId);
	if(!this.screen){
		alert("第1引数にはcanvasタグのid属性を渡してください");
		return false;
	}
	
	//2D-Contextのハンドルを取得する
	this.context = this.screen.getContext('2d');

	//dataを初期化
	this.data = new Array(this.fields.y);
	for(i=0; i<this.fields.y ;i++){
		this.data[i] = new Array(this.fields.x);
	}
	
	//落下させるブロックは真ん中から落としたいので、幅/2をセットする
	this.fallPoint.x = Math.ceil(this.fields.x /2);
	
	this.holdscreen = document.getElementById("id_hold");

	this.holdcontext = this.holdscreen.getContext("2d");	
	
	this.holddata = new Array(this.holdfields.y);
	for(i=0; i<this.holdfields.y ;i++){
		this.holddata[i] = new Array(this.holdfields.x);
	}

	this.nextscreen = document.getElementById("id_next");

	this.nextcontext = this.nextscreen.getContext("2d");

	this.nextmino = new Array(this.nextnum);

	this.color = new Array(this.nextnum+1);

	this.nextdata = new Array(this.nextfields.y)
	for(i=0; i<this.nextfields.y ;i++){
		this.nextdata[i] = new Array(this.nextfields.x);
	}

	for(i=0; i<this.nextnum; i++){
		this.nextcontext.strokeStyle = "rgb(  0,  0,  0)";
		this.nextcontext.strokeRect(10,i*49,49,49);
	}

	//ゲーム画面を初期化
	this.clearblock();

	//画面を表示
	this.drow();

	this.holddrow();
}




/**
 * ゲームの初期化
 * ゲーム準備に失敗した場合にはfalseを返します。
 *
 * @return boolean
 */
Tetris.start = function(){

	this.fallBlock = new Block();

	for(i=0; i<this.nextnum;i++){
		this.nextmino[i] = new Block();
		Tetris.nextput(Tetris.color[i+1]+1,i)
	}
	this.nextdrow();
	
	this.nexttri = 0;
	//キー入力開始
	window.addEventListener('keydown',this.keydownFunc,true);
	
	this.fp(9);
	this.putBlock(2+Tetris.color[0]);
	this.drow();

	//自動落下を開始
	this.timer = setTimeout(this.timerFunc,this.speed);
}

const aryMax = function (a, b) {return Math.max(a, b);}
const aryMin = function (a, b) {return Math.min(a, b);}

/**
 * dataの中身を壁だけの状態にする
 */
Tetris.clearblock = function(){
	var i,j;
	
	for(i=0; i<this.fields.y ;i++){
		for(j=0; j<this.fields.x ;j++){
			if(j==0||(j==this.fields.x-1)||(i==this.fields.y-1)){
				this.data[i][j] = 1;	//床と壁
			}else{
				this.data[i][j] = 0;
			}
		}
	}

	for(i=0; i<this.holdfields.y ;i++){
		for(j=0; j<this.holdfields.x ;j++){
			if(j==0||(j==this.holdfields.x-1)||i==0||(i==this.holdfields.y-1)){
				this.holddata[i][j] = 1;	//床と壁
			}else{
				this.holddata[i][j] = 0;
			}
		}
	}

	for(i=0; i<this.nextfields.y; i++){
		for(j=0; j<this.nextfields.x ;j++){
				this.nextdata[i][j] = 0;
		}
	}
}



/**
 * dataの状態を画面に出力する
 */
Tetris.drow = function(){
	var i,j;
	
	for(i=0; i<this.fields.y; i++){
		for(j=0; j<this.fields.x; j++){
			if(this.data[i][j] ==0){
				this.context.fillStyle = "rgb( 69, 69, 69)";		//何もない
			}else if(this.data[i][j] == 1){
				this.context.fillStyle = "rgb(  0,128,128)";		//壁又は床
			}else if(this.data[i][j] == 2){
				this.context.fillStyle = "rgb(101,255,255)";
			}else if(this.data[i][j] == 3){
				this.context.fillStyle = "rgb(204, 50,255)";
			}else if(this.data[i][j] == 4){
				this.context.fillStyle = "rgb(255,215,0  )";
			}else if(this.data[i][j] == 5){
				this.context.fillStyle = "rgb(101,255, 50)";
			}else if(this.data[i][j] == 6){
				this.context.fillStyle = "rgb(255, 50, 50)";
			}else if(this.data[i][j] == 7){
				this.context.fillStyle = "rgb( 51,102,255)";
			}else if(this.data[i][j] == 8){
				this.context.fillStyle = "rgb(255,191,  0)";
			}else if(this.data[i][j] == 9){
				this.context.fillStyle = "rgb(255,255,255,0.5)";
			}
			this.context.fillRect(j*16,i*16,15,15);
		}
	}
};

Tetris.holddrow = function(){
	var i,j;
	
	for(i=0; i<this.holdfields.y; i++){
		for(j=0; j<this.holdfields.x; j++){
			if(this.holddata[i][j] ==0){
				this.holdcontext.fillStyle = "rgb( 69, 69, 69)";		//何もない
			}else if(this.holddata[i][j] == 1){
				this.holdcontext.fillStyle = "rgb(  0,128,128)";		//壁又は床
			}else if(this.holddata[i][j] == 2){
				this.holdcontext.fillStyle = "rgb(101,255,255)";
			}else if(this.holddata[i][j] == 3){
				this.holdcontext.fillStyle = "rgb(204, 50,255)";
			}else if(this.holddata[i][j] == 4){
				this.holdcontext.fillStyle = "rgb(255,215,0  )";
			}else if(this.holddata[i][j] == 5){
				this.holdcontext.fillStyle = "rgb(101,255, 50)";
			}else if(this.holddata[i][j] == 6){
				this.holdcontext.fillStyle = "rgb(255, 50, 50)";
			}else if(this.holddata[i][j] == 7){
				this.holdcontext.fillStyle = "rgb( 51,102,255)";
			}else if(this.holddata[i][j] == 8){
				this.holdcontext.fillStyle = "rgb(255,191,  0)";
			}else if(this.holddata[i][j] == 9){
				this.holdcontext.fillStyle = "rgb(255,255,255,0.5)";
			}
			this.holdcontext.fillRect(j*16,i*16,15,15);
		}
	}
};

Tetris.nextdrow = function(){
	var i,j;
	
	for(i=0; i<this.nextfields.y; i++){
		for(j=0; j<this.nextfields.x; j++){
			if(this.nextdata[i][j] == 0){
				this.nextcontext.fillStyle = "rgb(255,255,255)";		//何もない
			}else if(this.nextdata[i][j] == 1){
				this.nextcontext.fillStyle = "rgb(101,255,255)";
			}else if(this.nextdata[i][j] == 2){
				this.nextcontext.fillStyle = "rgb(204, 50,255)";
			}else if(this.nextdata[i][j] == 3){
				this.nextcontext.fillStyle = "rgb(255,215,0  )";
			}else if(this.nextdata[i][j] == 4){
				this.nextcontext.fillStyle = "rgb(101,255, 50)";
			}else if(this.nextdata[i][j] == 5){
				this.nextcontext.fillStyle = "rgb(255, 50, 50)";
			}else if(this.nextdata[i][j] == 6){
				this.nextcontext.fillStyle = "rgb( 51,102,255)";
			}else if(this.nextdata[i][j] == 7){
				this.nextcontext.fillStyle = "rgb(255,191,  0)";
			}
			this.nextcontext.fillRect(j*7+10,i*7,6,6);
		}
	}
};

/**
 * ブロックの衝突チェック
 * @return boolean
 */
Tetris.hitcheck = function(){
	var i,cx,cy,hit=0;
	
	for(i=0; i<this.fallBlock.data.x.length; i++){
		cx=this.fallPoint.x + this.fallBlock.data.x[i];
		cy=this.fallPoint.y + this.fallBlock.data.y[i];
		if((cx>=0) && (cx<=this.fields.x-1) && (cy>-1)&&(cy<=this.fields.y-1)){
			if(this.data[cy][cx]<9&&this.data[cy][cx]>0) hit++;
		}
	}
	return(hit);	//戻り値が１以上なら衝突
}



/**
 * キーが入力された時の処理
 * @params event Event
 */
Tetris.keydownFunc = function(event){
	var code = event.keyCode;
	var oldx=Tetris.fallPoint.x,oldy=Tetris.fallPoint.y,r=0;
	
	Tetris.putBlock(0);
	Tetris.fp(0);
	Tetris.drow();
	switch(code){
	case 37:	//←キー
		event.preventDefault();
		Tetris.fallPoint.x--;
		break;
	case 39:	//→キー
		event.preventDefault();
		Tetris.fallPoint.x++;
		break;
	case 40:	//↓キー
		event.preventDefault();
		Tetris.fallPoint.y++;
		break;
	case 88:	//xキー
		event.preventDefault();
		r=1;
		break;
	case 90:	//zキー
		event.preventDefault();
		r=-1;
		break;
	case 16:	//shiftキー
		event.preventDefault();
		if(Tetris.holdtrig == 0){
			if(Tetris.holdBlock == null){
				Tetris.holdcolor = Tetris.color[0];
				Tetris.holdBlock = Tetris.fallBlock;
				Tetris.holdput(2+Tetris.color[0]);
				Tetris.holddrow();
				Tetris.fallBlock = Tetris.nextmino[0];
				Tetris.color[0] = Tetris.color[1];
				for(i=0; i<Tetris.nextnum-1; i++){
					Tetris.nextput(0,i);
					Tetris.color[i+1] = Tetris.color[i+2];
					Tetris.nextmino[i] = Tetris.nextmino[i+1];
					Tetris.nextput(Tetris.color[i+1]+1,i)
					Tetris.nextdrow()
				}
				Tetris.nextput(0,4)
				Tetris.nextmino[Tetris.nextnum-1] = new Block();	//新しいブロックを生成
				Tetris.nextput(Tetris.color[5]+1,4);
				Tetris.nextdrow();
				Tetris.fallPoint.x = Math.ceil(Tetris.fields.x/2);
				Tetris.fallPoint.y = 1;
				Tetris.holdtrig++;
			}else if(Tetris.holdBlock != null){
				Tetris.holdput(0);
				Tetris.moment = Tetris.holdBlock;
				Tetris.holdBlock = Tetris.fallBlock;
				Tetris.colormoment = Tetris.color[0];
				Tetris.color[0] = Tetris.holdcolor;
				Tetris.holdcolor = Tetris.colormoment;
				Tetris.holdput(2+Tetris.holdcolor);
				Tetris.holddrow();
				Tetris.fallBlock = Tetris.moment;
				Tetris.fallPoint.x = Math.ceil(Tetris.fields.x/2);
				Tetris.fallPoint.y = 1;
				Tetris.holdtrig++;
			}
		}
		break;
	case 38:	//↑キー
		event.preventDefault();
		var hit = 0;
		while(hit == 0){
			Tetris.fallPoint.y++;
			if(Tetris.hitcheck()){
				hit++;
				Tetris.fallPoint.y--;
				Tetris.putBlock(2+Tetris.color[0]);
				Tetris.lineCheck();	//ラインのチェックと消去
				Tetris.fallBlock = Tetris.nextmino[0];
				Tetris.color[0] = Tetris.color[1];
				for(i=0; i<Tetris.nextnum-1; i++){
					Tetris.nextput(0,i);
					Tetris.color[i+1] = Tetris.color[i+2];
					Tetris.nextmino[i] = Tetris.nextmino[i+1];
					Tetris.nextput(Tetris.color[i+1]+1,i)
					Tetris.nextdrow()
				}
				Tetris.nextput(0,4)
				Tetris.nextmino[Tetris.nextnum-1] = new Block();	//新しいブロックを生成
				Tetris.nextput(Tetris.color[5]+1,4);
				Tetris.nextdrow();
				Tetris.fallPoint.x = Math.ceil(Tetris.fields.x/2);
				Tetris.fallPoint.y = 1;
				Tetris.holdtrig = 0;
				clearTimeout(Tetris.timer);
				if(Tetris.hitcheck()){
					Tetris.drow();
					Tetris.gameOver();	//ゲームオーバー
					return;
				}
				Tetris.drow();
				Tetris.timer = setTimeout(Tetris.timerFunc,Tetris.speed);
				break;
			}
		}		
		break;
	}
	if(Tetris.hitcheck()){
		Tetris.fallPoint.x=oldx;
		Tetris.fallPoint.y=oldy;
	}
	if(r){
		Tetris.fallBlock.turn(r);
		if(Tetris.hitcheck()){
			Tetris.fallBlock.turn(-r);
		}
	}
	Tetris.fp(9);
	Tetris.putBlock(2+Tetris.color[0]);
	Tetris.drow();
};



/**
 * ブロックをdataに反映させる
 * @return int 	削除した行数
 */
Tetris.lineCheck = function(){
	var i,cx,cy,line;
	
	delLine = 0;		//削除した行の数
	
	cy=this.fields.y-2; //チェックする最初の行(y)
	//※-2の根拠：配列のIndex番号は実際の数-1で、一番下が壁でその次の行から処理するための-2になる
	
	lineblock = this.fields.x-2;

	while(cy>=1){
		line=0;
		for(cx=1 ;cx<=lineblock ;cx++){
			if(this.data[cy][cx]<9&&this.data[cy][cx]>0) line++;
		}
		if(line==lineblock){
		//1行そろった場合の処理
			delLine++;
			for(i=cy; i>=1; i--){
				for(cx=1; cx<=lineblock;cx++){
					this.data[i][cx]=this.data[i-1][cx];
				}
			}
			this.speed -= 50;
			if(this.speed<100) this.speed=100;
		}else{
			cy--;
		}
	}
	return delLine;
};



/**
 * ブロックをdataに置く
 * @params int a	ブロックの状態(0:なし,1:壁＆床,2:落下中,3落下後)
 */
Tetris.putBlock = function(a){
	var i,cx,cy;

	for(i=0; i<this.fallBlock.data.x.length; i++){
		cx=this.fallPoint.x+this.fallBlock.data.x[i];
		cy=this.fallPoint.y+this.fallBlock.data.y[i];
		if((cx>=0) && (cx<=this.fields.x-1) && (cy>=0)&&(cy<=this.fields.y-1)){
			this.data[cy][cx] = a;
		}
	}
};

Tetris.holdput = function(a){
	var i,cx,cy;

	for(i=0; i<this.holdBlock.data.x.length; i++){
		cx=this.holdPoint.x+this.holdBlock.data.x[i];
		cy=this.holdPoint.y+this.holdBlock.data.y[i];
		if((cx>=0) && (cx<=this.holdfields.x-1) && (cy>=0)&&(cy<=this.holdfields.y-1)){
			this.holddata[cy][cx] = a;
		}
	}
};

Tetris.nextput = function(a,b){
	var i,cx,cy;

	for(i=0; i<this.nextmino[b].data.x.length; i++){
		cx=this.holdPoint.x+this.nextmino[b].data.x[i];
		cy=this.holdPoint.y+this.nextmino[b].data.y[i];
		if((cx>=0) && (cx<=this.nextfields.x) && (cy>=0)&&(cy<=this.nextfields.y)){
			this.nextdata[cy+b*7][cx] = a;
		}
	}
};

/**
 * 自動落下処理
 */
Tetris.timerFunc = function(){

	Tetris.putBlock(0);
	Tetris.fp(0);
	Tetris.drow();
	Tetris.fallPoint.y++;		//ブロックを落下
	if(Tetris.hitcheck()){	//落下時の衝突判定
	//衝突した場合
		Tetris.fallPoint.y--;
		Tetris.fp(9);
		Tetris.putBlock(2+Tetris.color[0]);
		Tetris.lineCheck();	//ラインのチェックと消去
		Tetris.fallBlock = Tetris.nextmino[0];
		Tetris.color[0] = Tetris.color[1];
		for(i=0; i<Tetris.nextnum-1; i++){
			Tetris.nextput(0,i);
			Tetris.color[i+1] = Tetris.color[i+2];
			Tetris.nextmino[i] = Tetris.nextmino[i+1];
			Tetris.nextput(Tetris.color[i+1]+1,i)
			Tetris.nextdrow()
		}
		Tetris.nextput(0,4)
		Tetris.nextmino[Tetris.nextnum-1] = new Block();	//新しいブロックを生成
		Tetris.nextput(Tetris.color[5]+1,4);
		Tetris.nextdrow();
		Tetris.fallPoint.x = Math.ceil(Tetris.fields.x/2);
		Tetris.fallPoint.y = 1;
		Tetris.holdtrig = 0;
		if(Tetris.hitcheck()){
			Tetris.drow();
			Tetris.gameOver();	//ゲームオーバー
			return;
		}
		Tetris.fp(9);
		Tetris.putBlock(2+Tetris.color[0]);
	}else{
	//衝突してない場合
		Tetris.fp(9);
		Tetris.putBlock(2+Tetris.color[0]);

	}
	Tetris.drow();
	Tetris.timer = setTimeout(Tetris.timerFunc,Tetris.speed);
}

Tetris.fp = function(a){
	var i,cx,cy,fy,fhit=0;
	for(fy=0;fy<21;fy++){
		for(i=0; i<this.fallBlock.data.x.length; i++){
			cx=this.fallPoint.x+this.fallBlock.data.x[i];
			cy=this.fallPoint.y+this.fallBlock.data.y[i];
			cy=cy+fy; 
			if((cx>=0) && (cx<=this.fields.x-1) && (cy>=0)&&(cy<=this.fields.y-1)){
				if((this.data[cy][cx]<9) && (this.data[cy][cx]>0)) {
					fhit++;
					break;
				}
			}
		}
		if(fhit != 0){
			for(i=0; i<this.fallBlock.data.x.length; i++){
				cx=this.fallPoint.x+this.fallBlock.data.x[i];
				cy=this.fallPoint.y+this.fallBlock.data.y[i];
				if((cx>=0) && (cx<=this.fields.x-1) && (cy>=0)&&(cy<=this.fields.y-1)){
					this.data[cy+fy-1][cx] = a;
				}
			}
			break;
		}
	}
}



var Block = function(){
	//落下中のブロックの形を保持
	this.data = {x: new Array(),
				 y: new Array()};
	//落下するブロックの種類
	this.types = [				//ブロックのパターン
				[[-1, 0], [ 0, 0], [ 1 ,0], [ 2, 0],],	/*A I*/
				[[ 0,-1], [ 0, 0], [ 1, 0], [-1, 0],],	/*B T*/
				[[ 0,-1], [ 0, 0], [ 1, 0], [ 1,-1],],	/*C O*/
				[[ 1,-1], [ 0,-1], [ 0, 0], [-1, 0],],	/*D Z*/
				[[-1,-1], [ 0,-1], [ 0, 0], [ 1, 0],],	/*E S*/
				[[-1,-1], [-1, 0], [ 0, 0], [ 1, 0],],	/*F J*/
				[[-1, 0], [ 0, 0], [ 1, 0], [ 1, -1],],	/*G L*/
			];
	//ブロックを回転させる処理
	this.turn = function(r){
		var tx,i;
		
		for(i=0; i<4; i++){
			tx = this.data.x[i] * r;
			this.data.x[i] = -this.data.y[i] * r;
			this.data.y[i] = tx;
		}
	};
			
	//ブロックタイプを決定

	if(Tetris.countmino > 6){
		Tetris.countmino = 0;
		Tetris.seven = new Array(0,1,2,3,4,5,6);
		for(var i = Tetris.seven.length - 1; i > 0; i--){
			var r = Math.floor(Math.random() * (i + 1));
			var tmp = Tetris.seven[i];
			Tetris.seven[i] = Tetris.seven[r];
			Tetris.seven[r] = tmp;
		}
	}

	var num = Tetris.seven[Tetris.countmino];
	Tetris.countmino++;

	if(Tetris.nexttri == null){
		Tetris.color[Tetris.scolor] = num;
		Tetris.scolor++;
	}else{
		Tetris.color[5] = num;
	}
	
	for(i=0; i<this.types[num].length; i++){
		this.data.x[i] = this.types[num][i][0];
		this.data.y[i] = this.types[num][i][1];
	}

	// t = Math.floor(Math.random() * 4);
	// for(i=0; i<t; i++){
	// 	this.turn(1);		//ランダムに回転させる
	// }

}