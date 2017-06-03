function Dataset(params){
  this.max = params.max;
  this.min = params.min;
  this.vectors = [];
}

Dataset.prototype.generateArbitrary = function(vectorCount) {
  for(let i = 0; i < vectorCount; i++){
    this.vectors.push(this.randVector());
  }
}

Dataset.prototype.randVector = function(){
  return {x: this.randInt(), y: this.randInt()}
}

Dataset.prototype.randInt = function(){
  return Math.floor(Math.random() * (this.max - this.min) - this.min);
}

Dataset.prototype.display = function(){
  this.vectors.forEach(function(v){
    Shape.Circle(v.x,v.y,1).fillColor = 'white';
  })
}

// Dataset.prototype.kMeans = function(){
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
