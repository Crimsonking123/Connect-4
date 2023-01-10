///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/
//
//  Assignment       COMP3200 - Assignment 3
//  Professor:       David Churchill
//  Year / Term:     2022-09
//  File Name:       Player_Student.js
// 
//  Student Name:    Ekuyik Essien
//  Student User:    enessien
//  Student Email:   enessien@mun.ca
//  Student ID:      202023347
//  Group Member(s): [Ekuyik Essien 202023347, Matthew Keough #201800737 mkeough18@mun.ca]
//
///\/\/\\\/\\/\/\\//\/\/////\\/\//\/\/\\\/\\/\/\\//\/\/////\\/\/
                   
//This class extends the Error class for specific timeout exceptions
class TimeOutException extends Error
{
    constructor(message) 
    {
        super(message);
        this.name = 'TimeOutException';
    }
}                   
class Player_Student {
    
    constructor(config) 
    {
        this.config = config;
        this.searchStartTime = 0;

        this.bestAction         = null;
        this.currentBestAction  = null;
        this.currentMaxDepth    = null;
        this.maxPlayer          = null;

        console.log("Student AB Player");
        console.log("  Time Limit: ", this.config.timeLimit);
        console.log("  Max  Depth: ", this.config.maxDepth);
    }
       
    // Function which is called by the GUI to get the action
    getAction(state) 
    {
        return this.IDAlphaBeta(state);
    }

    // This funtion implements Iterative Deepening Alpha Beta (IDAB). It calls the
    // separate AlphaBeta function which implements the MiniMax search with Alpha Beta pruning.
    IDAlphaBeta(state) 
    {

        this.searchStartTime = performance.now();
        this.maxPlayer = state.player;
        let limit = this.config.maxDepth;
        //Set the limit to infinity since no max depth is set
        if(this.config.maxDepth == 0)
        {
            limit = Infinity;
        }
        for(let d = 1;d<=limit;d++)
        {
            this.currentMaxDepth = d;
            try
            {
                this.AlphaBeta(state,-Infinity,+Infinity,0,true);
                this.bestAction = this.currentBestAction;
            }
            //If time has been exceeded break the loop and return the last best action
            catch(Error)
            {
                if(Error instanceof TimeOutException)
                {
                    console.log("timeout");
                    break;
                }
            }
        }
        // return the best action found
        return this.bestAction;
    }

    // This funtion implements MiniMax with Alpha-Beta Pruning.
    // This function returns a state value.
    AlphaBeta(state, alpha, beta, depth, max) 
    {

        if(state.winner() != PLAYER_NONE || depth >= this.currentMaxDepth)
        {
            return this.eval(state,this.maxPlayer);
        }

  
        let timeElapsed = performance.now() - this.searchStartTime;
        if(this.config.timeLimit != 0)
        {
            if(timeElapsed > this.config.timeLimit)
            {
                throw new TimeOutException();
            }
        }
        // Recursive condtional alternating between both players
        if(max == true)
        {
            let actions = state.getLegalActions();
            let v = -Infinity;
            let vprime = 0;
            for (let a = 0; a<actions.length; a++)
            {
                let child = state.copy();
                child.doAction(actions[a]);
                vprime = this.AlphaBeta(child,alpha,beta,depth+1,!max);
                //Optimisation for wins and losses further down the tree
                if (vprime == 10000){
                    vprime = vprime - depth;
                }
                else if(vprime == -10000){
                    vprime = vprime + depth;
                }
 
                if(vprime > v)
                {
                    v = vprime;
                }
                if(vprime >= beta)
                {
                    return v;
                }
                if(vprime > alpha)
                {
                    alpha = vprime;
                    if(depth == 0)
                    {
                        this.currentBestAction = actions[a];
                    }
                }
            }    
            return v;

        }
        // min
        else
        {
            let actions = state.getLegalActions();
            let v = Infinity;
            let vprime = 0;
            for (let a = 0; a<actions.length; a++)
            {
                let child = state.copy();   
 
                child.doAction(actions[a]);
                vprime = this.AlphaBeta(child,alpha,beta,depth+1,!max);
                //Optimisation for wins and losses further down the tree
                if (vprime == 10000){
                    vprime = vprime - depth;
                }
                else if(vprime == -10000){
                    vprime = vprime + depth;
                }

                if(vprime < v)
                {
                    v = vprime;
                }
                if(vprime <= alpha)
                {
                    return v;
                }
                if(vprime < beta)
                {
                    beta = vprime;
                }
            }
            return v    // return the value
        }
    }

