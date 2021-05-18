"use strict";


// =========== Movie SPA functionality =========== //

const _movieRef = _db.collection("movies");
const _userRef = _db.collection("users")
let _currentUser;
let _movies;
let _categories = [];

// ========== FIREBASE AUTH ========== //
// Listen on authentication state change
firebase.auth().onAuthStateChanged(function (user) {
  if (user) { // if user exists and is authenticated
    userAuthenticated(user);
  } else { // if user is not logged in
    userNotAuthenticated();
  }
});

function userAuthenticated(user) {
  _currentUser = user;
  hideTabbar(false);
  init();
  showLoader(false);
}

function userNotAuthenticated() {
  _currentUser = null; // reset _currentUser
  hideTabbar(true);
  showPage("login");

  // Firebase UI configuration
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    signInSuccessUrl: '#movies'
  };
  // Init Firebase UI Authentication
  const ui = new firebaseui.auth.AuthUI(firebase.auth());
  ui.start('#firebaseui-auth-container', uiConfig);
  showLoader(false);
}

// show and hide tabbar
function hideTabbar(hide) {
  let tabbar = document.querySelector('#tabbar');
  if (hide) {
    tabbar.classList.add("hide");
  } else {
    tabbar.classList.remove("hide");
  }
}

// sign out user
function logout() {
  firebase.auth().signOut();
  // reset input fields
  document.querySelector('#name').value = "";
  document.querySelector('#mail').value = "";
  document.querySelector('#birthdate').value = "";
  document.querySelector('#imagePreview').src = "";
}


// ========== PROFILE PAGE FUNCTIONALITY ========== //
// append user data to profile page
function appendUserData() {
  document.querySelector('#name').value = _currentUser.displayName;
  document.querySelector('#mail').value = _currentUser.email;
  document.querySelector('#birthdate').value = _currentUser.birthdate;
  document.querySelector('#hairColor').value = _currentUser.hairColor;
  document.querySelector('#imagePreview').src = _currentUser.img;
}

// update user data - auth user and database object
function updateUser() {
  let user = firebase.auth().currentUser;

  // update auth user
  user.updateProfile({
    displayName: document.querySelector('#name').value
  });

  // update database user
  _userRef.doc(_currentUser.uid).set({
    img: document.querySelector('#imagePreview').src,
    birthdate: document.querySelector('#birthdate').value,
    hairColor: document.querySelector('#hairColor').value
  }, {
    merge: true
  });
}

// ========== Prieview image function ========== //
function previewImage(file, previewId) {
  if (file) {
    let reader = new FileReader();
    reader.onload = function (event) {
      document.querySelector('#' + previewId).setAttribute('src', event.target.result);
    };
    reader.readAsDataURL(file);
  }
}
  // init all movies
  function initMovies(){
  _movieRef.orderBy("title").onSnapshot(snapshotData => {
    _movies = [];
    snapshotData.forEach(doc => {
      let movie = doc.data();
      movie.id = doc.id;
      _movies.push(movie);
    });
    showLoader(false);
    appendMovies(_movies);
      });
}

 // init all categories
 function initCategories(){
  _movieRef.orderBy("category").onSnapshot(snapshotData => {
    snapshotData.forEach(doc => {
      let category = doc.data();
      category.id = doc.id;
      _categories.push(category);
    });
    showLoader(false);
    console.log(_categories);
    appendCategories(_categories);
      });
}
initMovies();
initCategories();

console.log(_categories);

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

// search functionality
function search(value) {
  let searchQuery = value.toLowerCase();
  let filteredMovies = [];
  for (let movie of _movies) {
    let title = movie.title.toLowerCase();
    if (title.includes(searchQuery)) {
      filteredMovies.push(movie);
    }
  }
  appendMovies(filteredMovies);
}



// category selected event - fetch movies by selected category
function categorySelected(categoryId) {
  document.querySelector('#movies-container').innerHTML ="";

  for (let moviecategory of _movies) {
    if(moviecategory.category == categoryId){
      showLoader(true);
      appendMoviesByCategory(data);
      showLoader(false);
    } else {
      document.querySelector('#movies-by-category-container').innerHTML ="";
      appendMovies(_movies);
    }
  }
}

function appendMoviesByCategory(moviesByCategory) {
  let htmlTemplate = "";
  for (let movie of moviesByCategory) {
    htmlTemplate += /*html*/ `
      <article>
        <h2>${movie.title} (${movie.year})</h2>
        <img src="${movie.img}">
        <p>${movie.description}</p>
      </article>
    `;
  }
  // if no movies, display feedback to the user
  if (moviesByCategory.length === 0) {
    htmlTemplate = /*html*/ `
      <p> </p>
    `;
  }
  document.querySelector('#movies-by-category-container').innerHTML = htmlTemplate;
}






 // Adding a new movie to the Array of movies
// creates a new movie object and adds to firestore collection
function addNewMovie() {
  let inputTitle = document.getElementById("title");
  let inputYear = document.getElementById("year");
  let inputImageUrl = document.getElementById("imageUrl");
  let inputDescription = document.getElementById("description");

  let newMovie = {
    title: inputTitle.value,
    year: inputYear.value,
    img: inputImageUrl.value,
    description: inputDescription.value
  }
  // add to movie ref
  _movieRef.add(newMovie);
  //navigate to home
  navigateTo("movies");
  // reset input values
  inputTitle.value = "";
  inputYear.value = "";
  img: inputImageUrl.value = "";
  inputDescription.value = "";
}


// =========== Loader functionality =========== //

function showLoader(show = true) {
  let loader = document.querySelector('#loader');
  if (show) {
    loader.classList.remove("hide");
  } else {
    loader.classList.add("hide");
  }
}
