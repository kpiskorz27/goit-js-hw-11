import Notiflix from 'notiflix';
import axios from 'axios';

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-form input');
const gallery = document.querySelector('.gallery');
const moreButton = document.querySelector('.load-more');

let currentPage = 1;
let previousValue;
let limit;

moreButton.classList.add('hidden');

form.addEventListener('submit', onSubmit);

async function onSubmit(event) {
  event.preventDefault();
  moreButton.classList.add('hidden');

  if (input.value === previousValue) {
    currentPage++;
    limit -= 40;
    console.log(limit);
  } else {
    gallery.innerHTML = '';
    currentPage = 1;
    limit = 500;
  }

  await getPictures(currentPage);
  previousValue = input.value;
}

async function getPictures(currentPage) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '22104358-08479b9423ea424bd28360651',
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
  pictures.forEach(picture => {
    const markup = `
      <div class="photo-card">
        <img src="${picture.webformatURL}" alt="${picture.tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes</b>: ${picture.likes}
          </p>
          <p class="info-item">
            <b>Views</b>: ${picture.views}
          </p>
          <p class="info-item">
            <b>Comments</b>: ${picture.comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>: ${picture.downloads}
          </p>
        </div>
      </div>
    `;

    gallery.insertAdjacentHTML('beforeend', markup);
    moreButton.classList.remove('hidden');
  });
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
      console.log(limit);
    }
  } catch {
    Notiflix.Notify.failure('Failed to load more photos');
  }
}
