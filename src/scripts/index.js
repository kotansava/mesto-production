import { createCardElement, updateLikeStatus, removeCardElement } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setAvatar,
  addCard,
  deleteCardApi,
  changeLikeCardStatus,
} from "./components/api.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

// Дополнительное задание: попап подтверждения удаления
const confirmDeleteModalWindow = document.querySelector(".popup_type_remove-card");
const confirmDeleteForm = confirmDeleteModalWindow.querySelector(".popup__form");

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

let currentUserId = null;
let cardToDelete = null; // Хранилище для удаляемой в данный момент карточки

const renderLoading = (isLoading, button, buttonText = "Сохранить", loadingText = "Сохранение...") => {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = buttonText;
  }
};

const createCard = (cardData) => {
  return createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeIcon,
    onDeleteCard: handleDeleteCard,
  });
};

// --- Обработчики API для карточек ---
const handleLikeIcon = (likeButton, cardId, likeCountElement, isLiked) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      // Вызываем метод обновления разметки из модуля карточки
      updateLikeStatus(likeButton, likeCountElement, updatedCard.likes);
    })
    .catch((err) => console.log(err));
};

const handleDeleteCard = (cardElement, cardId) => {
  // Запоминаем карточку и открываем окно подтверждения
  cardToDelete = { element: cardElement, id: cardId };
  openModalWindow(confirmDeleteModalWindow);
};

const handleConfirmDeleteSubmit = (evt) => {
  evt.preventDefault();
  if (!cardToDelete) return;

  const submitButton = evt.target.querySelector(validationSettings.submitButtonSelector);
  const initialText = submitButton.textContent;
  
  renderLoading(true, submitButton, initialText, "Удаление...");

  deleteCardApi(cardToDelete.id)
    .then(() => {
      // Вызываем метод удаления разметки из модуля карточки
      removeCardElement(cardToDelete.element);
      closeModalWindow(confirmDeleteModalWindow);
      cardToDelete = null;
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// --- Обработчики сабмитов форм ---
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(validationSettings.submitButtonSelector); 
  const initialText = submitButton.textContent;
  
  renderLoading(true, submitButton, initialText);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(validationSettings.submitButtonSelector);
  const initialText = submitButton.textContent;
  
  renderLoading(true, submitButton, initialText);

  setAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector(validationSettings.submitButtonSelector);
  const initialText = submitButton.textContent;
  
  renderLoading(true, submitButton, initialText, "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(createCard(cardData));
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
      clearValidation(cardForm, validationSettings);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
};

// --- Слушатели событий ---
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
confirmDeleteForm.addEventListener("submit", handleConfirmDeleteSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

// Настраиваем закрытие всех попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

// --- Инициализация приложения ---
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(createCard(cardData));
    });
  })
  .catch((err) => console.log(err));