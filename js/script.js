let currentsong = new Audio();
let songs;
let currFolder;

// make song timer second and minute

function secondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// to get songs from server side

async function getSongs(folder) {
  currFolder = folder;
  let songStore = await fetch(`/${folder}/`);
  let response = await songStore.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  // console.log(div);
  let a = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < a.length; i++) {
    const element = a[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //show all the song in playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
      <img class="invert" src="./img/music.svg" alt="">
      <div class="info">
        <div> ${song.replaceAll("%20", " ")}</div>
       
      </div>
      <div class="playNow">
        <span>play</span>
        <img class="invert" src="./img/play.svg" alt="">
      </div>
  </li>`;
  }

  // add event listener to each song
  let songListLi = document
    .querySelector(".songList")
    .getElementsByTagName("li");
  Array.from(songListLi).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

// function to play music

let playMusic = (track, pause = false) => {
  currentsong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "./img/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

// display album function++++

async function displayAlbums() {
  let songStore = await fetch(`/songs/`);
  let response = await songStore.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  // console.log(div);
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").splice(-1)[0];
      // get the meta data of the folder
      let songStore = await fetch(`/songs/${folder}/info.json`);
      let response = await songStore.json();
      // console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
      <div class="play">
        <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="2 2 20 20"
          class="Svg-sc-ytk21e-0 iYxpxA">
          <path
            d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
          </path>
        </svg>
      </div>
      <img src="/songs/${folder}/cover.jpg" alt="">
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`;
    }
  }

  // load the library playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

//+++ this is the main function to control all buttons and text as well

async function main() {
  // get list of all the songs
  await getSongs("songs/new");
  playMusic(songs[0], true);

  // display all the albums on page
  displayAlbums();

  // add event listener to play,previous and next button
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "./img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "./img/play.svg";
    }
  });

  // listen to timeUpdate
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(
      ".songTime"
    ).innerHTML = `${secondsToMinutesAndSeconds(currentsong.currentTime)} 
    / ${secondsToMinutesAndSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  //add event listener to seekbar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // add event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // add event listener on previous
  previous.addEventListener("click", (e) => {
    let index = songs.indexOf(currentsong.src.split("/").splice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // add event listener on next
  next.addEventListener("click", (e) => {
    currentsong.pause();
    let index = songs.indexOf(currentsong.src.split("/").splice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // add event listener to volume
  let volumeBtn = document.querySelector(".range");
  volumeBtn.getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
  });

  // load the library playlist when card is clicked
  // Array.from(document.getElementsByClassName("card")).forEach((e) => {
  //   e.addEventListener("click", async (item) => {
  //     songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
  //   });
  // });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentsong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentsong.volume = 1.0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 40;
    }
  });

  // add event listener in signin button
  document.querySelector("#alertShow").addEventListener("click", function () {
    alert("this is on working 😊");
  });

  // add event listener in signin button
  document.querySelector("#alertShoe").addEventListener("click", function () {
    alert("this is on working 😊");
  });
}

main();
