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
  console.log('hej');
  document.querySelector('#mail').value = _currentUser.email;
  document.querySelector('#imagePreview').src = _currentUser.img;
}

// update user data - auth user and database object
function updateUser() {
  let user = firebase.auth().currentUser;

  // update auth user
  user.updateProfile({
    name: document.querySelector('#name').value
  });

  // update database user
  _userRef.doc(_currentUser.uid).set({
    img: document.querySelector('#imagePreview').src
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

// ========== MOVIE FUNCTIONALITY ========== //

  // init all movies
  function init(){
    _userRef.doc(_currentUser.uid).onSnapshot({
      includeMetadataChanges: true
    }, function (userData) {
      if (!userData.metadata.hasPendingWrites && userData.data()) {
        _currentUser = {
          ...firebase.auth().currentUser,
          ...userData.data()
        }; //concating two objects: authUser object and userData objec from the db
        //appendFavMovies(_currentUser.favMovies);
        if (_movies) {
          appendMovies(_movies); // refresh movies when user data changes
        }
        showLoader(false);
      }
    });


  _movieRef.orderBy("year").onSnapshot(snapshotData => {
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



// category selected event
function categorySelected(categoryId) {
  let htmlTemplate = "";

  for (let moviecategory of _movies) {
    if(moviecategory.category == categoryId){
      document.querySelector('#movies-container').innerHTML ="";
      showLoader(true);
      htmlTemplate += /*html*/ `
      <article>
        <h2>${moviecategory.title} (${moviecategory.year})</h2>
        <img src="${moviecategory.img}">
        <p>${moviecategory.description}</p>
      </article>
    `;
      showLoader(false);
      
    } else {
      document.querySelector('#movies-by-category-container').innerHTML ="";
    appendMovies(_movies);
    }
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
