let pit = document.querySelector(".pitch")
let amp = document.querySelector(".amp")
let freq = document.querySelector(".freq")
let tempo= document.querySelector(".tempo")


const nav = document.querySelector("nav"),
  toggleBtn = nav.querySelector(".toggle-btn");
// Create an input element dynamically
const loader = document.querySelector(".loader");
toggleBtn.addEventListener("click", () => {
  nav.classList.toggle("open");

  if(nav.classList.contains("open")){
    // pit.innerHTML = "0.00"
    // amp.innerHTML = "0.00"
    // freq.innerHTML = "0.00"
    // tempo.innerHTML = "0.00"
    // document.querySelector(".parameters").style.display = 'none';
  }
});




// Function to handle the user input selection and preview
document.querySelectorAll("a[data-file-type]").forEach((item) => {
  item.addEventListener("click", function (e) {
    nav.classList.toggle("open");
    e.preventDefault(); // Prevent default link behavior

    const fileType = this.getAttribute("data-file-type");
    handleFileSelection(fileType);
  });
});

function handleFileSelection(fileType) {
  let inputElement;

  // Show the corresponding file input based on the selection
  if (fileType === "audio") {
    inputElement = document.getElementById("audioInput");
    inputElement.accept = "audio/*";
  } else if (fileType === "video") {
    inputElement = document.getElementById("videoInput");
    inputElement.accept = "video/*";
  }

  // Open file picker
  inputElement.click();

  // Add event listener for file selection
  inputElement.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      previewFile(file, fileType);
    }
  };
}

function previewFile(file, fileType) {
  const previewContainer = document.querySelector(".preview-container");
  const videoPreview = document.getElementById("recordedVideo");

  const livePreview = document.getElementById("livePreview");

  loader.style.display = "block";
  // Reset previews
  videoPreview.style.display = "none";

  livePreview.style.display = "none";

  if (fileType == "audio") {
    document.querySelector(".audio-container").style.display = "flex";

    createWaveSurfer("#preview-waveform", URL.createObjectURL(file));
  } else if (fileType === "video" || fileType === "webcam") {
    audioPreview.style.display = "none";
    videoPreview.src = URL.createObjectURL(file);
    videoPreview.style.display = "block";
  }

  // Send the file to the backend (Example POST request)
  uploadFileToBackend(file);
}

function uploadFileToBackend(file) {
  const formData = new FormData();
  formData.append("file", file);

  fetch("https://voice-ectract-1.onrender.com/process-audio", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json()) // ✅ Expect JSON response
    .then((data) => {
      loader.style.display = "none";

      if (data.status !== "success") {
        console.error("Processing error:", data.message);
        return;
      }
      
console.log(data)
      const { enhancedAudio, pitch } = data; // ✅ Get audio path & pitch value
      document.querySelector(".parameters").style.display = 'flex';
      tempo.innerHTML = data.tempo
      amp.innerHTML = data.amplitude
      pit.innerHTML = data.pitch
      freq.innerHTML = data.meanFrequency;
      // const audioUrl = `http://localhost:8080/${enhancedAudio}`; // Construct full URL

      // ✅ Display the pitch value in the UI
      console.log(pitch)
      // document.querySelector("#pitch-value").textContent = `Pitch: ${pitch.toFixed(2)} Hz`;

      // ✅ WaveSurfer Setup
      const wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#686666",
        progressColor: getRandomColor(),
        barWidth: 2,
      });

      // wavesurfer.load(audioUrl); // ✅ Load enhanced audio

      // // Play/pause on click
      // wavesurfer.on("interaction", () => wavesurfer.playPause());

      // // Update time display
      // const timeEl = document.querySelector("#time");
      // const durationEl = document.querySelector("#duration");
      // wavesurfer.on("ready", () => (durationEl.textContent = formatTime(wavesurfer.getDuration())));
      // wavesurfer.on("audioprocess", () => (timeEl.textContent = formatTime(wavesurfer.getCurrentTime())));
    })
    .catch((e) => console.error("Error uploading file:", e));
}

// ✅ Helper function to format time
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secondsRemainder = Math.round(seconds) % 60;
  return `${minutes}:${secondsRemainder.toString().padStart(2, "0")}`;
};

function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

function createWaveSurfer(containerId, audioUrl) {
  // Create WaveSurfer instance for the given container
  const wavesurfer = WaveSurfer.create({
    container: containerId,
    waveColor: "#686666",
    progressColor: getRandomColor(),
    barWidth: 2,
  });

  // Fetch the audio blob and load it into WaveSurfer
  fetch(audioUrl)
    .then((response) => response.blob()) // Convert response to an actual Blob
    .then((blob) => {
      wavesurfer.loadBlob(blob); // Load the Blob into WaveSurfer
    })
    .catch((error) => console.error("Error loading audio blob:", error));

  // Play/pause on click
  wavesurfer.on("interaction", () => wavesurfer.playPause());

  // Hover effect
  const hover = document.querySelector("#preview-hover");
  const waveform = document.querySelector(containerId);
  waveform.addEventListener("pointermove", (e) => {
    hover.style.width = `${e.offsetX}px`;
  });

  // Format time function
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemainder = Math.round(seconds) % 60;
    return `${minutes}:${secondsRemainder.toString().padStart(2, "0")}`;
  };

  // Update time and duration
  const timeEl = document.querySelector("#preview-time");
  const durationEl = document.querySelector("#preview-duration");
  wavesurfer.on(
    "ready",
    () => (durationEl.textContent = formatTime(wavesurfer.getDuration()))
  );
  wavesurfer.on(
    "audioprocess",
    () => (timeEl.textContent = formatTime(wavesurfer.getCurrentTime()))
  );

  return wavesurfer; // Return the instance for further control if needed
}

async function processAudioBlob(audioBlob) {
  console.log("Processing audio blob:", audioBlob);

  const audioContext = new AudioContext();

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer();

  // Decode ArrayBuffer to AudioBuffer
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Ensure Meyda is available globally
  if (typeof Meyda === "undefined") {
    console.error("Meyda is not loaded!");
    return;
  }

  // Get the first channel of audio data
  const audioData = audioBuffer.getChannelData(0);

  // Ensure buffer size is a power of 2
  const bufferSize = 512; // You can adjust to 1024, 2048, etc.
  const validAudioChunk = audioData.slice(0, bufferSize); // Extract only a valid buffer size

  // Extract features from the chunk
  const features = Meyda.extract(
    ["spectralCentroid", "rms", "tempo"],
    validAudioChunk
  );

  console.log(
    `🎵 Pitch (Spectral Centroid): ${features.spectralCentroid.toFixed(2)} Hz`
  );
  console.log(`🔊 Amplitude (RMS): ${features.rms.toFixed(4)}`);
  console.log(`⏳ Estimated Tempo: ${features.tempo.toFixed(2)} BPM`);
}
