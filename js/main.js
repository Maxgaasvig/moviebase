"use strict";


// =========== Movie SPA functionality =========== //

// Creates 2 variables _movieRef, _userRed. Uses _db variable from firebase-config.js to fetch movies and user information/collection
const _movieRef = _db.collection("movies");
const _userRef = _db.collection("users")

//Creates global variables  

let _thisUser;
let _movies;
let _categories = [];



// ========== Firebase Authentication ========== //

// Listen on authentication state change
firebase.auth().onAuthStateChanged(function (user) {
  // Checks if user exists and is authenticated
  if (user) { 
    // If user eixsts and is authenticated, runs the function "userAuthenticated()"
    userAuthenticated(user);
  } else { 
    // if user is not logged in, runs the function "userNotAuthenticated()"
    userNotAuthenticated();
  }
});

// Takes the parameter user, and sets user as the global variable _thisUser and calls additional functions
function userAuthenticated(user) {
  _thisUser = user;
  hideLowbar(false);
  init();
  showLoader(false);
}

// Changes the global variable _thisUser to null, hides lowbar and shows the login page
function userNotAuthenticated() {
  _thisUser = null;
  hideLowbar(true);
  showPage("login");

  // Firebase UI configuration
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    signInSuccessUrl: '#movies'
  };
  // Starts Firebase UI Authentication
  const ui = new firebaseui.auth.AuthUI(firebase.auth());
  ui.start('#firebaseui-auth-container', uiConfig);
  showLoader(false);
}

// Show or hides the lowbar
function hideLowbar(hide) {
  let lowbar = document.querySelector('#lowbar');
  if (hide) {
    lowbar.classList.add("hide");
  } else {
    lowbar.classList.remove("hide");
  }
}

// Log out the user and resets the input fields 
function logout() {
  firebase.auth().signOut();
  document.querySelector('#name').value = "";
  document.querySelector('#mail').value = "";
  document.querySelector('#imagePreview').src = "";
}


// ========== Profile Functionality ========== //


// Changes the inputs on the profile page to the data collected from _thisUser's object data such as name, email and image.
function getUserData() {
  document.querySelector('#name').value = _thisUser.displayName;
  document.querySelector('#mail').value = _thisUser.email;
  document.querySelector('#imagePreview').src = _thisUser.img; 
  console.log("Current name" + ": " +document.querySelector('#name').value);
}

// Sets the currentuser as user and updates the user's data.
function updateUser() {
  let user = firebase.auth().currentUser;

  // Update user name 
  user.updateProfile({
    displayName: document.querySelector('#name').value
  });

  // Update user image
  _userRef.doc(_thisUser.uid).set({
    img: document.querySelector('#imagePreview').src
  }, {
    merge: true
  });
  console.log("Updated name" + ": " + document.querySelector('#name').value);
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
    _userRef.doc(_thisUser.uid).onSnapshot({
      includeMetadataChanges: true
    }, function (userData) {
      if (!userData.metadata.hasPendingWrites && userData.data()) {
        _thisUser = {
          ...firebase.auth().currentUser,
          ...userData.data()
        }; //concating two objects: authUser object and userData object from the db
        appendWatchlistMovies(_thisUser.favMovies);
        if (_movies) {
          // Calls the appendMovies to refresh the movies when user data changes
          appendMovies(_movies);
        }
        showLoader(false);
      }
    });

// order movies by year and append to the global arraylist
  _movieRef.orderBy("year").onSnapshot(moviesData => {
    _movies = [];
    moviesData.forEach(doc => {
      let movie = doc.data();
      movie.id = doc.id;
      _movies.push(movie);
    });
    showLoader(false);
    appendMovies(_movies);
      });
}


