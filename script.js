console.log("Alhamdulillah For EveryThing");

let songs = [];
let currentIndex = 0;
let play = document.querySelector(".play-btn");
let currentSong = new Audio();
let isDragging = false;
let dragPercent = 0;
let circle = document.querySelector(".circle");
let seekbar = document.querySelector(".seekbar");
let volumeBar = document.querySelector(".volume-bar");
let volumeProgress = document.querySelector(".volume-progress");
let wasPlaying = false;
let nextSongAudio = new Audio();
let isVolumeDragging = false;

currentSong.preload = "auto";
currentSong.volume = 1;
volumeProgress.style.width = "100%";

// Fetch songs
async function getSongs() {
  let response = await fetch("Assets/songs/songs.json");
  songs = await response.json();
  return songs;
}

// Play selected music
const playMusic = (trackObj, index) => {
  currentIndex = index;
  currentSong.src = trackObj.mp3;

  // update cover
  let cover = document.querySelector(".cover");
  let folderPath = trackObj.mp3.substring(0, trackObj.mp3.lastIndexOf("/"));
  cover.src = folderPath + "/cover.jpg";
  cover.style.display = "block";

  document.querySelector(".songinfo").innerHTML = trackObj.name;

  // play after metadata loaded
  currentSong.addEventListener("loadedmetadata", function loaded() {
    currentSong.removeEventListener("loadedmetadata", loaded);
    currentSong.play().catch(() => console.warn("Autoplay blocked"));
    play.src = "Assets/img/pause.svg";
    updateTimeDisplay();
  });

  preloadNext();
};

// Preload next song
function preloadNext() {
  let nextIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : 0;
  nextSongAudio.src = songs[nextIndex].mp3;
  nextSongAudio.load();
}

// Populate song list
async function main() {
  songs = await getSongs();
  let songUl = document.querySelector(".songList ul");
  songUl.innerHTML = "";

  songs.forEach((songObj, index) => {
    songUl.innerHTML += `
<li>
  <img src="${songObj.mp3.substring(0, songObj.mp3.lastIndexOf("/")) + "/cover.jpg"}" alt="">
  <div class="info">
    <div>${songObj.name}</div>
    <div>${songObj.artist || ""}</div>
  </div>
  <img class="invert" src="Assets/img/play.svg" alt="">
</li>`;
  });

  Array.from(songUl.getElementsByTagName("li")).forEach((e, index) => {
    e.addEventListener("click", (evt) => {
      evt.preventDefault();
      playMusic(songs[index], index);
    });
  });
}
main();

// Play/Pause
play.addEventListener("click", (e) => {
  e.preventDefault();
  if (currentSong.paused) {
    currentSong.play().catch(() => {});
    play.src = "Assets/img/pause.svg";
  } else {
    currentSong.pause();
    play.src = "Assets/img/play-btn.svg";
  }
});

// Update time display
function updateTimeDisplay() {
  if (!currentSong.duration || !isFinite(currentSong.duration)) return;

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

currentSong.addEventListener("timeupdate", updateTimeDisplay);

// Safe seek
function safeSeek(time) {
  if (!currentSong.src) return;
  currentSong.currentTime = Math.min(time, currentSong.duration);
  if (currentSong.paused) currentSong.play().catch(() => {});
}

// Seekbar drag
function updateDrag(clientX) {
  let rect = seekbar.getBoundingClientRect();
  let offset = Math.max(0, Math.min(clientX - rect.left, rect.width));
  dragPercent = offset / rect.width;

  circle.style.left = dragPercent * 100 + "%";

  let progressBar = document.querySelector(".progress");
  let circleWidth = circle.offsetWidth || 10;
  let seekWidth = seekbar.offsetWidth;
  let adjustedPercent =
    ((dragPercent * seekWidth - circleWidth / 2) / seekWidth) * 100;
  adjustedPercent = Math.max(0, Math.min(adjustedPercent, 100));
  progressBar.style.width = adjustedPercent + "%";
}

// Mouse drag events
seekbar.addEventListener("mousedown", (e) => {
  isDragging = true;
  wasPlaying = !currentSong.paused;
  document.body.style.userSelect = "none";
  updateDrag(e.clientX);
});
document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  updateDrag(e.clientX);
});
document.addEventListener("mouseup", () => {
  if (!isDragging) return;
  safeSeek(dragPercent * currentSong.duration);
  if (wasPlaying) currentSong.play();
  isDragging = false;
  document.body.style.userSelect = "auto";
});
seekbar.addEventListener("mouseleave", () => {
  if (!isDragging) return;
  safeSeek(dragPercent * currentSong.duration);
  if (wasPlaying) currentSong.play();
  isDragging = false;
  document.body.style.userSelect = "auto";
});

// Touch drag events
seekbar.addEventListener("touchstart", (e) => {
  isDragging = true;
  wasPlaying = !currentSong.paused;
  updateDrag(e.touches[0].clientX);
});
document.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  updateDrag(e.touches[0].clientX);
});
document.addEventListener("touchend", () => {
  if (!isDragging) return;
  safeSeek(dragPercent * currentSong.duration);
  if (wasPlaying) currentSong.play();
  isDragging = false;
});

// Prev/Next
document.querySelector(".prev").addEventListener("click", () => {
  currentIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
  playMusic(songs[currentIndex], currentIndex);
});
document.querySelector(".next").addEventListener("click", () => {
  currentIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : 0;
  playMusic(songs[currentIndex], currentIndex);
});

// Auto next
currentSong.addEventListener("ended", () => {
  currentIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : 0;
  playMusic(songs[currentIndex], currentIndex);
});

// Keyboard controls
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
  if (e.code === "ArrowRight") safeSeek(currentSong.currentTime + 5);
  if (e.code === "ArrowLeft") safeSeek(currentSong.currentTime - 5);
});

// Hamburger menu
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
});
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-120vw";
});

// Volume control
volumeBar.addEventListener("mousedown", (e) => {
  isVolumeDragging = true;
  updateVolume(e.clientX);
  document.body.style.userSelect = "none";
});
document.addEventListener("mousemove", (e) => {
  if (!isVolumeDragging) return;
  updateVolume(e.clientX);
});
document.addEventListener("mouseup", () => {
  if (!isVolumeDragging) return;
  isVolumeDragging = false;
  document.body.style.userSelect = "auto";
});
volumeBar.addEventListener("click", (e) => updateVolume(e.clientX));
volumeBar.addEventListener("touchstart", (e) => {
  isVolumeDragging = true;
  updateVolume(e.touches[0].clientX);
});
document.addEventListener("touchmove", (e) => {
  if (!isVolumeDragging) return;
  updateVolume(e.touches[0].clientX);
});
document.addEventListener("touchend", () => {
  if (!isVolumeDragging) return;
  isVolumeDragging = false;
});

// Volume update
function updateVolume(clientX) {
  const rect = volumeBar.getBoundingClientRect();
  let offset = Math.max(0, Math.min(clientX - rect.left, rect.width));
  let percent = offset / rect.width;
  currentSong.volume = percent;
  volumeProgress.style.width = percent * 100 + "%";
}

// Disable play icon click
document.querySelectorAll(".songList ul li img.invert").forEach((img) => {
  img.addEventListener("click", (e) => e.preventDefault());
});