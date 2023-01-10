///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/
//
//  Assignment       COMP3200 - Assignment 3
//  Professor:       David Churchill
//  Year / Term:     2022-09
//  File Name:       GridGUI.js
// 
//  Student Name:    Ekuyik Essien
//  Student User:    enessien
//  Student Email:   enessien@mun.ca
//  Student ID:      202023347
//  Group Member(s): [enter student name(s)]
//
///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/
                   
class GridGUI extends GUI {

    constructor (container, mapText) {

        super(container);
        
        this.pixelWidth = 768;
        this.pixelHeight = 768;

        this.humanAction = -1;
        this.prevMouseClickX = -1;
        this.prevMouseClickY = -1;
        this.mx = -1;
        this.my = -1;
        this.message = "";
        
        this.colors = ['#ffff00', '#ff0000', '#ffffff']
        this.bgColor = '#006FB9'
        this.moveColor = '#00acee'
        
        this.state = new GameState(7, 6);
        this.players = [null, null];
        this.autoplay = false;
        this.doturn = false;
        this.elements = [ ['labelp1time', 'labelp1depth', 'p1time', 'p1depth'], ['labelp2time', 'labelp2depth', 'p2time', 'p2depth'] ];
        this.history = [];

        this.setHTML();
        this.resetGame();
        this.setAlgorithm();
        this.addEventListeners();
    }

    update() {
        let winner = this.state.winner();
        // do the move for the current player
        if (winner == PLAYER_NONE) {
            this.textDiv.innerHTML = this.message;
            if (this.players[this.state.player] == null) {
                if (this.humanAction != -1 && this.state.isLegalAction(this.humanAction)) {
                    this.doAction(this.humanAction);
                    this.humanAction = -1;
                }
            } else if (this.autoplay || this.doturn) {
                let aiAction = this.players[this.state.player].getAction(this.state.copy());
                if (this.state.isLegalAction(aiAction)) { 
                    this.doAction(aiAction);
                    this.doturn = false;
                } else {
                    this.textDiv.innerHTML = "<h1>WARNING:<br>Player " + (this.state.player + 1) + " illegal action (" + aiAction + ")</h1>"; 
                }
                
            }
        } else {
            if (winner == PLAYER_ONE)  { this.textDiv.innerHTML = "<h1>Player One Wins!</h1>"; }
            if (winner == PLAYER_TWO)  { this.textDiv.innerHTML = "<h1>Player Two Wins!</h1>"; }
            if (winner == PLAYER_DRAW) { this.textDiv.innerHTML = "<h1>The Game is a Draw!</h1>"; }
        }

        this.draw();
    }

    doAction(action) {
        this.state.doAction(action);
        this.history.push(action);
    }

    undoAction() {
        if (this.history.length == 0) { return; }
        this.state.undoAction(this.history.pop());
        document.getElementById("selectp1alg").options.selectedIndex = 0;
        document.getElementById("selectp2alg").options.selectedIndex = 0;
        this.setAlgorithm();
    }

    resetGame() {
        this.state = new GameState(parseInt(document.getElementById('sliderwidth').value), parseInt(document.getElementById('sliderheight').value));
        this.sqSize = Math.min(this.pixelWidth / this.state.width, this.pixelHeight / this.state.height);
        this.sqHalf = this.sqSize/2;
        this.history = [];
        this.mx = -1;
        this.my = -1;
        this.message = "";
    }
                   