// append movies to the DOM using a for-of loop.
// Has 1 parameter
function appendMovies(movies) {
  // creates a html template and sets its value to "";
  let htmlTemplate = "";
  // Runs a for-of loop, with an variable "movie" and runs through "movies" which is the parameter needed in the function
  for (let movie of movies) {
    // Adds the following to the current html template with the use of "+=".
    // Creates a article tag and gives it the class "card". Adds additional tags and sets the value of those to the current object's value with the ${}
    htmlTemplate += /*html*/ `
      <article class="card">
        <h2>${movie.title} (${movie.year})</h2>
        <img src="${movie.img}">
        ${createWatchlistButton(movie.id)}
        <button class="btnViewMovie" onclick="viewMovieDetails('${movie.id}')">View details</button>
      </article> 
    `;
  }
  // Changes #movie-container's innerHTML to htmlTemplate.
  document.querySelector('#movies-container').innerHTML = htmlTemplate;
}

// Gets a movies details for our view page
function viewMovieDetails(id) {
  // Creates variable movie
  // Uses the method .find() on _movies array. Sets movie to the parameter id, if found.
  let movie = _movies.find(movie => movie.id === id);

  // Create variables and set them to references of the input fields 
  let titleInput = document.querySelector('#viewTitle');
  let descInput = document.querySelector('#viewDesc');
  let imageInput = document.querySelector('#viewImage');

  // Changes the input fields' innerHTML to the movie's object values.
  // such as title field = movie title.
  imageInput.src = movie.img;
  titleInput.innerHTML = movie.title;
  descInput.innerHTML = movie.description;
  // Uses the navigateTo function
  navigateTo("view");
}

// Used to reset homepage.
function gotoMovies(){
  document.querySelector('#movies-container').innerHTML ="";
  document.querySelector('#movies-by-category-container').innerHTML = "";
  document.querySelector('#select-category').selectedIndex = "0"
  document.querySelector('#searchbar').value = "";
  init();
}

// Creates a watchlist Button
function createWatchlistButton(movieId) {
  let btnTemplate = /*html*/ `
    <button onclick="addToWatchlist('${movieId}')">Add to watchlist</button>`;
    // Checks if _thisUser's favmovies includes the movieId. If so it creates a remove button instead.
  if (_thisUser.favMovies && _thisUser.favMovies.includes(movieId)) {
    btnTemplate = /*html*/ `
      <button onclick="removeFromWatchlist('${movieId}')" class="btnRemove">Remove from watchlist</button>`;
  }
  return btnTemplate;
}


// append watchlist movies to the DOM with an arraylist as parameter.
async function appendWatchlistMovies(favMovieIds = []) {
  let htmlTemplate = "";
  //If the length of the array is 0, then it creates a new article tag with a p tag says Please, add movies to watchlist.
  if (favMovieIds.length === 0) {
    htmlTemplate += /*html*/ `
    <article>
      <p>Please, add movies to watchlist.</p>
    </article>
  `;
  } else {
    // Runs through the arraylist and adds the movies to fav-movie-container
    for (let movieId of favMovieIds) {
      await _movieRef.doc(movieId).get().then(function (doc) {
        let movie = doc.data();
        movie.id = doc.id;
        htmlTemplate += /*html*/ `
        <article class="card">
          <h2>${movie.title} (${movie.year})</h2>
          <img src="${movie.img}">
          <button onclick="removeFromWatchlist('${movie.id}')" class="rm">Remove from watchlist</button>
          <button class="btnViewMovie" onclick="viewMovieDetails('${movie.id}')">View details</button>
        </article>
      `;
      });
    }
  }
  document.querySelector('#fav-movie-container').innerHTML = htmlTemplate;
}

// adds a given movieId to the watchlist Movies array inside _thisUser
function addToWatchlist(movieId) {
  showLoader(true);
  _userRef.doc(_thisUser.uid).set({
    favMovies: firebase.firestore.FieldValue.arrayUnion(movieId)
  }, {
    merge: true
  });
  // Resetting dropdown menus,search bar and container after adding a movie.
  document.querySelector('#select-category').selectedIndex = "0"
  document.querySelector('#movies-by-category-container').innerHTML = "";
  document.querySelector('#searchbar').value = "";
}

