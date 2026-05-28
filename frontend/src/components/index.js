import React, { useRef, useState } from "react";
// import "./CustomTimePicker.css";

const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const minuteSteps = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export default function CustomTimePicker() {
  const h_time_css = `
.ctp_modal{
    width: 380px;
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid rgb(255 255 255 / 50%);
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    font-family: sans-serif;
}
.ctp_title{
    color: #777;
    font-size: 14px;
    letter-spacing: 2px;
    margin-bottom: 20px;
}
.ctp_time_display{
    display: flex;
    align-items: flex-start;
    gap: 5px;
}
.ctp_hour,
.ctp_minute{
    font-size: 60px;
    font-weight: 300;
    color: #1f1f1f;
    cursor: pointer;
}
.ctp_hour.active,
.ctp_minute.active{
    color: #112923;
    font-weight: 500;
}
.ctp_colon{
    font-size: 60px;
    color: #888;
}
.ctp_period{
    display: flex;
    flex-direction: column;
    margin-left: 10px;
    margin-top: 10px;
}
.ctp_period button{
    border: none;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
    color: #999;
    padding: 2px;
}
.ctp_period .active{
    color: #000000;
    font-weight: 600;
}
.ctp_clock{
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: #ececec;
    margin: 30px auto;
    position: relative;
}
.ctp_center_dot{
    width: 10px;
    height: 10px;
    background: #112923;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
}
.ctp_hand{
    width: 3px;
    height: 95px;
    background: #112923;
    position: absolute;
    bottom: 50%;
    left: 50%;
    transform-origin: bottom;
    z-index: 5;
}
.ctp_hand.minute{
    height: 105px;
    width: 2px;
    background: #335c53;
    z-index: 4;
}
.ctp_number{
    position: absolute;
    transform: translate(-50%, -50%);
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: none;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
    transition: 0.3s;
}
.ctp_number.selected{
    background: #112923;
    color: white;
}
.ctp_actions{
    display: flex;
    justify-content: flex-end;
    gap: 20px;
}
.ctp_actions button{
    border: none;
    background: transparent;
    color: #112923;
    font-size: 18px;
    cursor: pointer;
}
    `;
  const [selectedHour, setSelectedHour] = useState(6);
  const [selectedMinute, setSelectedMinute] = useState(30);
  const [period, setPeriod] = useState("PM");
  const [activeView, setActiveView] = useState("hour");

  const radius = 110;
  const center = 140;
  const clockRef = useRef(null);

  const getDegreesFromPointer = (clientX, clientY) => {
    if (!clockRef.current) return null;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;

    let degrees = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  };

  const updateTimeFromPointer = (clientX, clientY) => {
    const degrees = getDegreesFromPointer(clientX, clientY);
    if (degrees === null) return;

    if (activeView === "hour") {
      const hourIndex = Math.round(degrees / 30) % 12;
      setSelectedHour(hourIndex === 0 ? 12 : hourIndex);
      return;
    }

    const minute = Math.round(degrees / 6) % 60;
    setSelectedMinute(minute);
  };

  const handlePointerDown = (event) => {
    updateTimeFromPointer(event.clientX, event.clientY);

    const handlePointerMove = (moveEvent) => {
      updateTimeFromPointer(moveEvent.clientX, moveEvent.clientY);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const hourHandDeg = (selectedHour % 12) * 30 + selectedMinute * 0.5;
  const minuteHandDeg = selectedMinute * 6;

  return (
    <>
      <style>{h_time_css}</style>
      <div className="ctp_modal">
        {/* HEADER */}
        <p className="ctp_title">SELECT TIME</p>

        {/* TIME DISPLAY */}
        <div className="ctp_time_display">
          <span
            className={`ctp_hour ${activeView === "hour" ? "active" : ""}`}
            onClick={() => setActiveView("hour")}
          >
            {String(selectedHour).padStart(2, "0")}
          </span>

          <span className="ctp_colon">:</span>

          <span
            className={`ctp_minute ${activeView === "minute" ? "active" : ""}`}
            onClick={() => setActiveView("minute")}
          >
            {String(selectedMinute).padStart(2, "0")}
          </span>

          <div className="ctp_period">
            <button
              className={period === "AM" ? "active" : ""}
              onClick={() => setPeriod("AM")}
            >
              AM
            </button>

            <button
              className={period === "PM" ? "active" : ""}
              onClick={() => setPeriod("PM")}
            >
              PM
            </button>
          </div>
        </div>

        {/* CLOCK */}
        <div className="ctp_clock" ref={clockRef} onPointerDown={handlePointerDown}>
          {/* CENTER DOT */}
          <div className="ctp_center_dot"></div>

          {/* HAND */}
          <div
            className="ctp_hand"
            style={{
              transform: `rotate(${hourHandDeg}deg)`,
            }}
          />
          <div
            className="ctp_hand minute"
            style={{
              transform: `rotate(${minuteHandDeg}deg)`,
            }}
          />

          {/* NUMBERS */}
          {(activeView === "hour" ? hours : minuteSteps).map((num, index) => {
            const angle = ((index + 1) * 30 - 90) * (Math.PI / 180);

            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const isSelected =
              activeView === "hour" ? selectedHour === num : selectedMinute === num;

            return (
              <button
                key={num}
                className={`ctp_number ${isSelected ? "selected" : ""}`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                }}
                onClick={() => {
                  if (activeView === "hour") {
                    setSelectedHour(num);
                  } else {
                    setSelectedMinute(num);
                  }
                }}
              >
                {activeView === "hour" ? num : String(num).padStart(2, "0")}
              </button>
            );
          })}
        </div>

        {/* ACTIONS */}
        <div className="ctp_actions">
          <button>CANCEL</button>
          <button>OK</button>
        </div>
      </div>
    </>
  );
}
