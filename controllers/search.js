const https = require("https");
require("dotenv").config();

const Vocabulary = require("../models/vocabulary");
const { validationResult } = require('express-validator');

exports.search = async (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(422).json({
      error: validation.errors[0].msg
    });
  }

  const word = req.body.word;

  let wordInDB;
  try {
    wordInDB = await Vocabulary.findOne({ word: word });
  } catch (err) {
    err.httpStatusCode = 500;
    err.msg = "Something went wrong";
    return next(err);
  }

  if (wordInDB) {
    return res.status(200).json({
      id: wordInDB._id,
      word: wordInDB.word,
      type: wordInDB.type,
      definition: wordInDB.definition,
      example: wordInDB.example
    })
  }

  const HOST = process.env.HOST;
  const APP_ID = process.env.APP_ID;
  const APP_KEY = process.env.APP_KEY;

  const fields = "definitions%2Cexamples";
  const strictMatch = "false";
  const language = "en-us";

  const path = "/api/v2/entries/" + language + "/" + word + "?fields=" + fields + "&strictMatch=" + strictMatch;

  const options = {
    host: HOST,
    port: "443",
    path: path,
    headers: {
      "app_id": APP_ID,
      "app_key": APP_KEY
    }
  };


  https.get(options, (resp) => {
    let body = "";
    
    resp.on("data", (data) => {
      if (resp.statusCode === 200) {
        body += data;
      }
    });
    
    resp.on("end", async () => {
      if (resp.statusCode === 200) {
        let parsedData = JSON.parse(body);
        const result = parsingResults(parsedData);

        const vocab = new Vocabulary({
          word: word,
          type: result.typeOfWord,
          definition: result.definition,
          example: result.example,
        });

        let newVocab;
        try {
          newVocab = await vocab.save();
        } catch (err) {
          console.log(err);
          return res.status(500).json({
            error: "Something went wrong!"
          });
        }
        
        return res.status(200).json({
          id: newVocab._id,
          word: newVocab.word,
          type: newVocab.type,
          definition: newVocab.definition,
          example: newVocab.example
        });
      }

      if (resp.statusCode === 404) {
        return res.status(404).json({
          error: "No word matching in dictionary!"
        });
      }

      console.log("Oxford API Response Error: ", resp.statusCode);

      return res.status(resp.statusCode).json({
        error: "Something went wrong!"
      });
    });

    resp.on("error", (error) => {
      console.log("Problem with Oxford API request:///",error);
    })

  });
}


function parsingResults(data) {
  let results = data.results;

  for (let result of results) {
    let lexicalEntries = result.lexicalEntries;

    for (let lexicalEntry of lexicalEntries) {
      let entries = lexicalEntry.entries;
      let typeOfWord = lexicalEntry.lexicalCategory.id;

      for (let entry of entries) {

        if (entry.hasOwnProperty("senses")) {
          let senses = entry.senses;

          for (let sense of senses) {
            if (sense.hasOwnProperty("definitions") && sense.hasOwnProperty("examples")) {
              return {
                typeOfWord,
                definition: sense.definitions[0],
                example: sense.examples[0].text
              }
            } else {
              if (sense.hasOwnProperty("subsenses")) {
                let subsenses = sense.subsenses;

                for (let subsense of subsenses) {
                  if (subsense.hasOwnProperty("definitions") && subsense.hasOwnProperty("examples")) {
                    return {
                      typeOfWord,
                      definition: subsense.definitions[0],
                      example: subsense.examples[0].text
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}