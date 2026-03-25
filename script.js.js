// Elements
const mainAudio = document.getElementById("mainAudio");
const bgmAudio = document.getElementById("bgmAudio");
const volumeSlider = document.getElementById("volumeSlider");
const status = document.getElementById("status");
const connectButton = document.getElementById("connectButton");
const mainUpload = document.getElementById("mainAudioUpload");
const bgmUpload = document.getElementById("bgmAudioUpload");

let port;

// Upload Main Audio
mainUpload.addEventListener("change", () => {
  const file = mainUpload.files[0];
  if (file) {
    mainAudio.src = URL.createObjectURL(file);
  }
});

// Upload BGM
bgmUpload.addEventListener("change", () => {
  const file = bgmUpload.files[0];
  if (file) {
    bgmAudio.src = URL.createObjectURL(file);
  }
});

// Volume Control
volumeSlider.addEventListener("input", () => {
  const vol = volumeSlider.value;
  mainAudio.volume = vol;
  bgmAudio.volume = vol;
});

// Connect Arduino
connectButton.addEventListener("click", async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });

    status.textContent = "✅ Connected to Arduino";

    const decoder = new TextDecoderStream();
    const inputDone = port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();

    readSerial(reader);

  } catch (error) {
    status.textContent = "❌ Connection Failed";
    console.error(error);
  }
});

// Read Serial Data
async function readSerial(reader) {
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    if (value) {
      const data = value.trim();
      console.log("Received:", data);
      handleZone(data);
    }
  }
}

// Zone Handler
function handleZone(zone) {
  const part = 30; // seconds

  switch(zone) {

    case "SYNC_START":
      mainAudio.currentTime = 0;
      mainAudio.pause();
      break;

    case "BGM_TOGGLE":
      if (bgmAudio.paused) {
        bgmAudio.play();
      } else {
        bgmAudio.pause();
      }
      break;

    case "A1":
      playPart(0);
      break;

    case "B1":
      playPart(1);
      break;

    case "B2":
      playPart(2);
      break;

    case "A2":
      playPart(3);
      break;

    case "A3":
      playPart(4);
      break;

    case "B3":
      playPart(5);
      break;
  }
}

// Play specific part
function playPart(index) {
  mainAudio.currentTime = index * 30;
  mainAudio.play();
}