var RiotRequest = require("riot-lol-api");
var fs = require("fs");

var riotRequest = new RiotRequest(process.env.RIOT_API_KEY);

const items = JSON.parse(fs.readFileSync("./assets/item.json", "utf8"));
const champions = JSON.parse(fs.readFileSync("./assets/champion.json", "utf8"));
const summoners = JSON.parse(fs.readFileSync("./assets/summoner.json", "utf8"));
// Test Payload for building parse functions with
const testMatch = JSON.parse(
  fs.readFileSync("./assets/test_match.json", "utf8")
);

/* 
This is the main request function that will be used at an endpoint to fetch the most recent 5 matches of a summoner

TODO: 
- Break requests into separate functions for better error handling
- Create an endpoint for these api requests
*/
// Get encrypted Account ID by summoner name
riotRequest.request(
  "na1",
  "summoners",
  "/lol/summoner/v4/summoners/by-name/Doublelift",
  function (err, data) {
    const accountId = data.accountId;
    const matchCount = 5;

    // Get recent 5 matches of summoner
    riotRequest.request(
      "na1",
      "match",
      `/lol/match/v4/matchlists/by-account/${accountId}?endIndex=${matchCount}`,
      function (err, data) {
        const matches = data.matches;
        const gameInfo = [];

        // Parse for GameIds
        matches.forEach(function (match) {
          gameInfo.push([match.gameId, match.champion]);
        });

        // Get individual match data
        gameInfo.forEach(function (game) {
          riotRequest.request(
            "na1",
            "match",
            `/lol/match/v4/matches/${game[0]}`,
            function (err, data) {
              const payload = formatPayloadWithMatchDataAndChampionId(
                game[1],
                data
              );
              console.log(JSON.stringify(payload));
            }
          );
        });
      }
    );
  }
);

/*========== HELPER METHODS ==========*/

// TODO: Payload attributes
// * outcome (win) X
// * kills X
// * assist X
// * deaths X
// * item1,item2,item3,item4,item5,item6 (returns id, need to use to search for Item names) (build function for item name lookup)
// * champion level (champLevel) X
// * perks… (return id, need to search for names) or through *RuneDto* (build function for perks name lookup)
// * summoner spell 1 match to summoner object (build function for summoner spell name lookup)
// * summoner spell 2 match to summoner object
// * totalMinionsKilled X
// * creep score per minute (find in *ParticipantTimelineDto*)

function formatPayloadWithMatchDataAndChampionId(championId, matchData) {
  var payload = {};
  const participant = getParticipantByChampionId(championId, matchData);

  payload["champion_name"] = findChampionName(championId);
  payload["outcome"] = participant.stats.win;
  payload["kills"] = participant.stats.kills;
  payload["deaths"] = participant.stats.deaths;
  payload["assists"] = participant.stats.assists;
  payload["champion_level"] = participant.stats.champLevel;
  payload["total_minions_killed"] = participant.stats.totalMinionsKilled;

  return payload;
}

function findChampionName(championId) {
  champion = Object.filter(
    champions.data,
    (champion) => parseInt(champion.key) == championId
  );
  return Object.keys(champion)[0];
}

function getParticipantByChampionId(championId, matchObj) {
  participant = Object.filter(
    matchObj.participants,
    (participant) => parseInt(participant.championId) == championId
  );
  const key = Object.keys(participant)[0];
  return participant[key];
}

// filter method from: https://stackoverflow.com/questions/5072136/javascript-filter-for-objects
Object.filter = (obj, predicate) => 
  Object.keys(obj)
    .filter((key) => predicate(obj[key]))
    .reduce((res, key) => ((res[key] = obj[key]), res), {});