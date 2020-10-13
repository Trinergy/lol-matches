var RiotRequest = require('riot-lol-api');
var fs = require('fs');
 
var riotRequest = new RiotRequest(process.env.RIOT_API_KEY);

var items = JSON.parse(fs.readFileSync('./assets/item.json', 'utf8'));
var champions = JSON.parse(fs.readFileSync('./assets/champion.json', 'utf8'))
var summoners = JSON.parse(fs.readFileSync('./assets/summoner.json', 'utf8'))

// Get encrypted Account ID by summoner name
riotRequest.request('na1', 'summoners', '/lol/summoner/v4/summoners/by-name/Doublelift', function(err, data) {
  const accountId = data.accountId
  const matchCount = 5

  // Get recent 5 matches of summoner
  riotRequest.request('na1', 'match', `/lol/match/v4/matchlists/by-account/${accountId}?endIndex=${matchCount}`, function(err, data) {
    const matches = data.matches;
    const gameIds = [];
    
    // Parse for GameIds
    matches.forEach(function(match){
      gameIds.push(match.gameId)
    });

    // Get individual match data
    gameIds.forEach(function(gameId) {
      riotRequest.request('na1', 'match', `/lol/match/v4/matches/${gameId}`, function(err, data) {
        console.log(data)
      })
    });

  })
});