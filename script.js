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
  const audioPreview = document.getElementById("audioPreview");
  const livePreview = document.getElementById("livePreview");
 
  loader.style.display = "block";
  // Reset previews
  videoPreview.style.display = "none";

  livePreview.style.display = "none";

  if (fileType == "audio") {
    document.querySelector(".audio-container").style.display = "flex";
    audioPreview.src = URL.createObjectURL(file);
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
    .then((res) => res.blob()) // Convert the response to a blob (audio file)
    .then((data) => {
      loader.style.display = "none";
      // Create a URL for the blob to use in the audio element
      const audioUrl = URL.createObjectURL(data);

      const wavesurfer = WaveSurfer.create({
        container: "#waveform",
        waveColor: "#686666",
        progressColor: "#7208f3",
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
