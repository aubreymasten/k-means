// TODO: add color object
// TODO: separate classes into files
// TODO: module-ize random methods
// TODO: reusable sort & coordinate visualization
// TODO: add timeout repetition

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
  this.element.setFillColor('white');
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

// NOTE: redundant logic
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

Centroid.prototype.vizSort = function(){
  this.vectors.forEach(function(v,i){
      this.text = new PointText(v.element.position);
      this.text.setFillColor('white');
      this.text.setContent(`${i}`);
  })
}

Centroid.prototype.vizCoords = function(){
  this.vectors.forEach(function(v,i){
      this.text = new PointText(v.element.position);
      this.text.setFillColor('white');
      this.text.setContent(`${i}(${v.x},${v.y})`);
  })
}

Vector.prototype.equals = function(v){
  return this.x === v.x && this.y === v.y;
}

// NOTE: unnecessary loops
Centroid.prototype.graham = function(){
  this.sortY();
  this.sortSlope();
  // this.vizSort();
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

  let segments = this.hull.map(function(point){
    return [point.x, point.y];
  })
// TODO: separate visualization and hull generation
  this.path = new Path({
    segments: segments
  });
  this.path.setStrokeColor(this.getRGB());
  this.path.setFillColor(this.getRGBA(.3));
  this.path.closed = true;
}

// TODO: draw lines between broken points
Centroid.prototype.ccw = function(p1,p2,p3){
  if(!p1||!p2||!p3)debugger;
  let area = (p2.x-p1.x)*(p3.y-p1.y)-(p2.y-p1.y)*(p3.x-p1.x);
  if(area < 0) return -1;
  else if(area > 0) return 1;
  else return 0;
}

// TODO: refactor w/ fat arrows
// NOTE: euclidean distance calculation may be used more than once
// TODO: separate coloration
Centroid.prototype.shape = function(){
  let x = this.x;
  let y = this.y;
  this.vectors.sort(function(a,b){
    return (Math.sqrt(Math.pow((x - b.x), 2) + Math.pow((y - b.y), 2))) - (Math.sqrt(Math.pow((x - a.x), 2) + Math.pow((y - a.y), 2)));
  });
  this.lines = this.lines.concat(this.vectors.map(function(v){
    return new Path.Line(new Point(v.x, v.y), new Point(this.x, this.y));
  }, this));
  this.lines.forEach(function(l){
    l.strokeColor = this.getRGB();
  },this);
}

// QUESTION: paper js handling of removal efficient?
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
  this.centroids.forEach(function(c){
    c.shape();
  })
}

Dataset.prototype.clear = function(){
  this.centroids.forEach(function(c){
    c.clearShapes();
  });
}

Dataset.prototype.graham = function(){
  this.centroids.forEach(function(c){
    c.graham();
  })
}

Dataset.prototype.generateCentroids = function(centroidCount){
  for(let i = 0; i < centroidCount; i++){
    let centroid = new Centroid({
      x: this.rand.int(this.min, this.xMax),
      y: this.rand.int(this.min, this.yMax),
    });
    centroid.initialize({c: this.rand.color()})
    this.centroids.push(centroid);
  }
}

