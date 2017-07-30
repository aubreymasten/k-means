function Random(){}

Random.prototype.int = function(min, max){
  return Math.floor(Math.random() * (max - min) - min);
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
  this.element.setFillColor('black');
}

function Centroid(params) {
  this.x = params.x;
  this.y = params.y;
  this.color = params.color;
  this.element = params.element;
  this.vectors = [];
  this.lines = [];
  this.hull = [];
}

Centroid.prototype.initialize = function(params){
  this.color = params.c;
  this.element = Shape.Rectangle(this.x, this.y, 10,10);
  this.element.setFillColor(this.getRGB());
}

Centroid.prototype.getRGB = function(){
  return `rgb(${this.color.r},${this.color.g},${this.color.b})`;
}

Centroid.prototype.getRGBA = function(a = 1){
  return `rgba(${this.color.r},${this.color.g},${this.color.b},${a})`;
}

Centroid.prototype.sortY = function(){
  this.vectors.sort(function(a,b){
    if(a.y < b.y) return -1;
    if(a.y > b.y) return 1;
    if(a.x > b.x) return -1;
    if(a.x < b.x) return 1;
    return 0;
  });
}

Centroid.prototype.sortSlope = function(){
  const P = this.vectors[0];
  this.vectors.sort(function(a,b){
    let sa = ((a.x-P.x)/(a.y-P.y));
    let sb = ((b.x-P.x)/(b.y-P.y));
    if(sa === sb){
      let ad = (Math.sqrt(Math.pow((P.x - a.x), 2) + Math.pow((P.y - a.y), 2)));
      let bd = (Math.sqrt(Math.pow((P.x - b.x), 2) + Math.pow((P.y - b.y), 2)));
      if(ad > bd) return -1;
      if(ad < bd) return 1;
      else return 0;
    }
    if(sa > sb) return -1;
    if(sa < sb) return 1;
  });
}

Vector.prototype.equals = function(v){
  return this.x === v.x && this.y === v.y;
}

Centroid.prototype.graham = function(){
  this.sortY();
  this.sortSlope();
  this.hull.length = 0;

  let n = this.vectors.length;
  this.hull.push(this.vectors[0]);

  let p2 = 2;
  for(; p2 < n; p2++){
    if(this.ccw(this.vectors[0],this.vectors[1], this.vectors[p2]) != 0) break;
  }

  this.hull.push(this.vectors[p2-1]);

  for(let i = p2; i < n; i++){
    let top = this.hull.pop();
    while(this.ccw(this.hull.slice(-1)[0], top, this.vectors[i]) <= 0) {
      top = this.hull.pop();
    }
    this.hull.push(top);
    this.hull.push(this.vectors[i]);
  }

  let segments = this.hull.map( point => {
    return [point.x, point.y];
  });

  this.path = new Path({
    segments: segments
  });

  this.path.setStrokeColor(this.getRGB());
  this.path.setFillColor(this.getRGBA(.3));
  this.path.closed = true;
}

// TODO: draw lines between broken points
Centroid.prototype.ccw = function(p1,p2,p3){
  let area = (p2.x-p1.x)*(p3.y-p1.y)-(p2.y-p1.y)*(p3.x-p1.x);
  if(area < 0) return -1;
  else if(area > 0) return 1;
  else return 0;
}

// NOTE: euclidean distance calculation may be used more than once
// TODO: separate coloration
Centroid.prototype.shape = function(){
  let x = this.x;
  let y = this.y;

  this.vectors.sort( (a,b) => {
    return (Math.sqrt(Math.pow((x - b.x), 2) + Math.pow((y - b.y), 2))) - (Math.sqrt(Math.pow((x - a.x), 2) + Math.pow((y - a.y), 2)));
  });

  this.lines = this.lines.concat(this.vectors.map( v => {
    return new Path.Line(new Point(v.x, v.y), new Point(this.x, this.y));
  }));

  this.lines.forEach( l => {
    l.strokeColor = this.getRGB();
  });
}

Centroid.prototype.clearShapes = function(){
  this.lines.forEach(function(l){
    l.remove();
  });
  if(this.path) this.path.remove();
  if(this.text) this.text.remove();
}

function Dataset(params){
  this.min = params.min;
  this.xMax = params.xMax;
  this.yMax = params.yMax;

  this.vectors = [];
  this.centroids = [];
  this.rand = new Random();
}

Dataset.prototype.generateArbitrary = function(count) {
  for(let i = 0; i < count; i++){
    let vector = new Vector({
      x: this.rand.int(this.min, this.xMax),
      y: this.rand.int(this.min, this.yMax)
    });
    vector.initialize();
    this.vectors.push(vector);
  }
}

Dataset.prototype.pointVis = function(){
  this.centroids.forEach( c => {
    c.shape();
  });
}

Dataset.prototype.clear = function(){
  this.centroids.forEach( c => {
    c.clearShapes();
  });
}

Dataset.prototype.generateCentroids = function(centroidCount){
  if(this.centroids.length < 20){
    for(let i = 0; i < centroidCount; i++){
      let centroid = new Centroid({
        x: this.rand.int(this.min, this.xMax),
        y: this.rand.int(this.min, this.yMax),
      });
      centroid.initialize({c: this.rand.color()})
      this.centroids.push(centroid);
    }
  }

}

Dataset.prototype.calculateNearest = function(){
  this.centroids.forEach( c => {
    c.vectors.length = 0;
    c.clearShapes();
  });

  this.vectors.forEach( v => {
    this.closest(v);
    v.element.setFillColor(this.centroids[0].getRGB());
    this.centroids[0].vectors.push(v);
  });

  this.centroids.forEach( c => {
    c.mean();
    c.updatePos();
    c.graham();
  });
}

Centroid.prototype.updatePos = function(){
  this.element.setPosition(this.x, this.y);
}

Centroid.prototype.mean = function(){
  let x = this.vectors.reduce(function(acc, v){
    return [acc[0]+v.x, acc[1]+v.y];
  },[0,0]);
  this.x = Math.floor(x[0]/this.vectors.length);
  this.y = Math.floor(x[1]/this.vectors.length);
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
  let data = new Dataset({
    min: 0,
    xMax: paper.view.bounds.width,
    yMax: paper.view.bounds.height
  });
  data.generateArbitrary(1000);
  data.generateCentroids(1);

  $('#gen-arb').click(function(){
    data.generateArbitrary(500);
    $("#datapoints").text(`datapoints: ${data.vectors.length}`)
  });

  $('#gen-cen').click(function(){
    data.generateCentroids(1);
    $("#centroids").text(` centroids: ${data.centroids.length}`)
  });

  $('#k-means').click(function(){
    data.clear();
    data.kMeans();
  });

  paper.view.draw();
});
