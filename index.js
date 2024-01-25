document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const movieDetails = document.getElementById('movieDetails');
    const moviePoster = document.getElementById('moviePoster');
    const movieTitle = document.getElementById('movieTitle');
    const movieGenres = document.getElementById('movieGenres');
    const movieReleaseDate = document.getElementById('movieReleaseDate');
    const movieOverview = document.getElementById('movieOverview');
    const recommendedMoviesContainer = document.getElementById('recommendedMovies');
    const favouriteMoviesContainer = document.getElementById('favouriteMovies');

    let response;
    let favArray = [];

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MGRhMDI0MDI3OWQwMTQ5Y2JlZjIzNDlhMzBiNWVlYSIsInN1YiI6IjU2Y2ZjYWJiYzNhMzY4MWU0NDAwNTQ4MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.N4fQwyEQMyNvkGSD2SDJBf9K_iHlt0WcZw0yFZktmkw' // Replace with your actual API key
        }
    };

    function fetchMovies(url) {
        fetch(url, options)
            .then(responsem => responsem.json())
            .then(responseData => {
                response = responseData;
                displayMovieDetails(responseData.results[12]);

                // Initialize Splide for Recommended Movies
                const recommendedMoviesSplide = new Splide('#recommendedMovies', {
                    type: 'loop',
                    perPage: 3,
                    gap: '2em',
                    pagination:false,
                    breakpoints: {
                        600: {
                            perPage: 1,
                        },
                    },
                });

                // Get the list container for recommended movies
                const recommendedMoviesList = document.querySelector('#recommendedMovies .splide__list');

                // Populate slides dynamically for recommended movies
                responseData.results.forEach(movie => {
                    const slide = document.createElement('li');
                    slide.className = 'splide__slide';

                    // Add a fav button
                    const button = document.createElement('button');
                    button.innerHTML = '<i class="fa-regular fa-heart"></i>';
                    button.className = 'addToFavouritesButton';

                    // Event listener for Add to Favourites button
                    button.addEventListener('click', function (event) {
                        const isAlreadyAdded = favArray.some(existingMovie => existingMovie.id === movie.id);
                        if (!isAlreadyAdded) {
                            favArray.push(movie);
                            console.log(favArray);
                            localStorage.setItem('favourites', JSON.stringify(favArray));
                        } else {
                            console.log('Movie is already in the favorites.');
                        }

                        favItems();
                    });

                    slide.innerHTML = `
                        <img src="https://image.tmdb.org/t/p/w500${movie.backdrop_path}" alt="${movie.original_title}">
                        <p class="movie-title">${movie.original_title}</p>
                    `;
                    recommendedMoviesList.appendChild(slide);
                    slide.appendChild(button);
                });

                // Mount the Splide slider for recommended movies
                recommendedMoviesSplide.mount();
            })
            .catch(err => console.error(err));
    }

    function displayMovieDetails(movie) {
        moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;
        movieTitle.textContent = movie.original_title;
        movieGenres.textContent = `${movie.genre_ids.join(', ')}`;
        movieReleaseDate.textContent = `Release Date: ${movie.release_date}`;
        movieOverview.textContent = `Overview: ${movie.overview}`;

        // Show the movie details container
        movieDetails.style.display = 'flex';
        const recommended = response.results.filter(m => m.id !== movie.id);
    }

    // Function to get favorites from local storage
    function getFavoritesFromLocalStorage() {
        const favorites = JSON.parse(localStorage.getItem('favourites')) || [];
        return favorites;
    }

    // Initialize Splide for Favorite Movies
    function initializeFavoriteMoviesSplide(favorites) {
        const favoriteMoviesSplide = new Splide('#favouriteMovies', {
            type: 'loop',
            perPage: 3,
            gap: '2em',
            pagination:false,
            breakpoints: {
                600: {
                    perPage: 1,
                },
            },
        });

        // Get the list container for favorite movies
        const favoriteMoviesList = document.querySelector('#favouriteMovies .splide__list');

        // Clear existing slides before appending new ones
        favoriteMoviesList.innerHTML = '';

        // Populate slides dynamically for favorite movies
        favorites.forEach(favorite => {
            const slide = document.createElement('li');
            slide.className = 'splide__slide';
            slide.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${favorite.backdrop_path}" alt="${favorite.original_title}">
                <p class="movie-title">${favorite.original_title}</p>
            `;
            favoriteMoviesList.appendChild(slide);
        });

        // Mount the Splide slider for favorite movies
        favoriteMoviesSplide.mount();
    }

    // Function to refresh favorites
    function favItems() {
        const favoritesFromLocalStorage = getFavoritesFromLocalStorage();
        initializeFavoriteMoviesSplide(favoritesFromLocalStorage);
    }

    // Initial fetch for popular movies
    fetchMovies('https://api.themoviedb.org/3/discover/movie?certification_country=India&include_adult=true&include_video=true&language=en-US&page=1&sort_by=popularity.desc');

    // Event listener for search input
    searchInput.addEventListener('input', function () {
        const searchQuery = searchInput.value.trim();
        if (searchQuery.length > 0) {
            const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${searchQuery}&language=en-US&page=1&include_adult=false`;
            fetchMovies(searchUrl);
        } else {
            // If search input is empty, fetch popular movies
            fetchMovies('https://api.themoviedb.org/3/discover/movie?certification_country=India&include_adult=true&include_video=true&language=en-US&page=1&sort_by=popularity.desc');
        }
    });
});
