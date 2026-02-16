const functions = require("@google-cloud/functions-framework");

// Creates a client
const { Firestore } = require("@google-cloud/firestore");
const db = new Firestore({ databaseId: "watch-wolf-war" });

const docRef = db.collection("cards");

functions.http("watchWolfWar", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Cache-Control", "public, max-age=86400");
  if (req.method == "GET") {
    const responseArray = [];
    const thing = await docRef.get();
    thing.forEach((e) => responseArray.push(e.data()));
    res.send({ data: responseArray });
  } else if (req.method == "POST") {
    const winId = JSON.parse(req.body).WinId;
    const loseId = JSON.parse(req.body).LoseId;

    const winResult = (await docRef.doc(winId).get()).data();
    const loseResult = (await docRef.doc(loseId).get()).data();

    if (!winResult) {
      await docRef.doc(winId).set({
        Id: winId,
        Wins: 1,
        Matches: 1,
      });
    } else {
      await docRef.doc(winId).set({
        Id: winId,
        Wins: winResult.Wins + 1,
        Matches: winResult.Matches + 1,
      });
    }
    if (!loseResult) {
      await docRef.doc(loseId).set({
        Id: loseId,
        Wins: 0,
        Matches: 1,
      });
    } else {
      await docRef.doc(loseId).set({
        Id: loseId,
        Wins: loseResult.Wins,
        Matches: loseResult.Matches + 1,
      });
    }
    res.send({ winId, loseId });
  } else {
    res.send();
  }
});
