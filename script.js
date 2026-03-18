console.log("Alhamdulillah For EveryThing");
let songs = [];
let currentIndex = 0;
let play = document.querySelector(".play-btn");
let currentSong = new Audio();
let isDragging = false;
let circle = document.querySelector(".circle");
let seekbar = document.querySelector(".seekbar");
currentSong.preload = "auto";
circle.addEventListener("mousedown", () => {
  isDragging = true;
});

// Disable text/image selection while dragging
seekbar.addEventListener("mousedown", (e) => {
  isDragging = true;
  document.body.style.userSelect = "none";
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

  // mp3 path se cover path automatically banana
  let folderPath = trackObj.mp3.substring(0, trackObj.mp3.lastIndexOf("/"));
  let coverPath = folderPath + "/cover.jpg";

  cover.src = coverPath;
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
  <img src="${songObj.mp3.substring(0, songObj.mp3.lastIndexOf("/")) + "/cover.jpg"}" alt="">
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

  offset = Math.max(0, Math.min(offset, rect.width));

  let percent = offset / rect.width;

  currentSong.currentTime = currentSong.duration * percent;

  isDragging = false;
});

seekbar.addEventListener("click", (e) => {
  if (isDragging) return;
  let rect = seekbar.getBoundingClientRect();
  let offset = e.clientX - rect.left;
  offset = Math.max(0, Math.min(offset, rect.width));
  let percent = offset / rect.width;
  circle.style.left = percent * 100 + "%";
  document.querySelector(".progress").style.width = percent * 100 + "%";

  currentSong.currentTime = currentSong.duration * percent;
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
// Right click disable
// document.addEventListener("contextmenu", (e) => e.preventDefault());

// F12 / Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+U block karna

// document.addEventListener("keydown", (e) => {
//   if (
//     e.key === "F12" ||
//     (e.ctrlKey && e.shiftKey && ["I", "J"].includes(e.key.toUpperCase())) ||
//     (e.ctrlKey && e.key.toUpperCase() === "U")
//   ) {
//     e.preventDefault();
//     alert("Sorry, inspect is disabled By Yasir Awan😎");
//   }
// });

// Add an EventListner For Hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
});
// Add an EventListner For Close
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-120%";
});

const volumeBar = document.querySelector(".volume-bar");
const volumeProgress = document.querySelector(".volume-progress");

volumeBar.addEventListener("click", (e) => {
  const rect = volumeBar.getBoundingClientRect();
  const offset = e.clientX - rect.left;
  const percent = Math.max(0, Math.min(offset / rect.width, 1));

  currentSong.volume = percent; // set audio volume
  volumeProgress.style.width = percent * 100 + "%";
});