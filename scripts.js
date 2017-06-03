function Dataset(params){
  this.max = params.max;
  this.min = params.min;
  this.vectors = [];
}

Dataset.prototype.generateArbitrary = function(vectorNum) {
  for(let i = 0; i < vectorNum; i++){
    let x = Math.floor(Math.random()*(this.max-this.min) + this.min);
    let y = Math.floor(Math.random()*(this.max-this.min) + this.min);
    this.vectors.push({x:x,y:y});
  }
}

Dataset.prototype.display = function(){
  this.vectors.forEach(function(v){
    Shape.Circle(v.x,v.y,1).fillColor = 'white';
  })
}

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
  paper.view.draw();
});
