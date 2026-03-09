import { useState } from 'react';
import './DurationPicker.css';

const DurationPicker = ({ value, onChange, onClose }) => {
  const parseDuration = (duration) => {
    if (!duration) return { hours: 0, minutes: 0 };
    
    const hourMatch = duration.match(/(\d+)\s*hour/);
    const minuteMatch = duration.match(/(\d+)\s*minute/);
    
    return {
      hours: hourMatch ? parseInt(hourMatch[1]) : 0,
      minutes: minuteMatch ? parseInt(minuteMatch[1]) : 0
    };
  };

  const initialDuration = parseDuration(value);
  const [selectedHour, setSelectedHour] = useState(initialDuration.hours);
  const [selectedMinute, setSelectedMinute] = useState(initialDuration.minutes);
  const [mode, setMode] = useState('hours'); // 'hours' or 'minutes'

  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1, 2, ..., 12 (for clock positions)
  const hoursWithZero = [0, ...hours]; // 0, 1, 2, ..., 12 (for selection)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, ..., 55
  
  const calculateHourPosition = (num) => {
    const angle = (num - 3) * 30 * (Math.PI / 180);
    const radius = 80;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x: x + 100, y: y + 100 };
  };

  const calculateMinutePosition = (minute) => {
    const angle = (minute / 5 - 3) * 30 * (Math.PI / 180);
    const radius = 80;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x: x + 100, y: y + 100 };
  };

  const handleHourClick = (hour) => {
    setSelectedHour(hour);
    setMode('minutes');
  };

  const handleMinuteClick = (minute) => {
    setSelectedMinute(minute);
  };

  const handleConfirm = () => {
    let durationText = '';
    if (selectedHour > 0) {
      durationText += `${selectedHour} hour${selectedHour > 1 ? 's' : ''}`;
    }
    if (selectedMinute > 0) {
      if (durationText) durationText += ' ';
      durationText += `${selectedMinute} minute${selectedMinute > 1 ? 's' : ''}`;
    }
    if (!durationText) durationText = '0 minutes';
    
    onChange(durationText);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };



  return (
    <div className="duration-picker-overlay">
      <div className="duration-picker-modal">
        <div className="mode-toggle">
          <button 
            className={`btn ${mode === 'hours' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setMode('hours')}
          >
            Hours
          </button>
          <button 
            className={`btn ${mode === 'minutes' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setMode('minutes')}
          >
            Minutes
          </button>
        </div>
        
        <div className="clock-container">
          <svg width="200" height="200" className="clock-svg">
            {/* Clock circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="white"
              stroke="#e0e0e0"
              strokeWidth="2"
            />
            
            {/* Hour markers and numbers */}
            {mode === 'hours' ? (
              <>
                {/* 0 in the center */}
                <g>
                  <circle
                    cx="100"
                    cy="100"
                    r={selectedHour === 0 ? "25" : "20"}
                    fill={selectedHour === 0 ? "#7c3aed" : "white"}
                    stroke={selectedHour === 0 ? "#7c3aed" : "#d0d0d0"}
                    strokeWidth="2"
                    className="hour-circle"
                    onClick={() => handleHourClick(0)}
                    style={{ cursor: 'pointer' }}
                  />
                  <text
                    x="100"
                    y="105"
                    textAnchor="middle"
                    fill={selectedHour === 0 ? "white" : "#333"}
                    fontSize={selectedHour === 0 ? "16" : "14"}
                    fontWeight={selectedHour === 0 ? "bold" : "normal"}
                    className="hour-text"
                    onClick={() => handleHourClick(0)}
                    style={{ cursor: 'pointer' }}
                  >
                    0
                  </text>
                </g>
                
                {/* Hours 1-12 around the clock */}
                {hours.map((hour) => {
                  const pos = calculateHourPosition(hour);
                  const isSelected = hour === selectedHour;
                  return (
                    <g key={`hour-${hour}`}>
                      {/* Hour marker */}
                      <line
                        x1="100"
                        y1="100"
                        x2={pos.x}
                        y2={pos.y}
                        stroke="#e0e0e0"
                        strokeWidth="1"
                      />
                      
                      {/* Number circle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? "18" : "15"}
                        fill={isSelected ? "#7c3aed" : "white"}
                        stroke={isSelected ? "#7c3aed" : "#d0d0d0"}
                        strokeWidth="2"
                        className="hour-circle"
                        onClick={() => handleHourClick(hour)}
                        style={{ cursor: 'pointer' }}
                      />
                      
                      {/* Number text */}
                      <text
                        x={pos.x}
                        y={pos.y + 5}
                        textAnchor="middle"
                        fill={isSelected ? "white" : "#333"}
                        fontSize={isSelected ? "14" : "12"}
                        fontWeight={isSelected ? "bold" : "normal"}
                        className="hour-text"
                        onClick={() => handleHourClick(hour)}
                        style={{ cursor: 'pointer' }}
                      >
                        {hour}
                      </text>
                    </g>
                  );
                })}
              </>
            ) : minutes.map((minute) => {
              const pos = calculateMinutePosition(minute);
              const isSelected = minute === selectedMinute;
              return (
                <g key={`minute-${minute}`}>
                  {/* Minute marker */}
                  <line
                    x1="100"
                    y1="100"
                    x2={pos.x}
                    y2={pos.y}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                  />
                  
                  {/* Number circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "18" : "15"}
                    fill={isSelected ? "#7c3aed" : "white"}
                    stroke={isSelected ? "#7c3aed" : "#d0d0d0"}
                    strokeWidth="2"
                    className="minute-circle"
                    onClick={() => handleMinuteClick(minute)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Number text */}
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    fill={isSelected ? "white" : "#333"}
                    fontSize={isSelected ? "14" : "12"}
                    fontWeight={isSelected ? "bold" : "normal"}
                    className="minute-text"
                    onClick={() => handleMinuteClick(minute)}
                    style={{ cursor: 'pointer' }}
                  >
                    {minute}
                  </text>
                </g>
              );
            })}
            
            {/* Clock hand */}
            {selectedHour !== 0 && (
              <line
                x1="100"
                y1="100"
                x2={mode === 'hours' 
                  ? calculateHourPosition(selectedHour).x 
                  : calculateMinutePosition(selectedMinute).x}
                y2={mode === 'hours' 
                  ? calculateHourPosition(selectedHour).y 
                  : calculateMinutePosition(selectedMinute).y}
                stroke="#7c3aed"
                strokeWidth="3"
                strokeLinecap="round"
                className="clock-hand"
              />
            )}
            
            {/* Center dot */}
            <circle
              cx="100"
              cy="100"
              r="5"
              fill="#7c3aed"
            />
          </svg>
        </div>
        
        <div className="duration-display">
          <strong>Selected: </strong>
          {selectedHour === 0 && selectedMinute === 0 && '0 minutes'}
          {selectedHour === 0 && selectedMinute > 0 && `${selectedMinute} minute${selectedMinute > 1 ? 's' : ''}`}
          {selectedHour > 0 && selectedMinute === 0 && `${selectedHour} hour${selectedHour > 1 ? 's' : ''}`}
          {selectedHour > 0 && selectedMinute > 0 && `${selectedHour} hour${selectedHour > 1 ? 's' : ''} ${selectedMinute} minute${selectedMinute > 1 ? 's' : ''}`}
        </div>
        
        <div className="duration-picker-footer">
          <button className="btn btn-outline-secondary" onClick={handleCancel}>
            CANCEL
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default DurationPicker;
