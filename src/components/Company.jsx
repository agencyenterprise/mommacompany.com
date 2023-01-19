import React from 'react';

const Company = ({ company }) => {
  return (
    <div className='flex flex-col gap-1 h-min'>
      <div className='flex flex-row items-center gap-2'>
        <h1 className='text-4xl text-black my-auto'>{company.holding.name}</h1>
        <img src={company.holding.image} className='max-h-[60px] my-auto' />
      </div>
      <div className='flex flex-wrap'>
        {company.subsidiaries.map((subsidiary, index) => (
          <div key={index} id="card" className='[&>img]:hover:scale-150 flex flex-col justify-between bg-slate-200 hover:bg-violet-300 bg-opacity-60 p-4 max-w-sm h-auto aspect-square'>
            <img src={subsidiary.image} className='w-full transition-all ease-in-out my-auto mx-auto max-w-[70px] md:max-w-[150px]' />
            <h1 className='text-xl text-black mx-auto text-center'>{subsidiary.name}</h1>
          </div>
        ))}
      </div>
    </div >
  );
}

export default Company;
