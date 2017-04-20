'use strict'
const bergerConst = require('./bergerConstant');

module.exports = {
	generateGames: (compId, playersArr) => {
	    // Check if we have the correct berger
	    const currentBerger = bergerConst[playersArr.length];
        if( !currentBerger) {
            return;
        }

        // Iterate and create the games objects
        let games = [];
        for (let i = 0; i < currentBerger.length; i++) {
            for( let z = 0; z < currentBerger[i].length; z++ ){
                const boardPlayerNumbers = currentBerger[i][z].split(':');
                const fIndex = parseInt(boardPlayerNumbers[0]);
                const sIndex = parseInt(boardPlayerNumbers[1]);
                const obj = {
                    comp_id: compId,
                    round: i + 1,
                    p1_id: playersArr[fIndex-1],
                    p1_color: 0, // White color
                    p2_id: playersArr[sIndex-1],
                    p2_color: 1, // Black color
                };
                games.push(obj);
            }
        }
        return games;
	}
};