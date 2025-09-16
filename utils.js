// smartHomeUtils.js

// Utility Functions
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
  
  export function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  export function isValidTime(timeStr) {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
  }
  
  export function formatDisplayTime(timeStr) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  export function calculatePointPosition(currTemp, angleOffset = 86) {
    const normalizedTemp = (currTemp - 10) / (32 - 10);
    const angle = normalizedTemp * 180 + angleOffset;
    const radians = (angle * Math.PI) / 180;
    const radius = 116;
  
    return {
      translateX: radius * Math.cos(radians),
      translateY: radius * Math.sin(radians)
    };
  }
  
  // Room Functions
  export function createRoomMethods(room) {
    return {
      ...room,
      setCurrTemp(temp) { this.currTemp = temp; },
      setColdPreset(newCold) { this.coldPreset = newCold; },
      setWarmPreset(newWarm) { this.warmPreset = newWarm; },
      decreaseTemp() { this.currTemp--; },
      increaseTemp() { this.currTemp++; },
      toggleAircon() {
        this.airConditionerOn = !this.airConditionerOn;
        return this.airConditionerOn;
      }
    };
  }
  
  export function initializeRooms() {
    const savedRooms = localStorage.getItem('smartHomeRooms');
    if (savedRooms) {
      const parsedRooms = JSON.parse(savedRooms);
      return parsedRooms.map(room => createRoomMethods(room));
    }
    
    const defaultRooms = [
      {
        name: "Living Room",
        currTemp: 32,
        coldPreset: 20,
        warmPreset: 32,
        image: "./assets/living-room.jpg",
        airConditionerOn: false,
        startTime: '16:30',
        endTime: '20:00'
      },
      // ... other default rooms
    ];
    
    return defaultRooms.map(room => createRoomMethods(room));
  }
  
  export function saveRoomsToStorage(rooms) {
    const roomsToSave = rooms.map(room => ({
      name: room.name,
      currTemp: room.currTemp,
      coldPreset: room.coldPreset,
      warmPreset: room.warmPreset,
      image: room.image,
      airConditionerOn: room.airConditionerOn,
      startTime: room.startTime,
      endTime: room.endTime
    }));
    localStorage.setItem('smartHomeRooms', JSON.stringify(roomsToSave));
  }
  
  // Temperature Functions
  export function updatePresetButtonStates(room) {
    return {
      coolBtnColor: room.currTemp === room.coldPreset ? '#a8c7ff' : '#d9d9d9',
      warmBtnColor: room.currTemp === room.warmPreset ? '#ffa8a8' : '#d9d9d9'
    };
  }
  
  export function shouldBeOn(currentMinutesTotal, startMinutes, endMinutes) {
    return currentMinutesTotal >= startMinutes && currentMinutesTotal <= endMinutes;
  }
  
  // AI Functions
  export function predictOptimalTemp(weatherData = {}) {
    const hour = new Date().getHours();
    let baseTemp = 22;
    
    if (hour >= 22 || hour <= 6) baseTemp = 20;
    else if (hour >= 17) baseTemp = 23;
    
    if (weatherData.isCold) baseTemp += 1;
    if (weatherData.isHot) baseTemp -= 1;
    
    return Math.min(Math.max(baseTemp, 18), 26);
  }
  
  // Validation Functions
  export function validateTemperatureInputs(coolTemp, warmTemp) {
    const errors = [];
    
    if (coolTemp < 10 || coolTemp > 24) {
      errors.push("Cool preset must be between 10°-24°");
    }
    
    if (coolTemp >= warmTemp) {
      errors.push("Cool temp must be lower than warm temp");
    }
    
    return errors.length > 0 ? errors : null;
  }