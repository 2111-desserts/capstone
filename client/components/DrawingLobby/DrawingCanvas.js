import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { CirclePicker } from 'react-color';
import Eraser from '../../../public/icons/eraser.svg';
import Pencil from '../../../public/icons/pencil.svg';
import { Howl } from 'howler';
import { Link, useHistory } from 'react-router-dom';
import { Container, ButtonGroup, Button, Row, Col } from 'react-bootstrap';
import socket from '../../socket';

// const audioClip = {
//   soundBrushStroke:
//     'https://algorithmic-8ball.neocities.org/zapsplat_industrial_paint_brush_long_single_stroke_001_11977.mp3',
// };

/*let myLayerMap = {
  //userlogs in, userid
  //on login create a new later
  myLayerMap[user.id] = new Konva.Layer();

  //socket message comes in
  socket.on(message => {
    if (message.userID) {
      let layer = myLayerMap[message.userId]
      //update this layer
    }
  })
}*/

const DrawingCanvas = () => {
  //states
  const [tool, setTool] = useState('pen');
  const [lines, setLines] = useState([]);
  const [userLines, setUserLines] = useState({});
  const isDrawing = useRef(false);
  // const stageRef = useRef(null);
  const stageRef = React.createRef();
  // const soundBrushStroke = useRef(false);
  const [selectedColor, setColor] = useState('#f44336');
  const history = useHistory();

  //'COMPONENTDIDMOUNT'
  useEffect(() => {
    socket.on('is-drawing', (lines) => {
      setUserLines(lines);
    });
  }, []);

  useEffect(() => {
    socket.on('ending-session', () => {
      getDataURI();
      history.push('/PostDraw');
    });
  }, []);

  //sound: paintstroke
  // const soundPlay = (src) => {
  //   const soundBrushStroke = new Howl({
  //     src,
  //     html5: true,
  //     volume: 0.02,
  //   });
  //   soundBrushStroke.play();
  // };

  //mouse down event to start drawing
  const handleMouseDown = (e) => {
    isDrawing.current = true;
    // soundBrushStroke = true;
    // soundPlay(audioClip.soundBrushStroke);
    const pos = e.currentTarget.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        tool,
        points: [pos.x, pos.y],
        strokeColor: selectedColor,
      },
    ]);
    // socket.emit('is-drawing', pos);
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
    // socket.emit('is-drawing', lines);
  };

  //when user lets go of mouse click
  const handleMouseUp = () => {
    isDrawing.current = false;
    socket.emit('is-drawing', lines);
  };

  const endSession = () => {
    const roomId = window.localStorage.getItem('roomId');
    socket.emit('end-session', roomId);
    getDataURI();
  };

  const getDataURI = () => {
    const uri = stageRef.current.toDataURL();
    console.log('this is the data url ', uri);
    localStorage.setItem('dataURI', uri);
  };

  const host = window.localStorage.getItem('host');
  return (
    <div height='700px'>
      <Row style={{ margin: '10px' }}>
        <Col>
          <CirclePicker
            color={selectedColor}
            width='330px'
            circleSpacing={11}
            circleSize={25}
            onChange={(e) => {
              setColor(e.hex);
            }}
          />
        </Col>
        <Col>
          <ButtonGroup>
            <Button
              variant='outline-primary'
              type='button'
              value='eraser'
              onClick={(e) => {
                setTool(e.currentTarget.value);
              }}
            >
              <Eraser />
            </Button>
            <Button
              variant='outline-primary'
              type='button'
              value='pen'
              className='toolbox-btn'
              onClick={(e) => {
                setTool(e.currentTarget.value);
              }}
            >
              <Pencil />
            </Button>
            {host === 'true' ? (
              <Link to='/postdraw'>
                <Button variant='warning' onClick={endSession}>
                  end session
                </Button>
              </Link>
            ) : (
              <br />
            )}
          </ButtonGroup>
        </Col>
      </Row>
      <Stage
        width={760}
        height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          boxShadow:
            '0px 0px 0px 5px rgba(255, 255, 255, 0.4), 0px 4px 20px rgba(0, 0, 0, 0.92)',
        }}
        ref={stageRef}
      >
        {/*layer can have an id, clearBeforeDraw set  false to prevent canvas clear*/}
        <Layer>
          {lines.map((line, i) => (
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
    </div>
  );
};

export default DrawingCanvas;
