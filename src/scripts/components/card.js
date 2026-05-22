const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
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

  // Отображение количества лайков
  likeCount.textContent = data.likes.length;

  // Проверка: лайкнул ли карточку текущий пользователь
  const isLiked = data.likes.some((user) => user._id === currentUserId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Если карточка создана не нами, удаляем иконку корзины
  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton, data._id, likeCount));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};