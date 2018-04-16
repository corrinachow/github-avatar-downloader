const request = require('request');
const fs = require('fs');
const GITHUB_TOKEN = require('./secrets');
const repoInfo = process.argv.slice(2);

console.log('Welcome to the GitHub Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
  if (!repoOwner || !repoName) {
    console.log(`Please specify arguments using the following format: repoOwner repoName`)
    return;
  };
  const options = {
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `token ${GITHUB_TOKEN.GITHUB_TOKEN}`
    }
  };
  request(options, function(err, res, body) {
    for (const user of JSON.parse(body)) {
      cb(user.avatar_url, `avatars/${user.login}.jpg`);
    };
  });
}

function downloadImageByURL(url, filePath) {
  request
    .get(url)
    .on('error', err => {
      throw err;
    })
    .on('response', response => {
      console.log (response.statusCode, response.statusMessage, response.headers['content-type']);
      console.log('Downloading image...');
    })
    .pipe(fs.createWriteStream(filePath))
    .on('finish', () => {
      console.log('Download complete.');
    })
}

getRepoContributors(repoInfo[0], repoInfo[1], downloadImageByURL);
