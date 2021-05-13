"use strict";


// =========== Movie SPA functionality =========== //

let _movies = [];
let _getcategories = [];

// fetch all movies from WP
async function getMovies() {
  let response = await fetch("https://movie-api.cederdorff.com/wp-json/wp/v2/posts");
  let data = await response.json();
  console.log(data);
  _movies = data;
  appendMovies(data);
  showLoader(false);
}

getMovies();

// append movies to the DOM using a for-of loop
function appendMovies(movies) {
  let htmlTemplate = "";
  for (let movie of movies) {
    htmlTemplate += /*html*/ `
      <article>
        <h2>${movie.title.rendered} (${movie.acf.year})</h2>
        <img src="${movie.acf.img}">
        <p>${movie.acf.description}</p>
      </article>
    `;
  }
  document.querySelector('#movies-container').innerHTML = htmlTemplate;
}

// search functionality
function search(value) {
  let searchQuery = value.toLowerCase();
  let filteredMovies = [];
  for (let movie of _movies) {
    let title = movie.title.rendered.toLowerCase();
    if (title.includes(searchQuery)) {
      filteredMovies.push(movie);
    }
  }
  appendMovies(filteredMovies);
}

// fetch all genres / categories from WP
async function getCategories() {
  let response = await fetch("https://movie-api.cederdorff.com/wp-json/wp/v2/categories");
  let data = await response.json();
  console.log(data);
  _getcategories = data
  appendCategories(data);
}

getCategories();

// append all genres as select options (dropdown)
function appendCategories(categories) {
  let htmlTemplate = "";
  for (let category of categories) {
    htmlTemplate += /*html*/ `
      <option value="${category.id}">${category.name}</option>
    `;
  }
  document.querySelector('#select-category').innerHTML += htmlTemplate;
}

// category selected event - fetch movies by selected category
async function categorySelected(categoryId) {
  document.querySelector('#movies-container').innerHTML ="";
  if (categoryId) {
    showLoader(true);
    let response = await fetch(`https://movie-api.cederdorff.com/wp-json/wp/v2/posts?_embed&categories=${categoryId}`)
    let data = await response.json();
    appendMoviesByCategory(data);
    showLoader(false);
  } else {
    document.querySelector('#movies-by-category-container').innerHTML ="";
    appendMovies(_movies);
  }
}

// append movies by genre
function appendMoviesByCategory(moviesByCategory) {
  let htmlTemplate = "";
  for (let movie of moviesByCategory) {
    htmlTemplate += /*html*/ `
      <article>
        <h2>${movie.title.rendered} (${movie.acf.year})</h2>
        <img src="${movie.acf.img}">
        <p>${movie.acf.description}</p>
      </article>
    `;
  }
  // if no movies, display feedback to the user
  if (moviesByCategory.length === 0) {
    htmlTemplate = /*html*/ `
      <p>No Movies </p>
    `;
  }
  document.querySelector('#movies-by-category-container').innerHTML = htmlTemplate;
}

/**
 * Adding a new movie to the Array of movies

 function addNewMovie() {
  let titleInput = document.getElementById("title");
  let yearInput = document.getElementById("year");
  let descriptionInput = document.getElementById("description");
  let imgInput = document.getElementById("img");

  let newMovie = {
    title: titleInput.value,
    year: yearInput.value,
    description: descriptionInput.value,
    img: imgInput.value
  }

  _movies.push(newMovie);
  appendMovies(_movies);


  //reset 
titleInput.value = "";
  navigateTo("movies");


}
 */

// =========== Loader functionality =========== //

function showLoader(show = true) {
  let loader = document.querySelector('#loader');
  if (show) {
    loader.classList.remove("hide");
  } else {
    loader.classList.add("hide");
  }
}