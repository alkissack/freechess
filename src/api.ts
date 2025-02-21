import { Router } from "express";
import fetch from "node-fetch";
import { Chess } from "chess.js";
import pgnParser from "pgn-parser";

import analyse from "./lib/analysis";
import { Position } from "./lib/types/Position";
import { ParseRequestBody, ReportRequestBody } from "./lib/types/RequestBody";

const router = Router();

router.post("/parse", async (req, res) => {

    let { pgn }: ParseRequestBody = req.body;
    
    if (!pgn) {
        return res.status(400).json({ message: "Enter a PGN to analyse." });
    }

    // Parse PGN into object
    try {
        var [ parsedPGN ] = pgnParser.parse(pgn);

        if (!parsedPGN) {
            return res.status(400).json({ message: "Enter a PGN to analyse." });
        }
    } catch (err) {
        return res.status(500).json({ message: "Failed to parse invalid PGN." });
    }

    // Create a virtual board
    let board = new Chess();
    let positions: Position[] = [];

    positions.push({ fen: board.fen() });

    // Add each move to the board; log FEN and SAN
    for (let pgnMove of parsedPGN.moves) {
        let moveSAN = pgnMove.move;

        let virtualBoardMove;
        try {
            virtualBoardMove = board.move(moveSAN);
        } catch (err) {
            return res.status(400).json({ message: "PGN contains illegal moves." });
        }

        let moveUCI = virtualBoardMove.from + virtualBoardMove.to;

        positions.push({
            fen: board.fen(),
            move: {
                san: moveSAN,
                uci: moveUCI
            }
        });
    }

    res.json({ positions });

});

router.post("/report", async (req, res) => {
    // EAK ///////// NEW
    let { positions }: ReportRequestBody = req.body;

    if (!positions) {
        return res.status(400).json({ message: "Missing parameters." });
    }
    // EAK ///////// WAS 
    // EAK let { positions, captchaToken }: ReportRequestBody = req.body;

    // EAK if (!positions || !captchaToken) {
    // EAK     return res.status(400).json({ message: "Missing parameters." });
    // EAK }

    // EAK // Verify CAPTCHA response token
    // EAK if (process.env.RECAPTCHA_SECRET) {
    // EAK     try {
    // EAK        let captchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    // EAK             method: "POST",
    // EAK             headers: {
    // EAK                 "Content-Type": "application/x-www-form-urlencoded"
    // EAK             },
    // EAK             body: `secret=${process.env.RECAPTCHA_SECRET}&response=${captchaToken}`
    // EAK         });
    // EAK 
    // EAK        let captchaResult = await captchaResponse.json();
    // EAK         if (!captchaResult.success) {
    // EAK             return res.status(400).json({ message: "You must complete the CAPTCHA." });
    // EAK         }
    // EAK     } catch (err) {
    // EAK         return res.status(500).json({ message: "Failed to verify CAPTCHA." });
    // EAK     }
    // EAK }

    // Generate report
    try {
        var results = await analyse(positions);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to generate report." });
    }

    res.json({ results });

});

export default router;
