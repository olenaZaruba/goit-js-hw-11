import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  LoadMoreBtn: document.querySelector('.load-more'),
};

const perPage = 40;
let page = 1;
let keyPhoto = '';

// refs.LoadMoreBtn.classList.add('is-hidden');

refs.searchForm.addEventListener('submit', onSubmitSearch);

async function fetchPhotoAsync(keyPhoto, page, perPage) {
  try {
    const data = await fetchPhoto(keyPhoto, page, perPage);
    return data;
  } catch (error) {
    throw onFetchError();
  }
}

async function onSubmitSearch(event) {
  try {
    event.preventDefault();

    refs.gallery.innerHTML = '';
    page = 1;
    const { searchQuery } = event.currentTarget.elements;
    keyPhoto = searchQuery.value.trim().toLowerCase().split(' ').join('+');

    if (keyPhoto === '') {
      Notify.info('Enter your request, please!', { timeout: 4000 });
      return;
    }

    const data = await fetchPhotoAsync(keyPhoto, page, perPage);
    const searchResults = data.hits;

    if (data.totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        { timeout: 4000 }
      );
    } else {
      Notify.info(`Hooray! We found ${data.totalHits} images.`, {
        timeout: 4000,
      });

      createMarkup(searchResults);
      lightbox.refresh();
    }

    if (data.totalHits > perPage) {
      refs.LoadMoreBtn.classList.remove('is-hidden');
      refs.LoadMoreBtn.addEventListener('click', onClickLoadMore);
    }

    event.target.reset();
  } catch (error) {
    onFetchError();
  }
}

async function onClickLoadMore() {
  try {
    page += 1;
    const data = await fetchPhotoAsync(keyPhoto, page, perPage);
    const searchResults = data.hits;
    const pagesAll = Math.ceil(data.totalHits / perPage);

    createMarkup(searchResults);

    if (page === pagesAll) {
      refs.LoadMoreBtn.classList.add('is-hidden');
      Notify.info(
        "We're sorry, but you've reached the end of search results.",
        { timeout: 4000 }
      );
      refs.LoadMoreBtn.removeEventListener('click', onClickLoadMore);
    }

    lightbox.refresh();
  } catch (error) {
    onFetchError();
  }
}

function onFetchError() {
  Notify.failure(
    'Oops! Something went wrong! Try reloading the page or make another choice!',
    { timeout: 4000 }
  );
  refs.LoadMoreBtn.classList.add('is-hidden');
}
// lightbox

let lightbox = new SimpleLightbox('.img_wrap a', {
  captionsData: 'alt',
  captionDelay: 250,
});

// markup function
function createMarkup(searchResults) {
  const Photos = searchResults.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `<div class="photo-card">
        <div class="img_wrap">
            <a class="gallery_link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" width="300" loading="lazy" />
            </a>
        </div>
        <div class="info">
            <p class="info-item">
            <b>Likes: ${likes}</b>
            </p>
            <p class="info-item">
            <b>Views: ${views}</b>
            </p>
            <p class="info-item">
            <b>Comments: ${comments}</b>
            </p>
            <p class="info-item">
            <b>Downloads: ${downloads}</b>
            </p>
        </div>
        </div>`;
    }
  );
  refs.gallery.insertAdjacentHTML('beforeend', Photos.join(''));
}

//  api

const URL = 'https://pixabay.com/api/';
const KEY = '39361598-89a46712d73638954aca158ac';

async function fetchPhoto(q, page, perPage) {
  const url = `${URL}?key=${KEY}&q=${q}&page=${page}&per_page=${perPage}&image_type=photo&orientation=horizontal&safesearch=true`;
  const response = await axios.get(url);
  return response.data;
}
// loading
// function showLoadMorePage() {
//   if (checkIfEndOfPage()) {
//     onClickLoadMore();
//   }
// }

// function checkIfEndOfPage() {
//   return (
//     window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
//   );
// }
