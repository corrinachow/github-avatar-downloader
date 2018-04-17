const request = require('request');
const fs = require('fs');
const [username, repo] = process.argv.slice(2);

require('dotenv').config()

console.log('Welcome to the GitHub Avatar Downloader!');

function checkUsername() {
  if (!username) {
    console.log('Please enter a username');
    process.exit(1);
  };
}

function checkRepo() {
  if (!repo) {
    console.log('Please enter a repository name');
    process.exit(1);
  };
}

function checkEnv() {
  if (!fs.existsSync('.env')) {
    console.log('.env file does not exist');
    process.exit(1);
  };

  fs.readFile('.env', 'utf8', function (err, data) {
    if (err) {
      console.log(err);
    } else if (!data.includes('GITHUB_TOKEN')) {
      console.log('Please configure your .env file with GITHUB_TOKEN');
    };
  });
  return;
}

function checkArguments() {
  checkUsername();
  checkRepo();
  checkEnv();
}

checkArguments();

function checkResponse(res) {
  if (res.statusCode !== 200) {
    console.log(`${res.statusCode}: ${res.statusMessage}`)
    process.exit(1);
  } else if (res.statusCode === 401) {
    console.log(`${res.statusCode}: ${res.statusMessage}\nOAuth key invalid`);
    process.exit(1);
  } else if (res.statusCode === 404) {
    console.log(`${res.statusCode}: ${res.statusMessage}\nRepository not found`);
    process.exit(1);
  }
  return
}

function checkAvatarFolder() {
  if (!fs.existsSync('./avatars')) {
    fs.mkdirSync('./avatars');
  };
  return;
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

function getRepoContributors(repoOwner, repoName, cb) {
  const options = {
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/contributors`,
    headers: {
      'User-Agent': 'request',
      'Authorization': `token ${process.env.GITHUB_TOKEN}`
    }
  };

  request(options, function(err, res, body) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    checkResponse(res);
    checkAvatarFolder();
      for (const user of JSON.parse(body)) {
        cb(user.avatar_url, `avatars/${user.login}.jpg`);
      };
  });
}

getRepoContributors(username, repo, downloadImageByURL);
