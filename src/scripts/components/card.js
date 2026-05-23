const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

// Метод удаления элемента карточки из DOM
export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

// Метод обновления лайков на UI
export const updateLikeStatus = (likeButton, likeCountElement, updatedLikes) => {
  likeButton.classList.toggle("card__like-button_is-active");
  likeCountElement.textContent = updatedLikes.length;
};

export const createCardElement = (
  data,
  currentUserId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  likeCount.textContent = data.likes.length;

  const isLikedInitial = data.likes.some((user) => user._id === currentUserId);
  if (isLikedInitial) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      // Определяем статус лайка в момент клика и передаем параметром в колбэк
      const isLiked = likeButton.classList.contains("card__like-button_is-active");
      onLikeIcon(likeButton, data._id, likeCount, isLiked);
    });
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};