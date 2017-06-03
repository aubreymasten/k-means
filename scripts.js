function Random(){}

Random.prototype.Int = function(max, min){
  return Math.floor(Math.random() * (max - min) - min);
}

Random.prototype.Vector = function(max,min){
  return {x: this.Int(max,min), y: this.Int(max,min)}
}

function Dataset(params){
  this.max = params.max;
  this.min = params.min;
  this.vectors = [];
  this.rand = new Random();
}

Dataset.prototype.generateArbitrary = function(vectorCount) {
  for(let i = 0; i < vectorCount; i++){
    this.vectors.push(this.rand.Vector(this.max, this.min));
  }
}

Dataset.prototype.display = function(){
  this.vectors.forEach(function(v){
    Shape.Circle(v.x,v.y,1).fillColor = 'white';
  })
}

// Dataset.prototype.kMeans = function(params){
//
// }

const displayInit = function(params){
  paper.install(window);
  paper.setup(document.getElementById(`${params.canvas}`))
}

$(document).ready(function(){
  displayInit({canvas: 'canvas'})
  let data = new Dataset({min: 0, max: 600})

  $('#gen').click(function(){
    data.generateArbitrary(20);
    data.display();
  });
  // $('#k-means').click(function(){
  //   data.kMeans({centroids: 5, iterations: 20});
  // })
  paper.view.draw();
});