    // draw the foreground, is called every 'frame'
    draw() {

        // clear the foreground to white
        this.fg_ctx.clearRect(0, 0, this.bg.width, this.bg.height);

        // draw the background color
        this.fg_ctx.fillStyle = this.state.winner() == PLAYER_NONE ? this.bgColor : '#777777';
        this.fg_ctx.fillRect(0, 0, this.state.width * this.sqSize, this.state.height * this.sqSize);
        
        // draw the most recent action
        if (this.history.length > 0) {
            let actionX = this.history[this.history.length - 1];
            let actionY = this.state.height - this.state.pieces[actionX];
            this.fg_ctx.fillStyle = this.moveColor;
            this.fg_ctx.fillRect(actionX*this.sqSize, actionY*this.sqSize, this.sqSize, this.sqSize);
        }

        // draw the winning connection if it exists
        if (this.state.winner() == PLAYER_ONE || this.state.winner() == PLAYER_TWO) {
            let win = this.state.winInfo;
            this.fg_ctx.fillStyle = this.bgColor
            for (let p=0; p<4; p++) {
                let x = win[0]+p*win[2][0], y = this.state.height-1-(win[1]+p*win[2][1]);
                this.fg_ctx.fillRect(x*this.sqSize, y*this.sqSize, this.sqSize, this.sqSize);
            }
        }

        // draw the pieces on the board
        for (let x = 0; x < this.state.width; x++) {
            for (let y = 0; y < this.state.height; y++) {
                this.drawCircle(x*this.sqSize + this.sqHalf, (this.state.height-y-1)*this.sqSize + this.sqHalf, 0.4*this.sqSize, this.colors[this.state.get(x,y)], '#000000', 2);
            }
        }

        // draw the mouseover tile (where human piece will go)
        if (this.players[this.state.player] == null && this.state.winner() == PLAYER_NONE) {
            this.drawCircle(this.mx*this.sqSize + this.sqHalf, 
                (this.state.height-this.state.pieces[this.mx]-1)*this.sqSize + this.sqHalf, 
                0.3*this.sqSize, this.colors[this.state.player], '#000000', 0);
        } 
                   
        // draw the grid overlay
        this.fg_ctx.fillStyle = "#000000";
        for (let y = 0; y <= this.state.height; y++) { this.fg_ctx.fillRect(0, y * this.sqSize, this.state.width * this.sqSize, 1); }
        for (let x = 0; x <= this.state.width; x++)  { this.fg_ctx.fillRect(x * this.sqSize, 0, 1, this.state.height*this.sqSize); }
    }

    drawCircle(x, y, radius, fillColor, borderColor, borderWidth) {
        this.fg_ctx.fillStyle = fillColor;
        this.fg_ctx.strokeStyle = borderColor;
        this.fg_ctx.beginPath();
        this.fg_ctx.arc(x, y, radius, 0, 2*Math.PI, false);
        this.fg_ctx.fill();
        this.fg_ctx.lineWidth = borderWidth;
        this.fg_ctx.stroke();
    }

    addEventListeners() {
        this.fg.gui = this;
        this.fg.addEventListener('mousemove', 
        function (evt) {
            let mousePos = this.gui.getMousePos(this, evt);
            this.gui.mx = Math.floor(mousePos.x / this.gui.sqSize);
            this.gui.my = Math.floor(mousePos.y / this.gui.sqSize);
        }, false);
    
        this.fg.addEventListener('mousedown', 
        function (evt) {
            let mousePos = this.gui.getMousePos(this, evt);
            this.gui.mouse = evt.which;
    
            if (this.gui.mouse == 1) {
                this.gui.prevMouseClickX = Math.floor(mousePos.x / this.gui.sqSize);
                this.gui.prevMouseClickY = Math.floor(mousePos.y / this.gui.sqSize);
                this.gui.humanAction = this.gui.prevMouseClickX;
            }
        }, false);
    }

    getAlgorithm(player) {
        let id = (player == 0) ? 'selectp1alg' : 'selectp2alg';
        return document.getElementById(id).value;
    }
                   
    setAlgorithm() {
        let prefix = ['p1', 'p2'];
        this.mx = -1;
        this.my = -1;
        for (let player=0; player<2; player++) {
            let algorithm = this.getAlgorithm(player);
            this.hideElements(this.elements[player]);
            
            if (algorithm == 'playerHuman')  { this.players[player] = null; }
            if (algorithm == 'playerRandom') { this.players[player] = new Player_Random(); }
            if (algorithm == 'playerGreedy') { this.players[player] = new Player_Greedy(); }
            if (algorithm == 'playerSAB')    { 
                let config = {};
                this.showElements(this.elements[player]);
                config.timeLimit = parseInt(document.getElementById(prefix[player] + 'time').value);
                config.maxDepth = parseInt(document.getElementById(prefix[player] + 'depth').value);
                this.players[player] = new Player_Student(config); 
            }
        }
    }

