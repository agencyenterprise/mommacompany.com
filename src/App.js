import React, { useEffect, useRef, useState } from 'react'
import dataJson from './data.json'
import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';
import * as THREE from 'three';
import classNames from 'classnames';
import { getImageSize } from 'react-image-size';

function App() {

  const [data, setData] = useState();
  const [currentIndex, setCurrentIndex] = useState(0)

  const loadData = async (currentIndex) => {
    let newData = {
      nodes: [
        {
          id: 10000, img: dataJson[currentIndex].holding.image, name: dataJson[currentIndex].holding.name, width: 3500, height: 3500
        }],
    }

    for (let id = 0; id < dataJson[currentIndex].subsidiaries.length; id++) {
      const subsidiary = dataJson[currentIndex].subsidiaries[id];

      const { width, height } = await getImageSize(subsidiary.image);
      newData.nodes.push({ id: id, img: subsidiary.image, name: subsidiary.name, width, height })
    }

    newData.links = [...Array(dataJson[currentIndex].subsidiaries.length).keys()]
      .filter(id => id !== 10000)
      .map(id => ({
        source: id,
        target: 10000
      }))

    console.log(newData)
    setData(newData)
  }

  useEffect(() => {
    loadData(currentIndex);
  }, [currentIndex])

  const GROUPS = 12;

  return (
    <div className="flex flex-col gap-4 h-screen justify-between w-full bg-white">
      <header className='absolute top-0 left-0 right-0 z-10 flex flex-col gap-4 w-full p-4 bg-white justify-center'><h1 className='text-4xl text-center font-semibold text-slate-900'>Momma Company</h1>
        <div className='px-4 flex flex-row gap-8 justify-center'>
          {dataJson.map((company, index) => <div key={index} onClick={() => setCurrentIndex(index)} className={classNames('cursor-pointer rounded-full bg-slate-300 hover:brightness-110 active:bg-slate-400', currentIndex === index ? 'drop-shadow-[0_0px_5px_#000000]' : '')}>
            {/* {company.holding.name} */}
            <img src={company.holding.image} className='w-16 rounded-full' />
          </div>)}
        </div></header>
      {/* {data && <div className="col-md-35 w-full h-full mx-auto my-auto flex flex-row justify-center items-center">
        <ReactBubbleChart onClick={() => { }} data={data} width={1280} height={720} center={{ x: 640, y: 360 }} forceStrength={0.03} />
      </div>} */}
      {/* <div className="chart"></div> */}
      {/* <ReactRelationGraph
        width={600}
        height={600}
        relations={data}
        onClick={(relation) => console.log('clicked: ', relation.name)}
        bgColor='white'
      /> */}
      {data && <ForceGraph3D
        graphData={data}
        nodeThreeObject={({ img, width, height }) => {
          var imgTexture = new THREE.TextureLoader().load(img);
          const calcHeight = (12 / width) * height;

          const material = new THREE.SpriteMaterial({ map: imgTexture });
          const sprite = new THREE.Sprite(material);
          sprite.color = "transparent"
          sprite.scale.set(12, calcHeight);
          return sprite;
        }}
        linkAutoColorBy={d => data.nodes[d.source].id % GROUPS}
        linkWidth={1}
        backgroundColor='transparent'
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 4;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4); // some padding

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x, node.y);
        }}
      />}
    </div>
  );
}

function getCorrectTextColor(hex) {

  /*
  From this W3C document: http://www.webmasterworld.com/r.cgi?f=88&d=9769&url=http://www.w3.org/TR/AERT#color-contrast
  
  Color brightness is determined by the following formula: 
  ((Red value X 299) + (Green value X 587) + (Blue value X 114)) / 1000
  
  I know this could be more compact, but I think this is easier to read/explain.
  
  */

  const threshold = 130; /* about half of 256. Lower threshold equals more dark text on dark background  */

  const hRed = hexToR(hex);
  const hGreen = hexToG(hex);
  const hBlue = hexToB(hex);


  function hexToR(h) { return parseInt((cutHex(h)).substring(0, 2), 16) }
  function hexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16) }
  function hexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16) }
  function cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h }

  const cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
  if (cBrightness > threshold) { return "#000000"; } else { return "#ffffff"; }
}

function generateRandomColor() {
  const hexValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];
  let hex = '#';

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * hexValues.length)
    hex += hexValues[index];
  }
  return hex;
}

function invertColor(hex) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.');
  }
  // invert color components
  var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}

export default App;
