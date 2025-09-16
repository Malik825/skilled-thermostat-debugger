
// Import utility functions from pureFunctions.js
import {
  convertTimeToMinutes,
  getCurrentTimes,
  formatDisplayTime,
  isValidTime,
  calculatePointPosition,
  predictOptimalTemp,
  createRoomForStorage,
  createRoomWithMethods,
  WARM_OVERLAY,
  COOL_OVERLAY
} from './functions.js';

// Global variables
let rooms = [];
let selectedRoom = '';

// Initialize the rooms with data
function initializeRooms() {
// Try to load from localStorage first
  const savedRooms = localStorage.getItem('smartHomeRooms');
  if (savedRooms) {
    const parsedRooms = JSON.parse(savedRooms);
  // Reattach methods to loaded rooms
    return parsedRooms.map(room => createRoomWithMethods(room));
  }
  
// Default rooms if no saved data
  return [
    createRoomWithMethods({
      name: "Living Room",
      currTemp: 32,
      coldPreset: 20,
      warmPreset: 32,
      image: "./assets/living-room.jpg",
      airConditionerOn: false,
      startTime: '16:30',
      endTime: '20:00'
    }),
    createRoomWithMethods({
      name: "Kitchen",
      currTemp: 29,
      coldPreset: 20,
      warmPreset: 32,
      image: "./assets/kitchen.jpg",
      airConditionerOn: false,
      startTime: '16:30',
      endTime: '20:00'
    }),
    createRoomWithMethods({
      name: "Bathroom",
      currTemp: 30,
      coldPreset: 20,
      warmPreset: 32,
      image: "./assets/bathroom.jpg",
      airConditionerOn: false,
      startTime: '16:30',
      endTime: '20:00'
    }),
    createRoomWithMethods({
      name: "Bedroom",
      currTemp: 31,
      coldPreset: 20,
      warmPreset: 32,
      image: "./assets/bedroom.jpg",
      airConditionerOn: false,
      startTime: '16:30',
      endTime: '20:00'
    })
  ];
}
// Save rooms to localStorage
function saveRoomsToStorage() {
  const roomsToSave = rooms.map(room => createRoomForStorage(room));
  localStorage.setItem('smartHomeRooms', JSON.stringify(roomsToSave));
}
// UI update functions
function setIndicatorPoint(currTemp) {
  const position = calculatePointPosition(currTemp);
  const svgPoint = document.querySelector(".point");
  svgPoint.style.transform = `translate(${position.translateX}px, ${position.translateY}px)`;
}

function updateRoomOverlay(room) {
  document.querySelector(".room").style.backgroundImage = `${
    room.currTemp < 25 ? COOL_OVERLAY : WARM_OVERLAY
  }, url('${room.image}')`;
}

function updateRoomUI(room) {
  setIndicatorPoint(room.currTemp);
  document.getElementById("temp").textContent = `${room.currTemp}°`;
  document.querySelector(".currentTemp").textContent = `${room.currTemp}°`;
  updateRoomOverlay(room);
  generateRooms();
  
// Reset preset button states when manually changing temp
  updatePresetButtonStates(room);
}

function updatePresetButtonStates(room) {
  const coolBtn = document.getElementById("cool");
  const warmBtn = document.getElementById("warm");
  
  coolBtn.classList.toggle('cool-active', room.currTemp === room.coldPreset);
coolBtn.classList.toggle('inactive', room.currTemp !== room.coldPreset);

warmBtn.classList.toggle('warm-active', room.currTemp === room.warmPreset);
warmBtn.classList.toggle('inactive', room.currTemp !== room.warmPreset);
}

function setInitialOverlay() {
  const roomElement = document.querySelector(".room");
  roomElement.style.backgroundImage = `url('${rooms[0].image}')`;
  updateRoomOverlay(rooms[0]);
}
// Room selection functions
function populateRoomSelect() {
  const roomSelect = document.getElementById("rooms");
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room.name;
    option.textContent = room.name;
    roomSelect.appendChild(option);
  });
}