// TODO: visualization for sort methods
// TODO: remove redundant vector clearing
Dataset.prototype.calculateNearest = function(){
  this.centroids.forEach(function(c){
    c.vectors.length = 0;
    c.clearShapes();
  });
  this.vectors.forEach(function(v){
    this.closest(v);
    v.element.setFillColor(this.centroids[0].getRGB());
    this.centroids[0].vectors.push(v);
  }, this);
  this.centroids.forEach(function(c){
    c.mean();
    c.updatePos();
    c.graham();
    // c.shape();
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
  })

  $('#gen-arb').click(function(){
    data.generateArbitrary(500);
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
    data.clear();
    data.pointVis();
  });

  $('#hull').click(function(){
    data.clear();
    data.graham();
  });

  $('#pi-gradient').click(function(){
    let str = "14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127372458700660631558817488152092096282925409171536436789259036001133053054882046652138414695194151160943305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912983367336244065664308602139494639522473719070217986094370277053921717629317675238467481846766940513200056812714526356082778577134275778960917363717872146844090122495343014654958537105079227968925892354201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859502445945534690830264252230825334468503526193118817101000";

    let pi = str.split("").map(function(d){return parseInt(d, 10)});
    let radians = [0, 0.628319, 1.25664, 1.88496, 2.51327, 3.14159, 3.76991, 4.39823, 5.02655, 5.65487];
    let stepColors = [
      'rgb(235,168,42)',
      'rgb(234,155,41)',
      'rgb(233,124,42)',
      'rgb(230,81,43)',
      'rgb(221,48,49)',
      'rgb(212,30,58)',
      'rgb(202,11,69)',
      'rgb(186,13,83)',
      'rgb(170,19,98)',
      'rgb(154,37,115)',
      'rgb(136,48,132)',
      'rgb(116,66,148)',
      'rgb(90,81,162)',
      'rgb(70,98,161)',
      'rgb(50,119,152)',
      'rgb(35,136,139)',
      'rgb(40,153,120)',
      'rgb(51,168,102)',
      'rgb(95,175,95)',
      'rgb(127,182,88)'
    ];
    let length = str.split("").length;
    let lines = [];
    let from = [200,200];
    let to = [200+5 *(Math.cos(radians[1])), 200+ 5 * (Math.sin(radians[1]))]
    pi.forEach(function(digit, i){
      lines.push({
        from: {x: from[0], y: from[1]},
        to: {x: to[0], y: to[1]},
        color: stepColors[Math.floor((i/length)*20)]
        })
      let line = new Path.Line(new Point(from[0], from[1]), new Point(to[0], to[1]));
      line.setStrokeColor(stepColors[Math.floor((i/length)*20)]);
      line.setStrokeWidth(1)
      from = to;
      to = [
        from[0]+ 5 * Math.cos(radians[digit]),
        from[1]+ 5 * Math.sin(radians[digit])
      ]
    }, this);
    let bounds = {};

    lines.sort(function(a,b){
      if(a.from.x > b.from.x) return -1;
      if(a.from.x < b.from.x) return 1;
      else return 0;
    });

    bounds.xMax = new Shape.Circle(lines[0].from.x, lines[0].from.y,5);
    bounds.xMax.setFillColor('pink');
    bounds.xMin = new Shape.Circle(lines.slice(-1)[0].from.x, lines.slice(-1)[0].from.y,5);
    bounds.xMin.setFillColor('pink');

    lines.sort(function(a,b){
      if(a.from.y > b.from.y) return -1;
      if(a.from.y < b.from.y) return 1;
      else return 0;
    });

    bounds.yMax = new Shape.Circle(lines[0].from.x, lines[0].from.y,5);
    bounds.yMax.setFillColor('pink');
    bounds.yMin = new Shape.Circle(lines.slice(-1)[0].from.x, lines.slice(-1)[0].from.y,5);
    bounds.yMin.setFillColor('pink');

  });

  $('#pi').click(function(){

    let str = "141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964428810975665933446128475648233786783165271201909145648566923460348610454326648213393607260249141273724587006606315588174881520920962829254091715364367892590360011330530548820466521384146951941511609433057270365759591953092186117381932611793105118548074462379962749567351885752724891227938183011949129833673362440656643086021394946395224737190702179860943702770539217176293176752384674818467669405132000568127145263560827785771342757789609173637178721468440901224953430146549585371050792279689258923542019956112129021960864034418159813629774771309960518707211349999998372978049951059731732816096318595024459455346908302642522308253344685035261931188171010003137838752886587533208381420617177669147303598253490428755468731159562863882353787593751957781857780532171226806613001927876611";

    let pi = str.split("").map(function(d){return parseInt(d, 10)});
    let radians = [0, 0.628319, 1.25664, 1.88496, 2.51327, 3.14159, 3.76991, 4.39823, 5.02655, 5.65487];
    let colors = [
      'rgb(239,186,20)',
      'rgb(238,166,44)',
      'rgb(231,59,38)',
      'rgb(208,3,62)',
      'rgb(174,5,96)',
      'rgb(134,45,136)',
      'rgb(78,82,169)',
      'rgb(18,129,149)',
      'rgb(22,169,103)',
      'rgb(127,184,83)',
    ];

    let length = str.split("").length;
    let from = [200,200];
    let to = [200+20 *(Math.cos(radians[1])), 200+ 20 * (Math.sin(radians[1]))]
    pi.forEach(function(digit, i){
      let line = new Path.Line(new Point(from[0], from[1]), new Point(to[0], to[1]));
      line.setStrokeColor(colors[digit]);
      line.setStrokeWidth(2)
      from = to;
      to = [
        from[0]+ 20 * Math.cos(radians[digit]),
        from[1]+ 20 * Math.sin(radians[digit])
      ]

    }, this);
  });
  paper.view.draw();
});
