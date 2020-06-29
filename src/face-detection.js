const videoContainer = document.getElementById('video-container');
const video = document.getElementById('video');

const colourSection = document.getElementById('colour-contents');
const expressionText = document.getElementById('expression-text');
const videoWidth = 1040;
const videoHeight = 585;

// Required for a NodeJS environment
faceapi.env.monkeyPatch
({
    Canvas: HTMLCanvasElement,
    Image: HTMLImageElement,
    ImageData: ImageData,
    Video: HTMLVideoElement,
    createCanvasElement: () => document.createElement('canvas'),
    createImageElement: () => document.createElement('img')
});

// Load all of the models asynchronously and then starts the video
Promise.all
(
    [
        faceapi.nets.tinyFaceDetector.loadFromUri('assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('assets/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('assets/models')
    ]
).then(startVideo);

// Accesses the user's webcam on their device
function startVideo()
{
    if(navigator.mediaDevices.getUserMedia)
    {
        navigator.mediaDevices.getUserMedia
        ({ 
            video:
            {
                width: { ideal: videoWidth },
                height: { ideal: videoHeight }
            }
        })

        .then(function(stream)
        {
            video.srcObject = stream;
        })

        .catch(function(error)
        {
            console.log("There was an error retrieving the video stream");
        });
    }
}

function changeExpressionColour(colour, expressionName)
{
    colourSection.style.backgroundColor = colour;
    expressionText.innerHTML = expressionName;
}

video.addEventListener('playing', () =>
{
    // How often the face detection should run in ms
    var updateDelay = 50;

    const canvas = faceapi.createCanvasFromMedia(video);

    canvas.width = video.offsetWidth;
    canvas.height = video.offsetHeight;

    videoContainer.appendChild(canvas);

    const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
    faceapi.matchDimensions(canvas, displaySize);

    var faceTimeoutCounter = 0;

    setInterval(async () =>
    {
        // Detect all of the faces that are present in the video
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        
        // Resize the detections to match the size of the video
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        // Draw face-api interface
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        
        // Change colour based on expression
        if(detections.length > 0)
        {
            faceTimeoutCounter = 0;

            if(detections[0].expressions.neutral > 0.7)         changeExpressionColour('#eeeeee', 'Netural');
            else if(detections[0].expressions.happy > 0.7)      changeExpressionColour('#71d941', 'Happy');
            else if(detections[0].expressions.angry > 0.7)      changeExpressionColour('#d94141', 'Angry');
            else if(detections[0].expressions.surprised > 0.7)  changeExpressionColour('#effa19', 'Surprised');
            else if(detections[0].expressions.sad > 0.7)        changeExpressionColour('#419ad9', 'Sad');
            else if(detections[0].expressions.disgusted > 0.7)  changeExpressionColour('#9741d9', 'Disgusted');
            else if(detections[0].expressions.fearful > 0.7)    changeExpressionColour('#474747', 'Fearful');
        }

        // Removes expression colour flickering to white if face detection is lost for a moment
        if(detections.length === 0)
        {
            faceTimeoutCounter += updateDelay;
            
            // If there has been no detection after 500ms...
            if(faceTimeoutCounter > 500)
            {
                colourSection.style.backgroundColor = '#aaaaaa';
            }
        }
    },
    updateDelay);
});

