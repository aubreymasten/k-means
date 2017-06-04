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
  this.color = 'white';
}

Vector.prototype.initialize = function(){
  this.element = Shape.Circle(this.x, this.y, 2);
}

function Centroid(params) {
  this.x = params.x;
  this.y = params.y;
  this.color = params.color;
  this.vectors = [];
  this.lines = [];
  this.element = params.element;
}

Centroid.prototype.initialize = function(params){
  this.color = `rgb(${params.c.r},${params.c.g},${params.c.b})`;
  this.element = Shape.Rectangle(this.x, this.y, 10,10);
  this.element.setFillColor(this.color);
}

Centroid.prototype.shape = function(){
  this.clearShapes();
  let x = this.x;
  let y = this.y;
  this.vectors.sort(function(a,b){
    return (Math.sqrt(Math.pow((x - b.x), 2) + Math.pow((y - b.y), 2))) - (Math.sqrt(Math.pow((x - a.x), 2) + Math.pow((y - a.y), 2)));
  });
  this.lines = this.vectors.map(function(v){
    return new Path.Line(new Point(v.x, v.y), new Point(this.x, this.y));
  }, this);
  this.lines.forEach(function(l){
    l.strokeColor = this.color;
  },this);
}

Centroid.prototype.clearShapes = function(){
  this.lines.forEach(function(l){
    l.remove();
  });
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
      y: this.rand.int(this.min, this.max)
    });
    vector.initialize();
    this.vectors.push(vector);
  }
}

Dataset.prototype.display = function(){
  this.vectors.forEach(function(v,i){
    v.element.setPosition(v.x,v.y);
    v.element.setFillColor(`${v.color}`);
  });

  this.centroids.forEach(function(c){
    c.element.setPosition(c.x,c.y);
    c.element.setFillColor(`${c.color}`);
  });
}

Dataset.prototype.generateCentroids = function(centroidCount){
  for(let i = 0; i < centroidCount; i++){
    let centroid = new Centroid({
      x: this.rand.int(this.min, this.max),
      y: this.rand.int(this.min, this.max),
    });
    centroid.initialize({c: this.rand.color()})
    this.centroids.push(centroid);
  }
}

Dataset.prototype.calculateNearest = function(){
  this.centroids.forEach(function(c){
    c.vectors.length = 0;
  });
  this.vectors.forEach(function(v){
    this.closest(v);
    v.color = this.centroids[0].color;
    this.centroids[0].vectors.push(v);
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
  });
}

Dataset.prototype.closest = function(v){
  this.centroids.sort(function(a,b){
    return (Math.sqrt(Math.pow((v.x - a.x), 2) + Math.pow((v.y - a.y), 2))) - (Math.sqrt(Math.pow((v.x - b.x), 2) + Math.pow((v.y - b.y), 2)))
  });
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
  let data = new Dataset({min: 0, max: 1000})

  $('#gen-arb').click(function(){
    data.generateArbitrary(100);
    data.display();
    $("#datapoints").text(`datapoints: ${data.vectors.length}`)
  });
  $('#gen-cen').click(function(){
    data.generateCentroids(1);
    data.display();
    $("#centroids").text(` centroids: ${data.centroids.length}`)
  });
  $('#k-means').click(function(){
    data.kMeans();
    data.display();
  });
  $('#shape').click(function(){
    data.centroids.forEach(function(c){
      c.shape();
    });
  });
  $('#unshape').click(function(){
    data.centroids.forEach(function(c){
      c.clearShapes();
    });
  })
  paper.view.draw();
});
