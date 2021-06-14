const video = document.getElementById("video");
let predictedAges = [];
let aValueFromTheFace = 0;
let expressions = {
  angry: 0,
  disgusted: 0,
  fearful: 0,
  happy: 0,
  neutral: 0,
  sad: 0,
  surprised: 0,
};
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    // console.log(resizedDetections[0].expressions)
    expressions = resizedDetections[0].expressions;
    aValueFromTheFace =
      resizedDetections[0].landmarks.positions[0]._x / displaySize.width;
    faceapi.draw.drawDetections(canvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    const age = resizedDetections[0].age;
    //console.log(age)
    const interpolatedAge = interpolateAgePredictions(age);
    const bottomRight = {
      x: resizedDetections[0].detection.box.bottomRight.x - 50,
      y: resizedDetections[0].detection.box.bottomRight.y,
    };

    // new faceapi.draw.DrawTextField(
    //   [`${faceapi.utils.round(interpolatedAge, 0)} years`],
    //   bottomRight
    // ).draw(canvas);
  }, 100);
});

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}

//P5 STUFF-------------------------------------

let vid;

let colorKey = {
  angry: [226, 28, 31],
  disgusted: [67, 111, 80],
  fearful: [0, 0, 0],
  happy: [255, 192, 0],
  neutral: [255, 255, 255],
  sad: [131, 181, 255],
  surprised: [255, 94, 0],
};
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  // positions canvas 50px to the right and 100px
  // below upper left corner of the window
  cnv.position(0, 0, "fixed");
  vid = createCapture(VIDEO);

  // blendMode(MULTIPLY);
}

function draw() {
  image(vid, 0, 0, width, height);
  background(255, 200, 200, aValueFromTheFace * 255);
  console.log(expressions);
  filter(GRAY);

  let mainExpression = Object.keys(expressions).reduce(function (a, b) {
    return expressions[a] > expressions[b] ? a : b;
  });

  // print(mainExpression)

  // tint(colorKey[mainExpression][0], colorKey[mainExpression][1], colorKey[mainExpression][2])

  background(
    colorKey[mainExpression][0],
    colorKey[mainExpression][1],
    colorKey[mainExpression][2],
    90
  );

  //ellipse(aValueFromTheFace *width, 100, 10, )
}
