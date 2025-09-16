// domFunctions.js
import { calculatePointPosition } from './functions.js';

const warmOverlay = `linear-gradient(to bottom, rgba(236, 96, 98, 0.2), rgba(248, 210, 211, 0.13))`;
const coolOverlay = `linear-gradient(to bottom, rgba(141, 158, 247, 0.2), rgba(194, 197, 215, 0.1))`;

export const updateRoomOverlay = (roomElement, room) => {
  roomElement.style.backgroundImage = `${
    room.currTemp < 25 ? coolOverlay : warmOverlay
  }, url('${room.image}')`;
};

export const setIndicatorPoint = (svgPoint, currTemp) => {
  const position = calculatePointPosition(currTemp);
  svgPoint.style.transform = `translate(${position.translateX}px, ${position.translateY}px)`;
};

export const populateRoomSelect = (selectElement, rooms) => {
  rooms.forEach((room) => {
    const option = document.createElement("option");
    option.value = room.name;
    option.textContent = room.name;
    selectElement.appendChild(option);
  });
};

export const generateRoomsHTML = (rooms) => {
  return rooms.map(room => `
    <div class="room-control" id="${room.name}">
      <div class="top">
        <h3 class="room-name">${room.name} - ${room.currTemp}°</h3>
        <button class="switch">
          <ion-icon name="power-outline" class="${room.airConditionerOn ? "powerOn" : ""}"></ion-icon>
        </button>
      </div>
      <div class="time-display">
        <input type="time" class="time-input" data-room="${room.name}" data-type="start" 
               value="${room.startTime}" step="3600">
        <div class="bars">
          ${Array(32).fill('<span class="bar"></span>').join('')}
        </div>
        <input type="time" class="time-input" data-room="${room.name}" data-type="end" 
               value="${room.endTime}">
      </div>
      <span class="room-status" style="display: ${room.airConditionerOn ? "block" : "none"}">
        ${room.currTemp > 25 ? "Cooling room to: " : "Warming room to: "}${room.currTemp}°
      </span>
    </div>
  `).join('');
};

export const updatePresetButtonStates = (coolBtn, warmBtn, room) => {
  coolBtn.style.backgroundColor = room.currTemp === room.coldPreset ? '#a8c7ff' : '#d9d9d9';
  warmBtn.style.backgroundColor = room.currTemp === room.warmPreset ? '#ffa8a8' : '#d9d9d9';
};

export const setupTimeInputListeners = (timeInputs, rooms, onTimeChange) => {
  timeInputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.type = 'text';
      input.type = 'time';
    });

    input.addEventListener('change', function() {
      const roomName = this.dataset.room;
      const type = this.dataset.type;
      const room = rooms.find(r => r.name === roomName);
      
      if (room) {
        let timeValue = this.value;
        if (!timeValue.includes(':')) {
          timeValue = `${timeValue.padStart(2, '0')}:00`;
        }
        
        if (type === 'start') {
          room.startTime = timeValue;
        } else {
          room.endTime = timeValue;
        }
        onTimeChange();
      }
    });
  });
};