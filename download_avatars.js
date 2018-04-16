var request = require('request');

console.log('Welcome to the GitHub Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers: {
      'User-Agent': 'request'
    }
  }

  request(options, function(err, res, body) {
    for (const user of JSON.parse(body)) {
      console.log(user.avatar_url)
    }


    // cb(err, body);
  });
}


getRepoContributors('jquery', 'jquery')