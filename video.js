
const params = new URLSearchParams(window.location.search);
const downloadLink = params.get('downloadLink');
const video = document.createElement('video');
video.src = downloadLink;
video.controls = true;
video.autoplay = true;
document.body.append(video)
