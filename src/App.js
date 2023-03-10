import React, { useEffect, useRef, useState } from 'react'
import dataJson from './data.json'
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import classNames from 'classnames';
import { getImageSize } from 'react-image-size';
import logo from './assets/logo.svg'
import SpriteText from 'three-spritetext'

function App() {

  const [data, setData] = useState();
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const graphRef = useRef(null)
  const [autoOrbitEnabled, setAutoOrbitEnabled] = useState(false)
  const [autoOrbitInterval, setAutoOrbitInterval] = useState(null)

  const loadData = async (currentIndex) => {
    setLoading(true)
    let newData = {
      nodes: [
        {
          id: 10000, img: dataJson[currentIndex].holding.image, name: dataJson[currentIndex].holding.name, width: 3500, height: 3500
        }],
    }

    for (let id = 0; id < dataJson[currentIndex].subsidiaries.length; id++) {
      const subsidiary = dataJson[currentIndex].subsidiaries[id];

      try {
        const { width, height } = await getImageSize(subsidiary.image);
        newData.nodes.push({ id: id, img: subsidiary.image, name: subsidiary.name, width, height })
      } catch {
        newData.nodes.push({ id: id, name: subsidiary.name })
      }
    }

    newData.links = [...Array(dataJson[currentIndex].subsidiaries.length).keys()]
      .filter(id => id !== 10000)
      .map(id => ({
        source: id,
        target: 10000
      }))

    setData(newData)
    setLoading(false)
  }

  const handleEngineStop = () => {
    graphRef.current.zoomToFit(400)

    if (autoOrbitEnabled) {
      setTimeout(() => {
        startAutoOrbit();
      }, 500)
    }
  }

  const startAutoOrbit = () => {
    if (autoOrbitInterval) clearInterval(autoOrbitInterval)
    // camera orbit
    const distance = graphRef.current.cameraPosition().z;
    let angle = 0;
    setAutoOrbitInterval(setInterval(() => {
      graphRef?.current?.cameraPosition({
        x: distance * Math.sin(angle),
        z: distance * Math.cos(angle)
      });
      angle += Math.PI / 600;
    }, 10));
  }

  const stopAutoOrbit = () => {
    clearInterval(autoOrbitInterval);
  }

  useEffect(() => {
    stopAutoOrbit();
    loadData(currentIndex);
    // setTimeout(() => {
    //   startAutoOrbit();
    // }, 500)
  }, [currentIndex])

  const GROUPS = 12;

  return (
    <div className="flex flex-col gap-4 h-screen justify-between w-full bg-white">
      <header className='absolute top-0 left-0 right-0 z-10 flex flex-col gap-4 w-full p-4 bg-white justify-center'>
        <div className='flex flex-row justify-center gap-2 items-center'>
          <img src={logo} className='h-12 w-12' alt="momma company logo" />
          <h1 className='text-4xl text-center font-semibold text-slate-900'>Momma Company</h1>
        </div>
        <h1 className="text-center mx-auto w-full">Sometimes we want to ask a company ???Who???s your momma????</h1>
        <div className='px-4 flex flex-row gap-8 justify-center'>
          {dataJson.map((company, index) => <div key={index} onClick={() => setCurrentIndex(index)} className={classNames('cursor-pointer rounded-full bg-slate-300 hover:brightness-110 active:bg-slate-400', currentIndex === index ? 'drop-shadow-[0_0px_5px_#000000]' : '')}>
            {company.holding.image ? <img src={company.holding.image} alt={`${company.holding.name} logo`} className='w-16 rounded-full' /> : company.holding.name}
          </div>)}
        </div></header>
      <div className='mt-[80px]'>
        {!loading && <ForceGraph3D
          ref={graphRef}
          graphData={data}
          nodeThreeObject={({ img, width, height, name, color }) => {
            if (img) {
              var imgTexture = new THREE.TextureLoader().load(img);
              const calcHeight = (12 / width) * height;

              const material = new THREE.SpriteMaterial({ map: imgTexture });
              const sprite = new THREE.Sprite(material);
              sprite.scale.set(12, calcHeight);
              return sprite;
            } else {
              var randomColor = Math.floor(Math.random() * 16777215).toString(16);
              const sprite = new SpriteText(name);
              sprite.color = `#${randomColor}`;
              sprite.textHeight = 4;
              return sprite;
            }
          }}
          nodeColor="transparent"
          linkAutoColorBy={d => data.nodes[d.source].id % GROUPS}
          linkWidth={1}
          backgroundColor='#FFFFFF'
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 4;
            ctx.font = `${fontSize}px Sans-Serif`;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, node.x, node.y);
          }}
          cooldownTicks={100}
          onEngineStop={handleEngineStop}
          enableNavigationControls={!autoOrbitEnabled}
          enableNodeDrag={!autoOrbitEnabled}
        />}
      </div>
      {loading && <h1 className='text-center my-auto mx-auto'>Loading...</h1>}
      <div className='absolute bottom-2 left-2 flex flex-row gap-2 md:gap-8'>
        <a href="https://wikipedia.org/" rel="noreferrer" target="_blank">Data source</a>
        <a href='https://github.com/agencyenterprise/mommacompany.com' rel="noreferrer" target="_blank">We're open source, contribute on GitHub</a>
      </div>
      <div className='absolute bottom-14 right-2 p-2'><h1>We build agency increasing tools like Momma company to empower people.</h1></div>
    </div>
  );
}

export default App;