    // This funtion computes a heuristic evaluation of a given state for a given player.
    // It returns a large positive value for a 'good' state for the player, and a large
    // negative value for a 'bad' state for the player. 
    eval(state, player) 
    {
        let winner = state.winner();
        if      (winner == player)              { return 10000; }   // win, return large#
        else if (winner == (player + 1) % 2)    { return -10000; }  // loss, return -large#
        else if (winner == PLAYER_DRAW)         { return 0; }       // draw, return 0
        else if (winner == PLAYER_NONE) 
        {   
            let estimate = 0;
            for (let x=0; x<(state.width-state.connect); x++) 
            {
                for (let y=0; y<(state.height-state.connect); y++) 
                {
                    // possibleConnects handles all the calculations for the positive value
                    // based off how many potential connects there are and how close they are.
                    estimate += this.possibleConnects(state, player, x, y);

                    // this handles the negative part of the calcualtion!
                    if (state.get(x,y) == (player + 1) % 2)
                    {
                        estimate -= 100; //heavy negative focus
                    }
                }
            }
            return estimate;
        }
    }

    // this function is here to scan the board and see if their are potential connects for a given point
    // this function will also calculate the value for these potential connections
    // with the value being slightly higher for the more spots the have already claimed towards these potential connects
    // this function will return a number value of the moves for that state
    possibleConnects(state, player, x, y)
    {
        if (!state.isValid(x, y)) { return 0; }     // invalid state returns 0
        else
        {
            let hori = 0;
            let vert = 0;
            let diag = 0;
            let horiVal = 0;
            let vertVal = 0;
            let diagVal = 0;
            let total = 0;
            // for each move towards a connect on the board:
            // see if the possibility for a connect exists.
            // if there is already claimed areas in favour of the player...
            // give higher value to potential matches.
            for (let move = 1; move <= state.connect;)
            {
                // checks for horizontal connect
                if (state.get(x+move, y) == player)
                {
                    hori++;
                    horiVal+=120; //higher value the closer to a connect
                }
                if (state.get(x+move, y) == PLAYER_NONE)
                {
                    hori++;
                    horiVal+=80; //less value gained if far off from a connect
                }
                // checks for vertical connect
                if (state.get(x, y+move) == player)
                {
                    vert++;
                    vertVal+=120;
                }
                if (state.get(x, y+move) == PLAYER_NONE)
                {
                    vert++;
                    vertVal+=80;
                }
                // checks for diagonal connect
                if (state.get(x+move, y+move) == player)
                {
                    diag++;
                    diagVal+=120;
                }
                if (state.get(x+move, y+move) == PLAYER_NONE)
                {
                    diag++;
                    diagVal+=80;
                }
                move++;
            }
            // confirms possible connections and adds to total
            if (hori == state.connect)
            {
                total+=horiVal;
            }
            if (vert == state.connect)
            {
                total+=vertVal;
            }
            if (diag == state.connect)
            {
                total+=diagVal;
            }
            return total;
        }
    }

}

// Copyright (C) David Churchill - All Rights Reserved
// COMP3200 - 2022-09 - Assignment 3
// Written by David Churchill (dave.churchill@gmail.com)
// Unauthorized copying of these files are strictly prohibited
// Distributed only for course work at Memorial University
// If you see this file online please contact email above