function setSelectedRoom(roomName) {
  selectedRoom = roomName;
  const room = rooms.find((r) => r.name === roomName);
  
  setIndicatorPoint(room.currTemp);
  document.getElementById("temp").textContent = `${room.currTemp}°`;
  updateRoomOverlay(room);
  document.querySelector(".room-name").textContent = roomName;
  document.querySelector(".currentTemp").textContent = `${room.currTemp}°`;
  
// Update preset button states
  updatePresetButtonStates(room);
}
// Generate room controls UI
function generateRooms() {
  const roomsControlContainer = document.querySelector(".rooms-control");
  let roomsHTML = "";

  rooms.forEach((room) => {
    roomsHTML += `
    <div class="room-control" id="${room.name}">
      <div class="top">
        <h3 class="room-name">${room.name} - ${room.currTemp}°</h3>
        <button class="switch">
          <ion-icon name="power-outline" class="${room.airConditionerOn ? "powerOn" : ""}"></ion-icon>
        </button>
      </div>
      <div class="time-display">
        <input type="time" class="time-input time-input-1" data-room="${room.name}" data-type="start" 
               value="${room.startTime}" step="3600">
        <div class="bars">
          ${Array(32).fill('<span class="bar"></span>').join('')}
        </div>
        <input type="time" class="time-input time-input-2" data-room="${room.name}" data-type="end" 
               value="${room.endTime}">
      </div>
      <span class="room-status" style="display: ${room.airConditionerOn ? "block" : "none"}">
        ${room.currTemp > 25 ? "Cooling room to: " : "Warming room to: "}${room.currTemp}°
      </span>
    </div>`;
  });

  roomsControlContainer.innerHTML = roomsHTML;
  updateMasterToggle();
}
// Temperature control functions
function handleTemperatureChange(changeType) {
  const room = rooms.find((r) => r.name === selectedRoom);
  
  if (changeType === 'increase' && room.currTemp < 32) {
    room.increaseTemp();
    speak(`Temperature increased to ${room.currTemp}°`);
  } else if (changeType === 'decrease' && room.currTemp > 10) {
    room.decreaseTemp();
    speak(`Temperature decreased to ${room.currTemp}°`);
  }
  
  updateRoomUI(room);
  saveRoomsToStorage();
}
// Preset functions
function applyPreset(presetType) {
  const room = rooms.find((r) => r.name === selectedRoom);
  const targetTemp = presetType === 'cool' ? room.coldPreset : room.warmPreset;
  
  room.setCurrTemp(targetTemp);
  updateRoomUI(room);
  saveRoomsToStorage();
  
// Highlight the active preset button
  const coolBtn = document.getElementById("cool");
  const warmBtn = document.getElementById("warm");
  
  if (presetType === 'cool') {
    coolBtn.style.backgroundColor = '#a8c7ff';
    warmBtn.style.backgroundColor = '#d9d9d9';
  } else {
    warmBtn.style.backgroundColor = '#ffa8a8';
    coolBtn.style.backgroundColor = '#d9d9d9';
  }
}
// Schedule functions
function updateSchedule(roomName, startTime, endTime) {
  const room = rooms.find((r) => r.name === roomName);
  if (room) {
    room.startTime = startTime;
    room.endTime = endTime;
    generateRooms();
    checkSchedule();
    saveRoomsToStorage();
  }
}

function checkSchedule() {
  const now = new Date();
  const currentMinutesTotal = now.getHours() * 60 + now.getMinutes();

  rooms.forEach(room => {
    const startMinutes = convertTimeToMinutes(room.startTime);
    const endMinutes = convertTimeToMinutes(room.endTime);
    
    const shouldBeOn = currentMinutesTotal >= startMinutes && 
                      currentMinutesTotal <= endMinutes;
    
    if (shouldBeOn && !room.airConditionerOn) {
      room.airConditionerOn = true;
      if (room.currTemp > 25) {
        room.setCurrTemp(room.coldPreset);
      } else {
        room.setCurrTemp(room.warmPreset);
      }
    } else if (!shouldBeOn && room.airConditionerOn) {
      room.airConditionerOn = false;
    }
  });

  generateRooms();
  
  const currentRoom = rooms.find(r => r.name === selectedRoom);
  if (currentRoom) {
    updateRoomUI(currentRoom);
  }
}

