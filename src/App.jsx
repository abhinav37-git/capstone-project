import React, { useState } from "react";

const Dashboard = () => {
  const [expandedTask, setExpandedTask] = useState(null);
  const [isToggled, setIsToggled] = useState(false);

  const tasks = [
    { id: 1, title: "Task 1", status: "Introduction", description: "Welcome to Advent of Cyber 2024" },
    { id: 2, title: "Task 2", status: "Introduction", description: "Join our community" },
  ];

  const toggleTask = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  return (
    <div className="container">
       <nav className="navbar">
        <a href="#" className="logo">Smart Classroom</a>
        <div className="switchButtonContainer">
          <label className="switchLabel">
            <input
              type="checkbox"
              checked={isToggled}
              onChange={handleToggle} />
            <span className="switchSlider"></span>
          </label>
        </div>
        <a href="#" className="navIcon">✉️</a>
      </nav>

      <div className="heroSection">
        <div className="leftSection"></div>
           <div className="rightSection">
            <div className="taskGroup">
            {tasks.map((task) => (
              <div key={task.id} className="taskContainer">
                <div className="taskHeader" onClick={() => toggleTask(task.id)}>
        <span className="taskTitle">{task.title}</span>
         <span className="taskStatus">{task.status}</span>
         <span className="expandIcon">{expandedTask === task.id ? "▲" : "▼"}</span>
                </div>
                {expandedTask === task.id && (
                  <div className="taskDetails">{task.description}</div> )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <a href="#" className="chatIcon">💬</a>
    </div>
  );
};

export default Dashboard;


const styles = `
.container {
  font-family: Arial, sans-serif;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f4f4f4;
}

.navbar {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-decoration: none;
  margin-right: 10px; /* Adjust space between logo and toggle */
}

.switchButtonContainer {
  margin-left: 10px; /* Shift toggle more left */
}

.switchLabel {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
}

.switchLabel input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switchSlider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.switchSlider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  border-radius: 50%;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
}

input:checked + .switchSlider {
  background-color: #4caf50;
}

input:checked + .switchSlider:before {
  transform: translateX(14px);
}

.navIcon {
  font-size: 20px;
  color: white;
  text-decoration: none;
  margin-left: auto; /* Keeps the message icon on the right */
}

.heroSection {
  flex: 1;
  display: flex;
  flex-direction: row;
  padding: 20px;
  background-color: #ffffff;
}

.leftSection {
  flex: 1;
  margin-right: 20px;
  background-color: #f4f4f4;
}

.rightSection {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.taskGroup {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.taskContainer {
  background-color: #1e1e2f;
  color: #ffffff;
  border-radius: 5px;
  overflow: hidden;
}

.taskHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  background-color: #2a2a3f;
}

.taskTitle {
  font-weight: bold;
}

.taskStatus {
  background-color: #007bff;
  color: white;
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 12px;
}

.expandIcon {
  font-size: 14px;
}

.taskDetails {
  padding: 10px 15px;
  background-color: #2a2a3f;
  border-top: 1px solid #444;
}

.chatIcon {
  font-size: 30px;
  margin-top: 20px;
  cursor: pointer;
  text-decoration: none;
  color: #007bff;
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

