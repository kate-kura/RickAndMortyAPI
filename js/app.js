const API_URL_GET_ALL = "https://rickandmortyapi.com/api/character";
const API_URL_SEARCH_NAME_CHARACTER =
  "https://rickandmortyapi.com/api/character/?name=";
const API_URL_SINGLE_CHARACTER = "https://rickandmortyapi.com/api/character/";

let currentPage = 1;

// get list of info about all characters
async function getAllCharacters(url, page = 1, charactersPerPage = 20) {
  const response = await fetch(
    `${url}?page=${page}&results=${charactersPerPage}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const responseData = await response.json();
  showCharacters(responseData);
}

// get list if info about searching characters
async function searchByName(url, name, page = 1) {
  const response = await fetch(`${url}${name}&page=${page}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    console.error("Ошибка при поиске:", response.statusText);
    return;
  }
  const responseData = await response.json();
  showCharacters(responseData);
}

// show characters cards
function showCharacters(data) {
  const charactersDeatails = document.querySelector(".cards-flex-wrapper");

  // clear previous cards
  charactersDeatails.innerHTML = "";

  data.results.forEach((character) => {
    const characterDeatails = document.createElement("div");
    characterDeatails.classList.add("card");
    characterDeatails.innerHTML = `
      <div class="card-info">
        <h3 class="card-title">${character.name}</h3>
        <div class="card-img-wrapper">
          <img
            class="card-img"
            src="${character.image}"
            alt="${character.name}"
          />
        </div>
        <div class="card-details">
          <div class="card-detail">
            <span class="card-label">Specie:</span>
            <span class="card-value">${character.species}</span>
          </div>
          <div class="card-detail">
            <span class="card-label">State:</span>
            <span class="card-value">${character.status}</span>
          </div>
          <div class="card-detail">
            <span class="card-label">Location:</span>
            <span class="card-value">${character.location.name}</span>
          </div>
        </div>
      </div>
    `;
    characterDeatails.addEventListener("click", () => openModal(character.id));
    charactersDeatails.appendChild(characterDeatails);
  });

  // show/hide pagination
  if (data.info.pages > 1) {
    displayPagination(data.info.pages);
  } else {
    hidePagination();
  }
}

// show list of pages
function displayPagination(pagesCount) {
  const paginationEl = document.querySelector(".pagination");
  paginationEl.innerHTML = ""; // clear previous pagination

  const ulEl = document.createElement("ul");
  ulEl.classList.add("pagination__list");

  for (let i = 1; i <= pagesCount; i++) {
    const liEl = displayPaginationBtn(i);
    ulEl.appendChild(liEl);
  }

  paginationEl.appendChild(ulEl);
  paginationEl.style.display = "flex";
}

// create buttons of list of pages
function displayPaginationBtn(page) {
  const liEl = document.createElement("li");
  liEl.classList.add("pagination__item");
  liEl.innerText = page;

  if (currentPage === page) liEl.classList.add("pagination__item--active");

  liEl.addEventListener("click", () => {
    currentPage = page;
    getAllCharacters(API_URL_GET_ALL, currentPage); // update data

    let currentItemLi = document.querySelector("li.pagination__item--active");
    if (currentItemLi) {
      currentItemLi.classList.remove("pagination__item--active");
    }
    liEl.classList.add("pagination__item--active");
    scrollToTop();
  });

  return liEl;
}

// hide list of pages
function hidePagination() {
  const paginationEl = document.querySelector(".pagination");
  paginationEl.style.display = "none";
}

// scroll to top of page
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// show modal window with character info
const modal = document.querySelector(".modal");
async function openModal(id) {
  const response = await fetch(API_URL_SINGLE_CHARACTER + id, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  modal.classList.add("modal-show");
  document.body.classList.add("stop-scrolling");

  modal.innerHTML = `
      <div class="modal-card">
        <img class="modal-card-img" src="${data.image}" alt="">
        <h2>
        <br><span>${data.name}</span>
        </h2>
        <ul class="modal-card-info">
          <li>State - ${data.status}</li>
          <li>Species - ${data.species}</li>
          <li>Type - ${data.type}</li>
          <li>Gender - ${data.gender}</li>
          <li>Location - ${data.location.name}</li>
          <li >URL - <a class="modal-card-site" href="${data.url}">${data.url}</a></li>
          <li>Created - ${data.created}</li>
        </ul>
        <button type="button" class="modal-button-close">Close</button>
      </div>
    `;
  const btnClose = document.querySelector(".modal-button-close");
  btnClose.addEventListener("click", () => closeModal());
}

// close modal window
function closeModal() {
  modal.classList.remove("modal-show");
  document.body.classList.remove("stop-scrolling");
}

// main function
function main() {
  getAllCharacters(API_URL_GET_ALL);

  // making search by name
  const form = document.querySelector("form");
  const search = document.querySelector(".header-search");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (search.value) {
      searchByName(API_URL_SEARCH_NAME_CHARACTER, search.value);
    } else {
      getAllCharacters(API_URL_GET_ALL);
    }

    currentPage = 1;
  });

  // updating pagination due to search results
  document.querySelector(".pagination").addEventListener("click", (e) => {
    if (e.target.classList.contains("pagination__item")) {
      currentPage = parseInt(e.target.innerText); // Устанавливаем текущую страницу
      const searchValue = search.value.trim();
      searchByName(API_URL_SEARCH_NAME_CHARACTER, searchValue, currentPage);
      scrollToTop();
    }
  });

  // modal window close with click
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

main();
