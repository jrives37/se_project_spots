import "./index.css";
import {
  enableValidation,
  config,
  hasInvalidInput,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers";

const profileAvatar = document.querySelector(".profile__avatar");

const profileName = document.querySelector(".profile__name");

const profileDescription = document.querySelector(".profile__description");

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "4885bcd4-558c-4af1-a586-3edc422af175",
    "Content-Type": "application/json",
  },
});
const editProfileBtn = document.querySelector(".profile__edit-btn");
const addCardBtn = document.querySelector(".profile__add-btn");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteCancelBtn = deleteModal.querySelector(".modal__cancel-btn");

deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editFormEl = editProfileModal.querySelector(".modal__form");
const nameInputEl = editProfileModal.querySelector("#profile-name-input");
const descriptionInputEl = editProfileModal.querySelector(
  "#profile-description-input",
);

const addCardModal = document.querySelector("#new-post-modal");
const addCardCloseBtn = addCardModal.querySelector(".modal__close-btn");
addCardCloseBtn.addEventListener("click", () => closeModal(addCardModal));
const addCardFormEl = addCardModal.querySelector(".modal__form");
const captionInputEl = addCardFormEl.querySelector(
  "#caption-description-input",
);
const linkInputEl = addCardFormEl.querySelector("#card-image-input");
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__avatar-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));
const previewImageEl = previewModal.querySelector(".modal__image");
const previewNameEl = previewModal.querySelector(".modal__caption");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;
let currentUserId;

api
  .getAppInfo()
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.src = userData.avatar;

    cards.forEach((item) => {
      const cardElement = getCardElement(item, currentUserId);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true, "Deleting...", "Delete");
  api

    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Deleting...", "Delete");
    });
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleLike(evt, id) {
  const likeButton = evt.target;

  const isLiked = likeButton.classList.contains("card__like-btn-active");

  const request = isLiked ? api.unlikeCard(id) : api.likeCard(id);

  request
    .then(() => {
      likeButton.classList.toggle("card__like-btn-active");
    })
    .catch(console.error);
}

function handlePreview(data) {
  previewImageEl.src = data.link;
  previewImageEl.alt = data.name;
  previewNameEl.textContent = data.name;

  openModal(previewModal);
}

function getCardElement(data, userId) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const likeButton = cardElement.querySelector(".card__like-btn");
  const deleteButton = cardElement.querySelector(".card__delete-btn");

  if (data.isLiked) {
    likeButton.classList.add("card__like-btn-active");
  }

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;
  cardImageEl.addEventListener("click", () => {
    handlePreview(data);
  });

  likeButton.addEventListener("click", (evt) => handleLike(evt, data._id));

  deleteButton.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id),
  );

  return cardElement;
}
function handleOverlayClick(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");

  document.addEventListener("keydown", handleEscape);
  modal.addEventListener("mousedown", handleOverlayClick);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");

  document.removeEventListener("keydown", handleEscape);
  modal.removeEventListener("mousedown", handleOverlayClick);
}
editProfileBtn.addEventListener("click", function () {
  nameInputEl.value = profileNameEl.textContent;
  descriptionInputEl.value = profileDescriptionEl.textContent;
  resetValidation(editFormEl, config);
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", () => {
  closeModal(editProfileModal);
});

addCardBtn.addEventListener("click", function () {
  openModal(addCardModal);
});

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openModalEl = document.querySelector(".modal_is-opened");
    if (openModalEl) {
      closeModal(openModalEl);
    }
  }
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Saving...", "Save");
  api
    .editUserInfo({
      name: nameInputEl.value,
      about: descriptionInputEl.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false);
    });
}
editFormEl.addEventListener("submit", handleEditProfileSubmit);
addCardFormEl.addEventListener("submit", function (evt) {
  evt.preventDefault();

  const inputList = Array.from(addCardFormEl.querySelectorAll(".modal__input"));

  const isInvalid = hasInvalidInput(inputList);

  if (isInvalid) return;

  const submitButton = evt.submitter;

  setButtonText(submitButton, true, "Saving...", "Save");

  api
    .createCard({
      name: captionInputEl.value,
      link: linkInputEl.value,
    })
    .then((cardData) => {
      const cardElement = getCardElement(cardData, userId);
      cardsList.prepend(cardElement);

      closeModal(addCardModal);
      addCardFormEl.reset();

      disableButton(submitButton, config);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitButton, false, "Saving...", "Save");
    });
});

deleteForm.addEventListener("submit", handleDeleteSubmit);

enableValidation(config);
