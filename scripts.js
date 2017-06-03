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

function Centroid(params) {
  this.x = params.x;
  this.y = params.y;
  this.color = params.color;
  this.vectors = [];
  this.element = params.element;
}

function Dataset(params){
  this.max = params.max;
  this.min = params.min;
  this.vectors = [];
  this.centroids = [];
  this.rand = new Random();
}

Dataset.prototype.generateArbitrary = function(count) {
  for(let i = 0; i < count; i++){
    let vector = new Vector({
      x: this.rand.int(this.min, this.max),
      y: this.rand.int(this.min, this.max),
      color: 'white'
    });
    this.vectors.push(vector);
  }
}

Dataset.prototype.display = function(){
  this.vectors.forEach(function(v,i){
    Shape.Circle(v.x,v.y,2).fillColor = `${v.color}`;
  });

  this.centroids.forEach(function(c){
    c.element.setPosition(c.x,c.y);
    c.element.setSize(10,10);
    c.element.setFillColor(`${c.color}`);
  });
}

Dataset.prototype.generateCentroids = function(centroidCount){
  for(let i = 0; i < centroidCount; i++){
    let c = this.rand.color();
    let centroid = new Centroid({
      x: this.rand.int(this.min, this.max),
      y: this.rand.int(this.min, this.max),
      color: `rgb(${c.r},${c.g},${c.b})`,
      element: Shape.Rectangle(c.x, c.y, 10,10)
    });
    this.centroids.push(centroid);
  }
}

Dataset.prototype.calculateNearest = function(){
  this.vectors.forEach(function(v,i){
    let c = this.distance(v,i, this.centroids);
    v.color = c.color;
    c.vectors.push(v);
  }, this);
  this.centroids.forEach(function(c){
    let x = c.vectors.reduce(function(acc, v){
      return acc + v.x;
    },0);
    let y = c.vectors.reduce(function(acc, v){
      return acc + v.y;
    },0);
    c.x = x/c.vectors.length;
    c.y = y/c.vectors.length;
    c.vectors = [];
  })
}

Dataset.prototype.distance = function(vector,i, centroids){
  centroids.sort(function(a,b){
    return (Math.sqrt(Math.pow((vector.x - a.x), 2) + Math.pow((vector.y - a.y), 2))) - (Math.sqrt(Math.pow((vector.x - b.x), 2) + Math.pow((vector.y - b.y), 2)))
  });
  return centroids[0]
}

Dataset.prototype.kMeans = function(params){
  this.calculateNearest();
}

const displayInit = function(params){
  paper.install(window);
  paper.setup(document.getElementById(`${params.canvas}`))
}

$(document).ready(function(){
  displayInit({canvas: 'canvas'})
  let data = new Dataset({min: 0, max: 600})

  $('#gen-arb').click(function(){
    data.generateArbitrary(20);
    data.display();
  });
  $('#gen-cen').click(function(){
    data.generateCentroids(5);
    data.display();
  });
  $('#k-means').click(function(){
    data.kMeans();
    data.display();
  });
  paper.view.draw();
});
