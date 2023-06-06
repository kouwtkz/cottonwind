window.addEventListener("DOMContentLoaded", () => {
  const player = document.querySelector("#audio_box");
  const audio = document.querySelector("#audio_player");
  audio.volume = 0.7;
  window.audio_synce = () => {
    if (audio.paused) {
      document.documentElement.classList.remove("audio_play");
    } else {
      document.documentElement.classList.add("audio_play");
    }
    if (audio.loop) {
      document.documentElement.classList.add("audio_loop");
    } else {
      document.documentElement.classList.remove("audio_loop");
    }
  };
  audio.addEventListener("play", (e) => {
    audio_synce();
  });
  audio.addEventListener("pause", (e) => {
    audio_synce();
  });
  audio.addEventListener("ended", (e) => {
    audio_stop();
  });
  window.audio_setlist = (base = document) => {
    base
      .querySelectorAll(
        `.playlist [data-src$="${audio.src.match(/[^/]+$/)[0]}"]`,
      )
      .forEach((e) => {
        e.classList.add("playing");
      });
  };
  audio_setlist();
  window.audio_set = (data) => {
    if (player.title !== data.title) {
      player.title = data.title;
    }
    if (audio.src === convertAbsUrl(data.src)) {
      return audio.paused;
    } else {
      document.querySelectorAll(`.playlist .playing`).forEach((e) => {
        e.classList.remove("playing");
      });
      document
        .querySelectorAll(`[data-src="${data.src}"]`)
        .forEach((e) => {
          e.classList.add("playing");
        });
      audio.src = data.src;
      return true;
    }
  };
  window.audio_play = (e = null) => {
    if (e ? audio_set(e.dataset) : audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
    audio_synce();
  };
  const _audio_stop = () => {
    audio.pause();
    audio.currentTime = 0;
  };
  window.audio_stop = () => {
    _audio_stop();
    audio_synce();
  };
  window.audio_replay = () => {
    _audio_stop();
    audio.play();
    audio_synce();
  };
  window.audio_loop = () => {
    audio.loop = !audio.loop;
    audio_synce();
  };
  window.addEventListener("keydown", (e) => {
    switch (document.activeElement.tagName) {
      case "BODY":
      case "A":
        switch (e.code) {
          case "KeyK":
            audio_play();
            break;
        }
        break;
    }
  });
  audio_synce();
});