// Master toggle functions
function updateMasterToggle() {
  const acPowerToggle = document.getElementById('ac-power-toggle');
  const statusIndicator = document.querySelector('.status-indicator');
  
  const allOn = rooms.every(room => room.airConditionerOn);
  const allOff = rooms.every(room => !room.airConditionerOn);
  
  if (allOn) {
    acPowerToggle.checked = true;
    statusIndicator.classList.add('active');
  } else if (allOff) {
    acPowerToggle.checked = false;
    statusIndicator.classList.remove('active');
  } else {
    acPowerToggle.indeterminate = true;
  }
}

// Voice functions
function speak(text, priority = "low") {
  if (window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    utterance.volume = priority === "high" ? 1 : 0.7;
    
    const voices = speechSynthesis.getVoices();
    utterance.voice = priority === "high" 
      ? voices.find(v => v.name.includes("Google US English")) 
      : voices.find(v => v.name.includes("Microsoft Hazel"));
    
    speechSynthesis.speak(utterance);
  }
}

// New room functions
function showAddRoomModal() {
  Swal.fire({
    title: 'Add New Room',
    html: `<input type="text" id="swal-room-name" class="swal2-input" placeholder="Room name" autofocus>`,
    showCancelButton: true,
    confirmButtonText: 'Add Room',
    preConfirm: () => {
      const name = document.getElementById('swal-room-name').value.trim();
      if (!name) {
        Swal.showValidationMessage('Please enter a room name');
        return false;
      }
      if (rooms.some(r => r.name === name)) {
        Swal.showValidationMessage('Room already exists');
        return false;
      }
      return name;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      addNewRoom(result.value);
    }
  });
}

function addNewRoom(name) {
  const newRoom = createRoomWithMethods({
    name,
    currTemp: 22,
    coldPreset: 20,
    warmPreset: 28,
    image: "./assets/living-room.jpg",
    airConditionerOn: false,
    startTime: '08:00',
    endTime: '22:00'
  });

  rooms.push(newRoom);
  
  const option = new Option(name, name);
  document.getElementById("rooms").appendChild(option);
  generateRooms();
  saveRoomsToStorage();
  
  Swal.fire({
    icon: 'success',
    title: `${name} added!`,
    showConfirmButton: false,
    timer: 1500
  });
}

// Smart AI features
const smartTemperatureAI = {
  applyAutoSettings: () => {
    rooms.forEach(room => {
      const optimalTemp = predictOptimalTemp(room, { isCold: true });
      room.setCurrTemp(optimalTemp);
      room.airConditionerOn = true;
    });
    generateRooms();
    speak("AI has adjusted temperatures for optimal comfort");
  }
};