// removes a given movieId to the watchlist movies array inside _thisUser
function removeFromWatchlist(movieId) {
  showLoader(true);
  _userRef.doc(_thisUser.uid).update({
    favMovies: firebase.firestore.FieldValue.arrayRemove(movieId)
  });
 // Resetting dropdown menus,search bar and container after removing a movie.
document.querySelector('#select-category').selectedIndex = "0"
document.querySelector('#movies-by-category-container').innerHTML = "";
document.querySelector('#searchbar').value = "";
}

// Search Functionality with an value parameter
function search(value) {
  // Sets searchQuery to the parameter's value but lowercase.
  let searchQuery = value.toLowerCase();
  // Creates a new arraylist
  let filteredMovies = [];
  for (let movie of _movies) {
    // Creates variable title, and sets the variable to the movie's title, but with lowercase
    let title = movie.title.toLowerCase();
    // If statement checks if the variable title includes the searchQuery variable.
    if (title.includes(searchQuery)) {
      // If so, it means the searched movie title is in our _movie arraylist and adds it to the filteredMovies arraylist.
      filteredMovies.push(movie);
    }
  }
  // Uses the appendMovies function with our filteredMovies as its parameter to show the movies inside of the array.
  appendMovies(filteredMovies);
  document.querySelector('#movies-by-category-container').innerHTML = "";

}

// This function sorts an array with the sortValue.
function sort(sortValue){
  // Creats an arraylist
  let sortMovies = [];
  // for-of loop, running through all movies in _movies and adds them to sortMovies.
  for (let movie of _movies) {
    sortMovies.push(movie);
  }


  if(sortValue.includes('notSorted')){
    console.log("The List aint sorted");
    appendMovies(_movies);
  }
 
 if(sortValue.includes('sortByTitles')){
   console.log("Sorted by Titles");
  sortMovies.sort((a, b) => {
    let fa = a.title.toLowerCase(),
        fb = b.title.toLowerCase();

    if (fa < fb) {
        return -1;
    }
    if (fa > fb) {
        return 1;
    }
    return 0;
});
    appendMovies(sortMovies);
 }

 if(sortValue.includes("sortByYear")){
    console.log("Sorted by Year");
    sortMovies.sort(function(a, b){return b.year-a.year});
    appendMovies(sortMovies);
  } 
}
// function that uses a parameter categoryId
function categorySelected(categoryId){
  showLoader(true);
  // Checks if there is an value as parameter.
  if(categoryId){
    // Creates a new arraylist 
    let moviesByCategory = [];
    // For-of loop of _movies
    for (let movie of _movies) {
      // if a movie's category is included in the categoryId then adds it to the arraylist
      if(movie.category.includes(categoryId)){
        moviesByCategory.push(movie);
      }
    }
    // Uses the appendMovies function with the created arraylist moviesByCategory
    appendMovies(moviesByCategory);
  } else{
    // If not then just appendmovies with the global _movie arraylist.
    appendMovies(_movies);
  }
  showLoader(false);
}

// Changes the first letter of a string to uppercase.
function categoryFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

 // Adding a new movie to the Array of movies 
function addNewMovie() {
  let inputTitle = document.getElementById("title");
  let inputYear = document.getElementById("year");
  let inputCategori = document.getElementById("genre");
  let inputImageUrl = document.getElementById("imageUrl");
  let inputDescription = document.getElementById("description");

  // Uses the categoryFirstLetter to make sure the first letter in inputCategori is upper case.
  categoryFirstLetter(inputCategori.value)

  // Creates a new movie object 
  let newMovie = {
    title: inputTitle.value,
    year: inputYear.value,
    category: inputCategori.value,
    img: inputImageUrl.value,
    description: inputDescription.value
  }
  // add to _movieRef firestore collection
  _movieRef.add(newMovie);
  //navigate to home
  navigateTo("movies");
  // reset input values
  inputTitle.value = "";
  inputYear.value = "";
  inputCategori ="";
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




