function Random(){}

Random.prototype.int = function(min, max){
  return Math.floor(Math.random() * (max - min) - min);
}

Random.prototype.vector = function(min,max){
  return {x: this.int(min,max), y: this.int(min,max)}
}

Random.prototype.color = function(){
  return {
    r: this.int(0,255),
    g: this.int(0,255),
    b: this.int(0,255)
  }
}

function Vector(params){
  this.x = params.x;
  this.y = params.y;
  this.color = params.color;
}

function Dataset(params){
  this.max = params.max;
  this.min = params.min;
  this.vectors = [];
  this.rand = new Random();
}

Dataset.prototype.generateArbitrary = function(vectorCount) {
  for(let i = 0; i < vectorCount; i++){
    let vector = new Vector({
      x: this.rand.int(this.min, this.max),
      y: this.rand.int(this.min, this.max),
      color: 'white'
    });
    this.vectors.push(vector);
  }
}

Dataset.prototype.display = function(){
  this.vectors.forEach(function(v){
    Shape.Circle(v.x,v.y,1).fillColor = `${v.color}`;
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
