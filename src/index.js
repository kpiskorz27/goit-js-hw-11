import axios from 'axios';
import Notiflix from 'notiflix';

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-form input');
const gallery = document.querySelector('.gallery');
const moreButton = document.querySelector('.load-more');

let currentPage = 1;
let previousValue;
let limit;

moreButton.classList.add('hidden');

form.addEventListener('submit', onSubmit);

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

const handleSearch = async () => {
  moreButton.classList.add('hidden');
  if (input.value === previousValue) {
    currentPage++;
    limit -= 40;
  } else {
    gallery.innerHTML = '';
    currentPage = 1;
    limit = 500;
  }
  await getPictures(currentPage);
  previousValue = input.value;
};

const throttledSearch = debounce(handleSearch, 300);

function onSubmit(event) {
  event.preventDefault();
  throttledSearch();
}

async function getPictures(currentPage) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '22104358-08479b9423ea424bd28360651npm',
        q: input.value,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: 40,
      },
    });

    const pictures = response.data.hits;
    showPictures(pictures);

    if (!limit) {
      limit = response.data.totalHits;
    }
  } catch {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function showPictures(pictures) {
  const fragment = document.createDocumentFragment();
  pictures.forEach(picture => {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');
    const img = document.createElement('img');
    img.src = picture.webformatURL;
    img.alt = picture.tags;
    img.loading = 'lazy';
    const info = document.createElement('div');
    info.classList.add('info');
    const infoItems = ['likes', 'views', 'comments', 'downloads'];
    infoItems.forEach(item => {
      const p = document.createElement('p');
      p.classList.add('info-item');
      p.innerHTML = `<b>${item.charAt(0).toUpperCase() + item.slice(1)}</b>: ${
        picture[item]
      }`;
      info.appendChild(p);
    });
    photoCard.appendChild(img);
    photoCard.appendChild(info);
    fragment.appendChild(photoCard);
  });
  gallery.appendChild(fragment);
  moreButton.classList.remove('hidden');
}

moreButton.addEventListener('click', loadMore);

async function loadMore() {
  try {
    currentPage++;
    await getPictures(currentPage);

    if (limit <= 0) {
      moreButton.classList.add('hidden');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      limit -= 40;
    }
  } catch {
    Notiflix.Notify.failure('Failed to load more photos');
  }
}
