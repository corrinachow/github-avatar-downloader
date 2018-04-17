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

function downloadImageByURL(err, userData) {
  checkAvatarFolder();
  for (const user of userData) {
    request
    .get(user.avatar_url)
    .on('error', err => {
      throw err;
    })
    .on('response', response => {
      console.log (response.statusCode, response.statusMessage, response.headers['content-type']);
      console.log('Downloading image...');
    })
    .pipe(fs.createWriteStream(`avatars/${userData.login}.jpg`))
    .on('finish', () => {
      console.log('Download complete.');
    })
  }
}

//res.name
//res.stargazers_count

function arrSort(arr) {

}

function parseStarredData(err, userData, user) {
  console.log(user)
  const starredReposList = {};
  for (const repo of JSON.parse(userData)) {

    const userStarredRepo = {};
    const reposStarredByUser = {
      name: repo.name,
      stars: repo.stargazers_count,
    };
    //Object.assign(target, ...sources)
    if (!starredReposList[user]) {
      starredReposList[user] = [];
    }

    starredReposList[user].push(reposStarredByUser)


  }
  console.log(starredReposList)
}


function recommendRepo(err, userData) {
  for (const user of userData) {
    const options = {
      url: `https://api.github.com/users/${user.login}/starred`,
      headers: {
      'User-Agent': 'request',
      'Authorization': `token ${process.env.GITHUB_TOKEN}`
    }
  }
    request(options, function(err, res, body) {
      parseStarredData(err, body, user.login);
})
    //   const starredReposList = []
    //   for (const repo of JSON.parse(body)) {
    //     const userStarredRepo = {};
    //     const reposStarredByUser = {
    //       name: repo.name,
    //       stars: repo.stargazers_count,
    //     };
    //     starredReposList.push(reposStarredByUser);
    //   }
    //   console.log(starredReposList)
    // });
  }
}


  //   .get(`https://api.github.com/users/${user.login}/starred`)
  //   .on('error', err => {
  //     throw err;
  //   })
  //   .on('response', (response) => {
  //     // console.log(response);
  //   })
  //   .on('finish', () => {
  //     console.log('Download complete.');
  //   })
  // }

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
      throw err;
    }
    checkResponse(res);
    cb(err, JSON.parse(body));
  });
}

getRepoContributors(username, repo, recommendRepo);