    testState(actions, depth) {
        this.resetGame();
        
        for (let i=0; i<actions.length; i++)
        {
            this.doAction(actions[i]);
        }

        if (depth == 1) {
            this.message = "<b>With a Search Depth >= 1:</b><br><br>Yellow should win the game \
            immediately by placing a piece on top of the yellow stack at column 1";
        } else if (depth == 2) {
            this.message = "<b>With a Search Depth >= 2:</b><br><br>Yellow block red from winning \
            the game on the next turn by placing its piece on column 5. A depth 1 search will not \
            necessarily place the piece here, since depth 1 only checks for immediate wins. Depth 2 \
            checks opponent replies to your own moves.";
        } else if (depth == 3) {
            this.message = "<b>With a Search Depth >= 3:</b><br><br>Yellow should recognize that in \
            3 moves it should win the game no matter what red does, as long as it places a piece to continue its \
            current line along the bottom row. No matter where red will place its piece, it cannot \
            win. Yellow should place its piece in column 2 or 5. A shallower search will not be able \
            to draw this same conclusion.";
        } else if (depth == 4) {
            this.message = "<b>With a Search Depth >= 4:</b><br><br>Yellow should recognize that in \
            4 moves it will lose the game if it does not immediately place a piece to either side of \
            red's pieces on the bottom row. If both ends are left open, red can place a piece in \
            column 2 and then win the game on its next move. A shallower search than 4 will not be \
            able to see this conclusion.";
        }

        document.getElementById("selectp1alg").options.selectedIndex = 1;
        document.getElementById("selectp2alg").options.selectedIndex = 0;
        document.getElementById("p1depth").value = depth;
        this.setAlgorithm();
        
        if (this.autoplay) {
            this.toggleAutoPlay(); 
        }
        this.doturn = false;
    }

    toggleAutoPlay() {
        this.autoplay = !this.autoplay; 
        document.getElementById('toggleAI').innerHTML = this.autoplay ? "Turn OFF Autoplay" : "Turn ON Autoplay"; 
    }

    printEval() {
        if (this.players[this.state.player] != null) {
            console.log(this.players[this.state.player].eval(this.state, this.state.player));
        }
    }

