///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/
//
//  Assignment       COMP3200 - Assignment 3
//  Professor:       David Churchill
//  Year / Term:     2022-09
//  File Name:       GameState.js
// 
//  Student Name:    Ekuyik Essien
//  Student User:    enessien
//  Student Email:   enessien@mun.ca
//  Student ID:      202023347
//  Group Member(s): [enter student name(s)]
//
///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/

let PLAYER_ONE = 0;
let PLAYER_TWO = 1;
let PLAYER_NONE = 2;
let PLAYER_DRAW = 3;

class GameState { 
    
    constructor (width, height) {

        this.width = width;
        this.height = height;
        this.pieces = (new Array(width)).fill(0);
        this.totalPieces = 0;
        this.board = new Array(width).fill(0).map(x => new Array(height).fill(PLAYER_NONE));
        this.player = 0;
        this.dirs = [[1,0], [0,1], [1,1], [1,-1]];
        this.connect = 4;
        this.winInfo = [null, null, null];
    }

    // Returns the piece type at the given x,y position
    get(x, y) {
        return this.board[x][y];
    }

    // Returns whether or not the given x,y position is on the board
    isValid(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }
                   
    // Do the given action
    // An action is an integer representing the column to place the piece in
    // Doing the action puts the piece in the given column and switches players
    doAction(action) {
        this.board[action][this.pieces[action]] = this.player;
        this.pieces[action]++;
        this.player = (this.player + 1) % 2;
        this.totalPieces++;
    }
                   
    undoAction(action) {
        if (this.pieces[action] == 0) {
            console.log("WARNING: Trying to undo illegal action ", action );
            return;
        }
                   
        this.pieces[action]--
        this.board[action][this.pieces[action]] = PLAYER_NONE;
        this.player = (this.player + 1) % 2;
        this.totalPieces--;
    }

    // Checks to see if an action is legal or not
    // An action is an integer representing the column to place the piece in
    // An action is legal if that column is not full
    isLegalAction(action) {
        return action >= 0 && action < this.width && this.pieces[action] < this.height;
    }

    // Returns an array of legal actions
    // Checks each column to see if a piece can be put there and adds it to the array
    getLegalActions(action) {
        let legal = [];
        for (let i=0; i<this.width; i++) { 
            if (this.isLegalAction(i)) { legal.push(i); }
        }
        return legal;
    }
                   
    // Checks to see if there is a win in a given direction
    // This function is called by this.winner
    checkWin(x, y, dir, connect) {
        let p = this.get(x,y);
        if (p == PLAYER_NONE) { return; }
        let cx = x, cy = y;
        for (let c=0; c<connect-1; c++) {
            cx += dir[0]; cy += dir[1];
            if (!this.isValid(cx, cy)) { return false; }
            if (this.get(cx, cy) != p) { return false; }
        }
        return true;
    }

    // Checks to see if there is a win on the board
    // Returns PLAYER_ONE if Player One has won
    // Returns PLAYER_TWO if Player Two has won
    // Returns PLAYER_NONE if the game is not over
    // Returns PLAYER_DRAW if the game is a draw (board filled with no winner)
    winner() { 

        // For each winning direction possible
        for (let d=0; d<this.dirs.length; d++) {
            // Check to see if there's a win in that direction from every place on the board
            for (let x=0; x<this.width; x++) {
                for (let y=0; y<this.height; y++) {
                    if (this.checkWin(x, y, this.dirs[d], this.connect)) { 
                        this.winInfo = [x, y, this.dirs[d]];
                        return this.get(x,y); 
                    }
                }
            }
        }
        
        // If the number of pieces on the board is the same size as the board, it's a draw
        if (this.totalPieces == this.width * this.height) { return PLAYER_DRAW; }
        // Otherwise there is no winner
        else return PLAYER_NONE;
    }

    // does a deep-copy of a state
    // similar to Java's clone() function
    copy() {
        let state = new GameState(this.width, this.height);
        state.player = this.player;
        state.totalPieces = this.totalPieces;
        for (let x=0; x<this.width; x++) {
            state.pieces[x] = this.pieces[x];
            for (let y=0; y<this.height; y++) {
                state.board[x][y] = this.board[x][y];
            }
        }
        return state;
    }
}

// Copyright (C) David Churchill - All Rights Reserved
// COMP3200 - 2022-09 - Assignment 3
// Written by David Churchill (dave.churchill@gmail.com)
// Unauthorized copying of these files are strictly prohibited
// Distributed only for course work at Memorial University
// If you see this file online please contact email above
