
// Selectors
const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');
const searchResults = document.getElementById('search-results');
const apiURL = 'https://api.lyrics.ovh';

// For play button
let currentAudio = null;
let currentBtn = null;

async function searchSongs(term) {
  searchResults.textContent = `Showing results for "${term}"`;
  
  const res = await fetch(`${apiURL}/suggest/${term}`);
  const data = await res.json();

  showDataSafe(data);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();

  if (!searchTerm) {
    alert('Please type in a search term');
  } else {
    searchSongs(searchTerm);
  }
});
function showDataUnsafe(lyrics) {
  result.innerHTML = `
    <ul class="songs">
      ${lyrics.data
        .map(
          (song) => `<li>
      <span><strong>${song.artist.name}</strong> - ${song.title}</span>
      <button class="btn" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics</button>
    </li>`
        )
        .join('')}
    </ul>
  `;

  if (lyrics.prev || lyrics.next) {
    more.innerHTML = `
      ${
        lyrics.prev
          ? `<button class="btn" onclick="getMoreSongs('${lyrics.prev}')">Prev</button>`
          : ''
      }
      ${
        lyrics.next
          ? `<button class="btn" onclick="getMoreSongs('${lyrics.next}')">Next</button>`
          : ''
      }
    `;
  } else {
    more.innerHTML = '';
  }
}

function showDataSafe(lyrics) {
  result.innerHTML = '';
  more.innerHTML = '';

  const ul = document.createElement('ul');
  ul.className = 'songs';

  lyrics.data.forEach((song) => {
    const li = document.createElement('li');
    const img = document.createElement('img');

    // Add album cover picture
    img.src = song.album.cover_medium;
    img.alt = song.title;

    li.appendChild(img);   

    const span = document.createElement('span');

    const strong = document.createElement('strong');
    strong.textContent = song.artist.name;

    span.appendChild(strong);
    span.appendChild(document.createTextNode(` - ${song.title}`));
    span.appendChild(document.createTextNode(` • Lyrics`));
    li.appendChild(span);

    // Making functional play button for songs
    const playContainer = document.createElement('div');
    playContainer.className = 'play-container';

    const playBtn = document.createElement('img');
    playBtn.src = 'img/play.webp';
    playBtn.className = 'play-btn';

    playContainer.appendChild(playBtn);
    li.appendChild(playContainer);


    playContainer.addEventListener('click', (e) => {
    e.stopPropagation();

    if (currentAudio && currentBtn === playContainer) {
    currentAudio.pause();
    currentAudio = null;
    currentBtn = null;
    return;
    }
    if (currentAudio) {
    currentAudio.pause();
    }
    const audio = new Audio(song.preview);
    audio.play();

    currentAudio = audio;
    currentBtn = playContainer;
    });

    li.style.cursor = 'pointer';

    li.addEventListener('click', () => {
        getLyricsSafe(song.artist.name, song.title, song.preview);
    });

    ul.appendChild(li);
  });

  result.appendChild(ul);
  console.log('Prev:', lyrics.prev);
  console.log('Next:', lyrics.next);

  if (lyrics.prev || lyrics.next) {
    if (lyrics.prev) {
      const prevButton = document.createElement('button');
      prevButton.className = 'btn';
      prevButton.textContent = 'Prev';
      prevButton.addEventListener('click', () => getMoreSongs(lyrics.prev));
      more.appendChild(prevButton);
    }

    if (lyrics.next) {
      const nextButton = document.createElement('button');
      nextButton.className = 'btn';
      nextButton.textContent = 'Next';
      nextButton.addEventListener('click', () => getMoreSongs(lyrics.next));
      more.appendChild(nextButton);
    }
  }
}
result.addEventListener('click', (e) => {
  const clickedEl = e.target;

  if (clickedEl.tagName === 'BUTTON') {
    const artist = clickedEl.getAttribute('data-artist');
    const songTitle = clickedEl.getAttribute('data-songtitle');

    getLyricsSafe(artist, songTitle);
  }
});


async function getLyricsUnsafe(artist, songTitle) {
  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();

  if (data.error) {
    result.innerHTML = data.error;
  } else {
    const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');

    result.innerHTML = `
            <h2><strong>${artist}</strong> - ${songTitle}</h2>
            <span>${lyrics}</span>
        `;
  }

  more.innerHTML = '';
}

async function getLyricsSafe(artist, songTitle, preview) {
  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();
  searchResults.textContent = '';

  result.innerHTML = '';
  more.innerHTML = '';

  if (data.error) {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = data.error;
    result.append(errorMessage);
    return;
  }

  const heading = document.createElement('h2');
  const strong = document.createElement('strong');
  strong.textContent = artist;

  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back';
  backBtn.className = 'btn back-btn';

  backBtn.addEventListener('click', () => {
    searchSongs(search.value.trim());
  });

  result.append(backBtn);

  heading.append(strong, ` - ${songTitle}`);
  result.append(heading); 

  // Making functional play button for lyrics page
  const playContainer = document.createElement('div');
  playContainer.className = 'play-container lyrics-play-container';

  const playBtn = document.createElement('img');
  playBtn.src = 'img/play.webp';
  playBtn.className = 'play-btn lyrics-play-btn';

  playContainer.appendChild(playBtn);
  result.append(playContainer); 

   playContainer.addEventListener('click', (e) => {
   e.stopPropagation();

   if (!preview) return;

    if (currentAudio && currentBtn === playContainer) {
    currentAudio.pause();
    currentAudio = null;
    currentBtn = null;
    return;
    }
    if (currentAudio) {
    currentAudio.pause();
    }
    const audio = new Audio(preview);
    audio.play();

    currentAudio = audio;
    currentBtn = playContainer;
    });
    

  
  const span = document.createElement('span');
  const lines = data.lyrics.split(/\r\n|\r|\n/);
  span.className = 'lyrics';
  lines.forEach((line, index) => {
    span.append(line);
    if (index < lines.length - 1) {
      span.append(document.createElement('br'));
    }
  });

  result.append(span);
}
