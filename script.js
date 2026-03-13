console.log("shanti");

let songs = [];
let currentIndex = 0;
let play = document.querySelector(".play-btn");
let currentSong = new Audio();
let isDragging = false;
let circle = document.querySelector(".circle");
let seekbar = document.querySelector(".seekbar");

circle.addEventListener("mousedown", () => {
  isDragging = true;
});

async function getSongs() {
  let response = await fetch("Assets/songs/songs.json");
  songs = await response.json();
  return songs;
}

const playMusic = (trackObj, index) => {
  currentIndex = index;

  currentSong.pause();
  currentSong.currentTime = 0;

  currentSong.src = trackObj.mp3;
  currentSong.play();

  play.src = "Assets/img/pause.svg";

  document.querySelector(".songinfo").innerHTML = trackObj.name;

  let cover = document.querySelector(".cover");
  cover.src = trackObj.cover;
  cover.style.display = "block";
};

async function main() {
  songs = await getSongs();
  console.log(songs);

  let songUl = document.querySelector(".songList ul");
  songUl.innerHTML = "";

  for (let i = 0; i < songs.length; i++) {
    let songObj = songs[i];

    songUl.innerHTML += `
<li>
  <img src="${songObj.cover}" alt="">
  <div class="info">
    <div>${songObj.name}</div>
    <div>${songObj.artist || ""}</div>
  </div>
  <img class="invert" src="Assets/img/play.svg" alt="">
</li>
`;
  }

  Array.from(songUl.getElementsByTagName("li")).forEach((e, index) => {
    e.addEventListener("click", () => playMusic(songs[index], index));
  });
}

main();

play.addEventListener("click", () => {
  if (currentSong.paused) {
    currentSong.play();
    play.src = "Assets/img/pause.svg";
  } else {
    currentSong.pause();
    play.src = "Assets/img/play-btn.svg";
  }
});

currentSong.addEventListener("timeupdate", () => {
  if (!isNaN(currentSong.duration)) {
    let current = currentSong.currentTime;
    let total = currentSong.duration;

    let currentMin = Math.floor(current / 60);
    let currentSec = Math.floor(current % 60);

    let totalMin = Math.floor(total / 60);
    let totalSec = Math.floor(total % 60);

    if (currentSec < 10) currentSec = "0" + currentSec;
    if (totalSec < 10) totalSec = "0" + totalSec;

    document.querySelector(".songtime").innerHTML =
      `${currentMin}:${currentSec} / ${totalMin}:${totalSec}`;

    let percent = (current / total) * 100;

    circle.style.left = percent + "%";
    document.querySelector(".progress").style.width = percent + "%";
  }
});

document.querySelector(".prev").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
  } else {
    currentIndex = songs.length - 1;
  }

  playMusic(songs[currentIndex], currentIndex);
});

document.querySelector(".next").addEventListener("click", () => {
  if (currentIndex < songs.length - 1) {
    currentIndex++;
  } else {
    currentIndex = 0;
  }

  playMusic(songs[currentIndex], currentIndex);
});

currentSong.addEventListener("ended", () => {
  if (currentIndex + 1 < songs.length) {
    currentIndex++;
    playMusic(songs[currentIndex], currentIndex);
  }
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  let rect = seekbar.getBoundingClientRect();

  let offset = e.clientX - rect.left;

  if (offset < 0) offset = 0;
  if (offset > rect.width) offset = rect.width;

  let percent = (offset / rect.width) * 100;

  circle.style.left = percent + "%";
  document.querySelector(".progress").style.width = percent + "%";
});

document.addEventListener("mouseup", (e) => {
  if (!isDragging) return;

  let rect = seekbar.getBoundingClientRect();

  let offset = e.clientX - rect.left;

  let percent = (offset / rect.width) * 100;

  currentSong.currentTime = (currentSong.duration * percent) / 100;

  isDragging = false;
});

seekbar.addEventListener("click", (e) => {
  let rect = seekbar.getBoundingClientRect();

  let offset = e.clientX - rect.left;

  let percent = (offset / rect.width) * 100;

  circle.style.left = percent + "%";
  document.querySelector(".progress").style.width = percent + "%";

  currentSong.currentTime = (currentSong.duration * percent) / 100;
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();

    if (currentSong.paused) {
      currentSong.play();
      play.src = "Assets/img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "Assets/img/play-btn.svg";
    }
  }

  if (e.code === "ArrowRight") {
    currentSong.currentTime += 5;
  }

  if (e.code === "ArrowLeft") {
    currentSong.currentTime -= 5;
  }
});
