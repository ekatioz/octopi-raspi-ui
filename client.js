/* eslint-disable camelcase */
/* eslint-disable no-multi-assign */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */

function renderProgress(percent) {
  const el = document.querySelector('.progress');
  const size = 180;
  const lineWidth = 30;

  const canvas = el.querySelector('canvas');
  const span = el.querySelector('.percent');
  span.textContent = `${percent}%`;

  if (typeof G_vmlCanvasManager !== 'undefined') {
    // eslint-disable-next-line no-undef
    G_vmlCanvasManager.initElement(canvas);
  }

  const ctx = canvas.getContext('2d');
  canvas.width = canvas.height = size;

  ctx.translate(size / 2, size / 2); // change center
  ctx.rotate(-0.5 * Math.PI); // rotate -90 deg

  const radius = (size - lineWidth) / 2;

  function drawCircle(color, lineWidth, percent) {
    percent = Math.min(Math.max(0, percent || 1), 1);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2 * percent, false);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round'; // butt, round or square
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  drawCircle('#c0d6df', lineWidth, 100 / 100);
  drawCircle('#4f6d7a', lineWidth, percent / 100);
}

function renderTemperatures(tool, bed) {
  const render = (element, temp) => {
    const { actual, target } = temp;
    element.innerText = `${Math.round(actual)}°C / ${Math.round(target)}°C`;
  };
  const toolElement = document.querySelector('.toolTemp');
  const bedElement = document.querySelector('.bedTemp');
  render(toolElement, tool);
  render(bedElement, bed);
}

function secondsToTimeString(sec_num) {
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num - hours * 3600) / 60);
  let seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${hours}:${minutes}:${seconds}`;
}

function renderTimings(timeElapsed, timeLeft) {
  document.querySelector('.timeElapsed').innerText = secondsToTimeString(
    timeElapsed,
  );
  document.querySelector('.timeLeft').innerText = secondsToTimeString(timeLeft);
}

function renderFileName(fileName) {
  document.querySelector('.file').innerText = fileName;
}

const headers = {
  'Content-Type': 'application/json',
  'X-Api-Key': 'keyGoesHere',
};

const layout = document.querySelector('.layout');

setInterval(() => {
  fetch('http://octopi/api/printer', { headers })
    .then((r) => r.json())
    .then(({ temperature, state: { flags } }) => {
      renderTemperatures(temperature.tool0, temperature.bed);
      if (flags.printing) {
        layout.classList.add('printing');
        fetch('https://octopi/api/job', { headers })
          .then((r) => r.json())
          .then(({ job, progress }) => {
            renderTimings(progress.printTime, progress.printTimeLieft);
            renderProgress(Math.round(progress.completion * 100));
            renderFileName(job.file.name);
          });
      } else {
        layout.classList.add('printing');
        // layout.classList.remove('printing');
      }
    });
}, 2000);
