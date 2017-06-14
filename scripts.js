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
      x: this.rand.int(this.min, this.max),
      y: this.rand.int(this.min, this.max),
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
  let data = new Dataset({min: 0, max: 1000})

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
    let str = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632788659361533818279682303019520353018529689957736225994138912497217752834791315155748572424541506959508295331168617278558890750983817546374649393192550604009277016711390098488240128583616035637076601047101819429555961989467678374494482553797747268471040475346462080466842590694912933136770289891521047521620569660240580381501935112533824300355876402474964732639141992726042699227967823547816360093417216412199245863150302861829745557067498385054945885869269956909272107975093029553211653449872027559602364806654991198818347977535663698074265425278625518184175746728909777727938000816470600161452491921732172147723501414419735685481613611573525521334757418494684385233239073941433345477624168625189835694855620992192221842725502542568876717904946016534668049886272327917860857843838279679766814541009538837863609506800642251252051173929848960841284886269456042419652850222106611863067442786220391949450471237137869609563643719172874677646575739624138908658326459958133904780275900994657640789512694683983525957098258226205224894077267194782684826014769909026401363944374553050682034962524517493996514314298091906592509372216964615157098583874105978859597729754989301617539284681382686838689427741559918559252459539594310499725246808459872736446958486538367362226260991246080512438843904512441365497627807977156914359977001296160894416948685558484063534220722258284886481584560285060168427394522674676788952521385225499546667278239864565961163548862305774564980355936345681743241125150760694794510965960940252288797108931456691368672287489405601015033086179286809208747609178249385890097149096759852613655497818931297848216829989487226588048575640142704775551323796414515237462343645428584447952658678210511413547357395231134271661021359695362314429524849371871101457654035902799344037420073105785390621983874478084784896833214457138687519435064302184531910484810053706146806749192781911979399520614196634287544406437451237181921799983910159195618146751426912397489409071864942319615679452080951465502252316038819301420937621378559566389377870830390697920773467221825625996615014215030680384477345492026054146659252014974428507325186660021324340881907104863317346496514539057962685610055081066587969981635747363840525714591028970641401109712062804390397595156771577004203378699360072305587631763594218731251471205329281918261861258673215791984148488291644706095752706957220917567116722910981690915280173506712748583222871835209353965725121083579151369882091444210067510334671103141267111369908658516398315019701651511685171437657618351556508849099898599823873455283316355076479185358932261854896321329330898570642046752590709154814165498594616371802709819943099244889575712828905923233260972997120844335732654893823911932597463667305836041428138830320382490375898524374417029132765618093773444030707469211201913020330380197621101100449293215160842444859637669838952286847831235526582131449576857262433441893039686426243410773226978028073189154411010446823252716201052652272111660396665573092547110557853763";

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
    let from = [200,200];
    let to = [200+5 *(Math.cos(radians[1])), 200+ 5 * (Math.sin(radians[1]))]
    pi.forEach(function(digit, i){
      let line = new Path.Line(new Point(from[0], from[1]), new Point(to[0], to[1]));
      line.setStrokeColor(stepColors[Math.floor((i/length)*20)]);
      line.setStrokeWidth(1)
      from = to;
      to = [
        from[0]+ 5 * Math.cos(radians[digit]),
        from[1]+ 5 * Math.sin(radians[digit])
      ]
    }, this);
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
