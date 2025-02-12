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
  document.getElementById("audioPlayer").style.display = "none"; 
loader.style.display='block'
  // Reset previews
  videoPreview.style.display = "none";
  
  livePreview.style.display = "none";

  if (fileType == "audio") {
    document.querySelector(".audio-container").style.display = "flex";
    audioPreview.src = URL.createObjectURL(file);
   
  } else if (fileType === "video" || fileType === "webcam") {
    audioPreview.style.display = "none"
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
      loader.style.display='none';
      // Create a URL for the blob to use in the audio element
      const audioUrl = URL.createObjectURL(data);

      // Get the audio element and set the source to the blob URL
      const audioPlayer = document.getElementById("audioPlayer");
      audioPlayer.src = audioUrl;
      
      audioPlayer.style.display = "block"; // Make the audio player visible
    })
    .catch((e) => console.error("Error uploading file:", e));
}
