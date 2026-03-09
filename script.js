console.log("shanti");

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

async function main() {
  // Get The List Of The All Songs
  let songs = await getSongs();
  console.log(songs);

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  for (const song of songs) {
    let songName = decodeURIComponent(song);
    songName = songName.split("\\").pop();
    songName = songName.replace(".mp3", "");

    songUl.innerHTML += `
      <li>
        <img class="invert" src="Assets/img/music.svg" alt="">
        <div class="info">
          <div>${songName}</div>
          <div>Song Artist</div>
        </div>
        <img class="invert" src="Assets/img/play.svg" alt="">
      </li>
    `;
  }

  var audio = new Audio(songs[0]);
  // audio.play();

  audio.addEventListener("loadeddata", () => {
    let duration = audio.duration;
    console.log(audio.duration, audio.currentSrc, audio.currentTime);
  });
}

main();
