

const generateArbitraryVectors = function(vectors, dataset) {
  for(let i = 0; i < vectors; i++){
    let x = Math.floor(Math.random()*(dataset.scale[1]-dataset.scale[0]) + dataset.scale[0]);
    let y = Math.floor(Math.random()*(dataset.scale[1]-dataset.scale[0]) + dataset.scale[0]);
    dataset.vectors.push([x,y]);
  }
}

$(document).ready(function(){
  const dataset = {
    scale: [0,600],
    iterations: 20,
    centroids: 3,
    vectors: []
  }
  paper.install(window);
  paper.setup(document.getElementById('canvas'));


  $('#gen').click(function(){
    generateArbitraryVectors(200, dataset);
    console.log(dataset.vectors);
    dataset.vectors.forEach(function(vector){
      let c = Shape.Circle(vector[0], vector[1], 2);
      c.fillColor = 'black';
    })
  });
  paper.view.draw();
});
