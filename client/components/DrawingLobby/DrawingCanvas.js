import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { CirclePicker } from 'react-color';
import { Link } from 'react-router-dom';


const DrawingCanvas = () => {
  //states
  const [tool, setTool] = useState('pen');
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const [selectedColor, setColor] = useState('#f44336');

  //mouse down event to start drawing
  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      { tool, points: [pos.x, pos.y], strokeColor: selectedColor },
    ]);
    console.log(lines);
  };

  //mouse movement
  const handleMouseMove = (e) => {
    //no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    //add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    //replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  //when user lets go of mouse click
  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  var stageRef = useRef()

  const getDataURI = () => {
    const uri = stageRef.current.toDataURL();
    console.log("this is the data url ", uri)
    localStorage.setItem('dataURI', uri)
  }

  return (
    <div>
      <Stage
        width={1600}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: '1px solid black' }}
        ref={stageRef}
      >
        <Layer>
          {lines.map((line, i, strokeColor) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.strokeColor}
              strokeWidth={5}
              tension={0.5}
              lineCap='round'
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
      <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value='pen'>Pen</option>
        <option value='eraser'>Eraser</option>
      </select>
      <Link to='/postdraw'>
        <button onClick={getDataURI}>
          end session
        </button>
      </Link>
      <CirclePicker
        color={selectedColor}
        onChange={(e) => {
          setColor(e.hex);
          console.log(e);
        }}
      />
    </div>
  );
};

export default DrawingCanvas;
