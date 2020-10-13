var RiotRequest = require('riot-lol-api');
 
var riotRequest = new RiotRequest(process.env.RIOT_API_KEY);

riotRequest.request('na1', 'summoners', '/lol/summoner/v4/summoners/by-name/Doublelift', function(err, data) {
  console.log(data)
});