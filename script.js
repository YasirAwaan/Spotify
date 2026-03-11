console.log("shanti");

let songs = []; // global
let currentSong = new Audio();
async function getSongs() {
  let a = await fetch("http://192.168.100.6:3000/Assets/songs/");
  let response = await a.text();
  console.log(response);

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }
  return songs;
}

const playMusic = (track) => {
  currentSong.pause();
  currentSong.currentTime = 0;
  currentSong.src = track;
  currentSong.play();
};
async function main() {
  // Get The List Of The All Songs
  songs = await getSongs();
  console.log(songs);

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  for (const song of songs) {
    let songName = decodeURIComponent(song)
      .split(/[/\\]/)
      .pop()
      .replace(".mp3", "");
    songUl.innerHTML += `
      <li>
        <img class="invert" src="Assets/img/music.svg" alt="">
        <div class="info">
          <div>${songName}</div>
          <div></div>
        </div>
        <img class="invert" src="Assets/img/play.svg" alt="">
      </li>
    `;
  }

  // var audio = new Audio(songs[0]);

  currentSong.addEventListener("loadeddata", () => {
    let duration = currentSong.duration;
    console.log(
      currentSong.duration,
      currentSong.currentSrc,
      currentSong.currentTime,
    );
  });

  // Attach an Event Listener To Each Song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li"),
  ).forEach((e, index) => {
    e.addEventListener("click", () => {
      playMusic(songs[index]);
    });
  });
}

main();
