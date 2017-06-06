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
  this.element.setFillColor('white');
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

Centroid.prototype.triangulate = function(){
  this.sortY();
  let length = this.vectors.length-1;
  for(let i = 0; i < length; i++){
    let from = new Point(this.vectors[i].x, this.vectors[i].y);
    let to = new Point(this.vectors[i+1].x, this.vectors[i+1].y);
    let line = new Path.Line(from, to);
    line.setStrokeColor(this.color);
    this.lines.push(line);
  }
}

Centroid.prototype.sortX = function(){
  this.vectors.sort(function(a,b){
    return a.x-b.x;
  });
}

Centroid.prototype.sortY = function(){
  this.vectors.sort(function(a,b){
    return a.y-b.y;
  });
}

Centroid.prototype.sortSlope = function(p){
  const P = this.vectors[0];
  this.vectors.sort(function(a,b){
    return ((a.x-P.x)/(a.y-P.y)) - ((b.x-P.x)/(b.y-P.y));
  });
}

// TODO: handle y-min duplicates. select lowest x coord
Centroid.prototype.graham = function(){
  this.sortY();
  this.sortSlope();
  this.vectors.forEach(function(v,i){
    let t = new PointText(new Point(v.x+5, v.y-5));
    t.setFillColor('white');
    t.content = `${i}`;
  });
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
    c.clearShapes();
  });
  this.vectors.forEach(function(v){
    this.closest(v);
    v.element.setFillColor(this.centroids[0].color);
    this.centroids[0].vectors.push(v);
  }, this);
  this.centroids.forEach(function(c){
    c.mean();
    c.updatePos();
    // c.shape();
    // c.triangulate();
  });
}

Centroid.prototype.updatePos = function(){
  this.element.setPosition(this.x, this.y);
}

Centroid.prototype.mean = function(){
  let x = this.vectors.reduce(function(acc, v){
    return [acc[0]+v.x, acc[1]+v.y];
  },[0,0]);
  this.x = x[0]/this.vectors.length;
  this.y = x[1]/this.vectors.length;
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
    data.generateArbitrary(20);
    $("#datapoints").text(`datapoints: ${data.vectors.length}`)
  });
  $('#gen-cen').click(function(){
    data.generateCentroids(1);
    $("#centroids").text(` centroids: ${data.centroids.length}`)
  });
  $('#k-means').click(function(){
    data.kMeans();
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
  });
  $('#triangulate').click(function(){
    // data.centroids[0].sortY();
    data.centroids[0].graham();
    // data.centroids.forEach(function(c){
    //   c.triangulate();
    // });
  });
  paper.view.draw();
});
