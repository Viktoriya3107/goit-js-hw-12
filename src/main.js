import 'simplelightbox/dist/simple-lightbox.min.css';
import 'izitoast/dist/css/iziToast.min.css';
import iziToast from 'izitoast';

import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

const form = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalHits = 0;
const PER_PAGE = 15;

form.addEventListener('submit', async event => {
  event.preventDefault();

  query = event.target.elements.search.value.trim();
  if (!query) return;

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        message: 'Sorry, no images found.',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    if (page * PER_PAGE < totalHits) {
      showLoadMoreButton();
    }

    form.reset();
  } catch (error) {
    iziToast.error({
      message: 'Something went wrong',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);

    if (page * PER_PAGE >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

    const card = document.querySelector('.gallery-item');

    if (card) {
      const height = card.getBoundingClientRect().height;

      window.scrollBy({
        top: height * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    iziToast.error({
      message: 'Error loading images',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});