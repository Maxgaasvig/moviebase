"use strict";


// =========== Movie SPA functionality =========== //

const _movieRef = _db.collection("movies");
let _movies;


  // init all movies
  function init(){
  _movieRef.orderBy("year").onSnapshot(snapshotData => {
    _movies = [];
    snapshotData.forEach(doc => {
      let movie = doc.data();
      movie.id = doc.id;
      _movies.push(movie);
    });
    showLoader(false);
    console.log(_movies);
    appendMovies(_movies);
      });
}
init();

// append movies to the DOM using a for-of loop
function appendMovies(movies) {
  let htmlTemplate = "";
  for (let movie of movies) {
    htmlTemplate += /*html*/ `
      <article class="card">
        <h2>${movie.title} (${movie.year})</h2>
        <img src="${movie.img}">
        <p>${movie.description}</p>
      </article>
    `;
  }
  document.querySelector('#movies-container').innerHTML = htmlTemplate;
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
