//Raw data for the chart
  var data = [  
    {id: 0, name:"Science Pack 1", parent: [5,3], children: [], img: 'science-pack-1'},
    {id: 1, name:"Iron Plate", parent: [2,7], children: [3], img: 'iron-plate'},
    {id: 2, name:"Iron Ore", parent: [], children: [1], img: 'iron-ore'},
    {id: 3, name:"Iron Gear Wheel", parent: [1], children: [0], img: 'iron-gear-wheel'},
    {id: 4, name:"Copper Ore", parent: [], children: [5], img: 'copper-ore'},
    {id: 5, name:"Copper Plate", parent: [4,7], children: [0], img: 'copper-plate'},
    {id: 6, name:"Stone", parent: [], children: [7], img: 'stone'},
    {id: 7, name:"Stone Furnace", parent: [6], children: [1,5], img: 'stone-furnace'}   
  ];