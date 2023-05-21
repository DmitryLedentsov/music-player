let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");
let player = document.querySelector(".player");
let background = document.querySelector("#background");
let track_index = 0;
let isPlaying = false;
let updateTimer;


let curr_track = document.createElement('audio');

let canvas = document.getElementById("visual");
let ctx = canvas.getContext("2d");
let context,src,analyser;
// список треков
let track_list = [
  {
    name: "The Next Episode",
    artist: "Snoop Dog",
    image: "assets/images/snoop-dog-smoking.gif",
    path: "assets/music/Dr. Dre feat. Snoop Dogg - The Next Episode.mp3",
  },
  {
    name: "Telephone",
    artist: "Lady Gaga & Beyonce",
    image: "assets/images/Studio_Project (1) (2).gif",
    path: "assets/music/telephone.mp3"
  },
 
  {
    name: "Toxibombs",
    artist: "Trapsa",
    image: "assets/images/phychdelic.jpg",
    path: "assets/music/Trampsta & Heavy Drop - Toxibombs.mp3"
  },
  {
    name: "Parabola",
    artist: "Tool",
    image: "assets/images/visionary.jpg",
    path: "assets/music/Tool - Parabol + Parabola.mp3",
  },
];



function visualize(){ 

  curr_track.crossOrigin ="anonymous";
  context = new (window.AudioContext || window.webkitAudioContext)();
  src = context.createMediaElementSource(curr_track);
// analyser = analyser?analyser: context.createAnalyser();

  analyser = context.createAnalyser();

  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 256;

  var bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);

  var dataArray = new Uint8Array(bufferLength);

  
  const barWidth = canvas.width / 2 / bufferLength; //ширина столбца

  let x = 0; 

  function animate() {
    x = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // чистим
    analyser.getByteFrequencyData(dataArray); // =
    drawVisualizer({ bufferLength, dataArray, barWidth });
    requestAnimationFrame(animate); // встроенный метод вызова анимации
  }

  const drawVisualizer = ({ bufferLength, dataArray, barWidth }) => {
    let barHeight;
    let k = 0.2;
    let mx = Math.max(...dataArray);//максимум чтобы относительно него вычислять высоту
    for (var i = 0; i < bufferLength; i++) {
      barHeight = dataArray[bufferLength-i]/mx*canvas.height; //-i для вогнутой кривой
      
      
      var r = barHeight + (25 * (i/bufferLength));
      var g = 50;//250 * (i/bufferLength);
      var b = 50;//050;

      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ")";
      ctx.fillRect(canvas.width/2-x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth ;
    }

    for (var i = 0; i < bufferLength; i++) {
      barHeight = dataArray[bufferLength-i]/mx*canvas.height;
      
      
      var r = barHeight + (25 * (i/bufferLength));
      var g = 50;//250 * (i/bufferLength);
      var b = 50;//050;

      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ")";
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth ;
    }
  }

  animate();
};

function loadTrack(track_index) {
  clearInterval(updateTimer);
  resetValues();
  curr_track.src = track_list[track_index].path;
  curr_track.load();

  track_art.src = track_list[track_index].image ;
  

  background.src = track_list[track_index].image ;
  track_name.textContent = track_list[track_index].name;
  track_artist.textContent = track_list[track_index].artist;
  now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);

}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

// Load the first track in the tracklist
loadTrack(track_index);

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  playpause_btn.src = "assets/icons/pause.png";
  
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.src = "assets/icons/play.png";
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length-1;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);

    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}