    setHTML() {
        let top = 0, skip = 35, c2left = 150, c3left = 300;
        this.createCanvas(this.pixelWidth + 1, this.pixelHeight + 1);
        this.bannerDiv  = this.create('div', 'BannerContainer',  this.fg.width + 30,   0, 600,  40);
        this.controlDiv = this.create('div', 'ControlContainer', this.fg.width + 30,  60, 600, 350);
        this.textDiv    = this.create('div', 'TextContainer',    this.fg.width + 30, 530, 450, 350);
        
        // Banner HTML
        this.bannerDiv.innerHTML  = "<b>HTML5 Connect 4</b> - <a href='http://www.cs.mun.ca/~dchurchill/'>David Churchill</a>";

        // Player 1 Algorithm Selection
        this.addText(this.controlDiv, 'labelp1', 0, top, 250, 25, "Player 1 (Yellow):");
        this.addSelectBox(this.controlDiv, 'selectp1alg', c2left, top + 0*skip, 250, 25, function() { this.gui.setAlgorithm(); }, 
            [['playerHuman', 'Human'], ['playerSAB', 'Student Alpha Beta'], ['playerRandom', 'Random'], ['playerGreedy', 'Greedy']]);
        this.addText(this.controlDiv, 'labelp1time', c2left, top + 1*skip, 250, 25, "Time (ms):");
        this.addNumberBox(this.controlDiv, 'p1time', c2left + 100, top + 1*skip, 150, 25, 1000, 0, 10000, 100, 
            function() { this.gui.setAlgorithm(); });
        this.addText(this.controlDiv, 'labelp1depth',  c2left, top + 2*skip, 250, 25, "Max Depth:");
        this.addNumberBox(this.controlDiv, 'p1depth', c2left + 100, top + 2*skip, 150, 25, 1, 0, 100, 1, 
            function() { this.gui.setAlgorithm(); });

        // Player 2 Selection
        this.addText(this.controlDiv, 'labelp2', 0, top + 3*skip, 250, 25, "Player 2 (Red):");
        this.addSelectBox(this.controlDiv, 'selectp2alg', c2left, top + 3*skip, 250, 25, function() { this.gui.setAlgorithm(); }, 
            [['playerHuman', 'Human'], ['playerSAB', 'Student Alpha Beta'], ['playerRandom', 'Random'], ['playerGreedy', 'Greedy']]);
        this.addText(this.controlDiv, 'labelp2time', c2left, top + 4*skip, 250, 25, "Time (ms):");
        this.addNumberBox(this.controlDiv, 'p2time', c2left + 100, top + 4*skip, 150, 25, 1000, 0, 10000, 100, 
            function() { this.gui.setAlgorithm(); });
        this.addText(this.controlDiv, 'labelp2depth',  c2left, top + 5*skip, 250, 25, "Max Depth:");
        this.addNumberBox(this.controlDiv, 'p2depth', c2left + 100, top + 5*skip, 150, 25, 0, 0, 100, 1, 
            function() { this.gui.setAlgorithm(); });

        // Board Size Selection
        this.addText(this.controlDiv, 'labelbw',  0, top + 7*skip, 250, 25, "Board Width: 7");
        this.addSlider(this.controlDiv, 'sliderwidth', c2left, top + 7*skip, 250, 25, 7, 4, 15, 
            function() { this.gui.resetGame(); document.getElementById('labelbw').innerHTML = "Board Width: " + this.value; });
        this.addText(this.controlDiv, 'labelbh',  0, top + 8*skip, 250, 25, "Board Height: 6");
        this.addSlider(this.controlDiv, 'sliderheight', c2left, top + 8*skip, 250, 25, 6, 4, 15, 
            function() { this.gui.resetGame(); document.getElementById('labelbh').innerHTML = "Board Height: " + this.value; });

        // Buttons
        this.addButton(this.controlDiv, 'doTurn', 0, top + 10*skip, 140, 25, "Do Single AI Turn", 
            function() { this.gui.doturn = true; });
        this.addButton(this.controlDiv, 'toggleAI', 150, top + 10*skip, 140, 25, "Turn On Autoplay", 
            function() { this.gui.toggleAutoPlay(); });
        this.addButton(this.controlDiv, 'undoButton', c3left, top + 10*skip, 140, 25, "Undo Action", 
            function() { this.gui.undoAction(); });
        this.addButton(this.controlDiv, 'resetButton', 0, top + 11*skip, 140, 25, "Restart Game", 
            function() { this.gui.resetGame(); });
        this.addButton(this.controlDiv, 'hashButton', 0, top + 12*skip, 140, 25, "Print Eval", 
            function() { this.gui.printEval(); });

        this.addButton(this.controlDiv, 'test1Button', c2left, top + 11*skip, 140, 25, "Depth 1: Win", 
            function() { this.gui.testState([1,2,1,3,1,4], 1); });

        this.addButton(this.controlDiv, 'test2Button', c3left, top + 11*skip, 140, 25, "Depth 2: Block", 
            function() { this.gui.testState([1,2,2,3,1,4], 2); });

        this.addButton(this.controlDiv, 'test3Button', c2left, top + 12*skip, 140, 25, "Depth 3: Win", 
            function() { this.gui.testState([3,0,4,0], 3); })
                   
        this.addButton(this.controlDiv, 'test3Button', c3left, top + 12*skip, 140, 25, "Depth 4: Block", 
            function() { this.gui.testState([0,4,4,3], 4); })
    }
}


// Copyright (C) David Churchill - All Rights Reserved
// COMP3200 - 2022-09 - Assignment 3
// Written by David Churchill (dave.churchill@gmail.com)
// Unauthorized copying of these files are strictly prohibited
// Distributed only for course work at Memorial University
// If you see this file online please contact email above
