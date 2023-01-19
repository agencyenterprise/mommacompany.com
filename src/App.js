import React, { useEffect, useRef, useState } from 'react'
import dataJson from './data.json'
import { ForceGraph2D, ForceGraph3D, ForceGraphVR, ForceGraphAR } from 'react-force-graph';
import * as THREE from 'three';
import classNames from 'classnames';
import { getImageSize } from 'react-image-size';

function App() {

  const [data, setData] = useState();
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    loadData(currentIndex);
  }, [currentIndex])

  const GROUPS = 12;

  return (
    <div className="flex flex-col gap-4 h-screen justify-between w-full bg-white">
      <header className='absolute top-0 left-0 right-0 z-10 flex flex-col gap-4 w-full p-4 bg-white justify-center'><h1 className='text-4xl text-center font-semibold text-slate-900'>Momma Company</h1>
        <div className='px-4 flex flex-row gap-8 justify-center'>
          {dataJson.map((company, index) => <div key={index} onClick={() => setCurrentIndex(index)} className={classNames('cursor-pointer rounded-full bg-slate-300 hover:brightness-110 active:bg-slate-400', currentIndex === index ? 'drop-shadow-[0_0px_5px_#000000]' : '')}>
            {company.holding.image ? <img src={company.holding.image} className='w-16 rounded-full' /> : company.holding.name}
          </div>)}
        </div></header>
      {!loading && <ForceGraph3D
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
        backgroundColor='#00000000'
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
      {loading && <h1 className='text-center my-auto mx-auto'>Loading...</h1>}
      <div className='absolute bottom-2 left-2 flex flex-row gap-2 md:gap-8'>
        <a href="https://wikipedia.org/" target="_blank">Data source</a>
        <a href='https://github.com/agencyenterprise/mommacompany.com' target="_blank">Contribute</a>
      </div>
    </div>
  );
}

export default App;
