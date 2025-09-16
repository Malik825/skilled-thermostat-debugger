// pureFunctions.js
// Contains utility functions with no side effects (pure functions)

// Time utility functions
export function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  export function getCurrentTimes() {
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    
    const later = new Date(now.getTime() + 30 * 60000);
    const laterHours = later.getHours().toString().padStart(2, '0');
    const laterMinutes = later.getMinutes().toString().padStart(2, '0');
    
    return {
      currentTime: `${currentHours}:${currentMinutes}`,
      laterTime: `${laterHours}:${laterMinutes}`
    };
  }
  
  export function formatDisplayTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  export function isValidTime(timeStr) {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
  }
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
  // Temperature calculation export functions
  export function calculatePointPosition(currTemp) {
    const normalizedTemp = (currTemp - 10) / (32 - 10);
    const angle = normalizedTemp * 180 + 86; // 86 is the angle offset
    const radians = (angle * Math.PI) / 180;
    const radius = 116;
  
    return {
      translateX: radius * Math.cos(radians),
      translateY: radius * Math.sin(radians)
    };
  }
  
  export function predictOptimalTemp(room, weatherData) {
    const hour = new Date().getHours();
    let baseTemp = 22;
    
    if (hour >= 22 || hour <= 6) baseTemp = 20;
    else if (hour >= 17) baseTemp = 23;
    
    if (weatherData?.isCold) baseTemp += 1;
    if (weatherData?.isHot) baseTemp -= 1;
    
    return Math.min(Math.max(baseTemp, 18), 26);
  }
  
  // Room data utilities
  export function createRoomForStorage(room) {
    return {
      name: room.name,
      currTemp: room.currTemp,
      coldPreset: room.coldPreset,
      warmPreset: room.warmPreset,
      image: room.image,
      airConditionerOn: room.airConditionerOn,
      startTime: room.startTime,
      endTime: room.endTime
    };
  }
  
  export function createRoomWithMethods(roomData) {
    return {
      ...roomData,
      setCurrTemp(temp) { this.currTemp = temp; },
      setColdPreset(newCold) { this.coldPreset = newCold; },
      setWarmPreset(newWarm) { this.warmPreset = newWarm; },
      decreaseTemp() { this.currTemp--; },
      increaseTemp() { this.currTemp++; },
      toggleAircon() {
        this.airConditionerOn = !this.airConditionerOn;
        if (this.airConditionerOn) {
          const action = this.currTemp <= 24 ? "Cooling" : "Warming";
          speak(`${action} ${this.name} to ${this.currTemp}°`, "high");
        } else {
          speak(`${this.name} air conditioning turned off`, "low");
        }
      }
    };
  }
  
  // Constants for UI
  export const WARM_OVERLAY = `linear-gradient(to bottom, rgba(236, 96, 98, 0.2), rgba(248, 210, 211, 0.13))`;
  export const COOL_OVERLAY = `linear-gradient(
      to bottom,
      rgba(141, 158, 247, 0.2),
      rgba(194, 197, 215, 0.1)
    )`;
  
  // Export all export functions so they can be imported in main.js
//   module.exports = {
//     // Time export functions
//     convertTimeToMinutes,
//     getCurrentTimes,
//     formatDisplayTime,
//     isValidTime,
    
//     // Temperature functions
//     calculatePointPosition,
//     predictOptimalTemp,
    
//     // Room data functions
//     createRoomForStorage,
//     createRoomWithMethods,
    
//     // Constants
//     WARM_OVERLAY,
//     COOL_OVERLAY
//   };