const nav = document.querySelector("nav"),
  toggleBtn = nav.querySelector(".toggle-btn");
// Create an input element dynamically
const loader = document.querySelector(".loader");
toggleBtn.addEventListener("click", () => {
  nav.classList.toggle("open");
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
  parameters(file);
}

function uploadFileToBackend(file) {
  const formData = new FormData();
  formData.append("file", file);

  fetch("https://voice-ectract.onrender.com/process-audio", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.blob()) // Convert the response to a blob (audio file)
    .then((data) => {
      loader.style.display = "none";
      document.getElementById("time").style.display = "block";
      document.getElementById("duration").style.display = "block";
      // Create a URL for the blob to use in the audio element
      const audioUrl = URL.createObjectURL(data);

      const wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#686666",
        progressColor: getRandomColor(),
        barWidth: 2,
      });
      fetch(audioUrl) // Fetch the blob data from the URL
        .then((response) => response.blob()) // Convert response to an actual Blob
        .then((blob) => {
          wavesurfer.loadBlob(blob); // Load the actual Blob into WaveSurfer
        })
        .catch((error) => console.error("Error loading audio blob:", error));

      // Play/pause on click
      wavesurfer.on("interaction", () => wavesurfer.playPause());

      // Hover effect
      const hover = document.querySelector("#hover");
      const waveform = document.querySelector("#waveform");
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
      const timeEl = document.querySelector("#time");
      const durationEl = document.querySelector("#duration");
      wavesurfer.on(
        "ready",
        () => (durationEl.textContent = formatTime(wavesurfer.getDuration()))
      );
      wavesurfer.on(
        "audioprocess",
        () => (timeEl.textContent = formatTime(wavesurfer.getCurrentTime()))
      );
    })
    .catch((e) => console.error("Error uploading file:", e));
}

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

async function wakeUpServer() {
  try {
    const response = await fetch("https://voice-ectract.onrender.com/"); // Replace with your actual endpoint
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data); // Handle the fetched data
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

wakeUpServer(); // Call the function

// GET THE PARAMETN OF THE AUDIO
function parameters(file) {
  const formData = new FormData();
  formData.append("file", file);

  fetch("https://voice-ectract.onrender.com/parameters", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json()) // Convert the response to a blob (audio file)
    .then((params) => {
      let { data } = params;

      document.querySelector(".pitch").textContent = data.pitch.toFixed(2);
      document.querySelector(".tempo").textContent = data.tempo.toFixed(2);
      document.querySelector(".amp").textContent = data.amplitude.toFixed(2);
      document.querySelector(".freq").textContent =
        data.dominant_frequency.toFixed(2);
      document.querySelector(".parameters").style.display = "flex";
    })
    .catch((err) => {
      console.log(err);
    });
}

document
  .getElementById("refresh")
  .addEventListener("click", () => window.location.reload());

  document.querySelector(".theme").addEventListener("click",()=>{
    document.body.classList.add("dark")
  })