// Setup event listeners
function setupEventListeners() {
  // Room selection
  document.getElementById("rooms").addEventListener("change", function() {
    setSelectedRoom(this.value);
  });

  // Temperature controls
  document.getElementById("increase").addEventListener("click", () => {
    handleTemperatureChange('increase');
  });

  document.getElementById("reduce").addEventListener("click", () => {
    handleTemperatureChange('decrease');
  });

  // Preset buttons
  document.getElementById("cool").addEventListener("click", () => {
    applyPreset('cool');
  });

  document.getElementById("warm").addEventListener("click", () => {
    applyPreset('warm');
  });

  // Preset configuration
  document.getElementById("newPreset").addEventListener("click", () => {
    document.querySelector(".inputs").classList.remove("hidden");
  });

  document.getElementById("close").addEventListener("click", () => {
    document.querySelector(".inputs").classList.add("hidden");
    document.querySelector(".error").style.display = "none";
  });

  document.getElementById("save").addEventListener("click", () => {
    const coolInput = document.getElementById("coolInput");
    const warmInput = document.getElementById("warmInput");
    const errorSpan = document.querySelector(".error");
    
    errorSpan.style.display = "none";
    
    if (!coolInput.value || !warmInput.value) {
      errorSpan.style.display = "block";
      errorSpan.textContent = "Please enter both temperatures";
      return;
    }
    
    const coolTemp = parseInt(coolInput.value);
    const warmTemp = parseInt(warmInput.value);
    
    if (coolTemp < 10 || coolTemp > 24) {
      errorSpan.style.display = "block";
      errorSpan.textContent = "Cool preset must be between 10°-24°";
      return;
    }
    
    if (coolTemp >= warmTemp) {
      errorSpan.style.display = "block";
      errorSpan.textContent = "Cool temp must be lower than warm temp";
      return;
    }
    
    const room = rooms.find((r) => r.name === selectedRoom);
    room.setColdPreset(coolTemp);
    room.setWarmPreset(warmTemp);
    
    coolInput.value = "";
    warmInput.value = "";
    document.querySelector(".inputs").classList.add("hidden");
    updatePresetButtonStates(room);
  });

  // Room controls delegation
  document.querySelector(".rooms-control").addEventListener("click", (e) => {
    const roomControl = e.target.closest(".room-control");
    if (!roomControl) return;
    
    const roomName = roomControl.id;
    
    // Power button
    if (e.target.closest(".switch")) {
      const room = rooms.find((r) => r.name === roomName);
      room.toggleAircon();
      generateRooms();
    }
    
    // Room name click
    if (e.target.classList.contains("room-name")) {
      setSelectedRoom(roomName);
      document.getElementById("rooms").value = roomName;
    }
  });

  // Time input changes
  document.querySelector(".rooms-control").addEventListener("change", (e) => {
    if (e.target.classList.contains("time-input")) {
      const roomName = e.target.dataset.room;
      const type = e.target.dataset.type;
      const room = rooms.find(r => r.name === roomName);
      
      if (room) {
        let timeValue = e.target.value;
        if (!timeValue.includes(':')) {
          timeValue = `${timeValue.padStart(2, '0')}:00`;
        }
        
        if (type === 'start') {
          room.startTime = timeValue;
        } else {
          room.endTime = timeValue;
        }
        checkSchedule();
        saveRoomsToStorage();
      }
    }
  });

  // Master control
  const acPowerToggle = document.getElementById('ac-power-toggle');
  acPowerToggle.addEventListener('change', function() {
    // Animation
    const slider = this.nextElementSibling;
    slider.classList.add('animate-pulse');
    setTimeout(() => slider.classList.remove('animate-pulse'), 300);
    
    // Status indicator
    const statusIndicator = document.querySelector('.status-indicator');
    if (this.checked) {
      statusIndicator.classList.add('active');
      
      // Turn on all ACs immediately
      rooms.forEach(room => {
        if (!room.airConditionerOn) room.toggleAircon();
      });
      generateRooms();
    } else {
      statusIndicator.classList.remove('active');
      // Turn off all ACs
      rooms.forEach(room => {
        if (room.airConditionerOn) room.toggleAircon();
      });
      generateRooms();
    }
  });

  // Add room button
  document.getElementById('add-room-btn').addEventListener('click', showAddRoomModal);
}

// Initialize the application
function init() {
  rooms = initializeRooms();
  selectedRoom = rooms[0].name;
  
  setInitialOverlay();
  populateRoomSelect();
  generateRooms();
  setupEventListeners();
  
  // Set up periodic checks and adjustments
  setInterval(checkSchedule, 60000);
  setInterval(smartTemperatureAI.applyAutoSettings, 1800000);
}


// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", ()=>{
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('ion-icon');
  const themeText = themeToggle.querySelector('span');
  
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.name = 'moon';
    themeText.textContent = 'Dark';
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      themeIcon.name = 'sunny';
      themeText.textContent = 'Light';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      themeIcon.name = 'moon';
      themeText.textContent = 'Dark';
    }
  });
  init();
} );
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeRooms,
    handleTemperatureChange,
    applyPreset,
    checkSchedule,
    addNewRoom
  };
}