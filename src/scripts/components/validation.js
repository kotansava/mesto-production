const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  if (errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
  }
};

const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.remove(settings.errorClass);
  }
};

const checkInputValidity = (formElement, inputElement, settings) => {
  // Используем встроенную валидацию по атрибуту pattern из HTML
  if (inputElement.validity.patternMismatch && inputElement.dataset.errorMessage) {
    showInputError(
      formElement,
      inputElement,
      inputElement.dataset.errorMessage,
      settings
    );
  } else if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
  } else {
    hideInputError(formElement, inputElement, settings);
  }
};

const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => !inputElement.validity.valid);
};

const disableSubmitButton = (buttonElement, settings) => {
  if (!buttonElement) return;
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, settings) => {
  if (!buttonElement) return;
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

const toggleButtonState = (inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};

// Вспомогательный метод для очистки дублирующихся замен пробелов
const normalizeSpaces = (value, trimRegex) => {
  return value.replace(trimRegex, '').replace(/ {2,}/g, ' ');
};

const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  formElement.addEventListener('submit', () => {
    inputList.forEach((inputElement) => {
      const normalized = normalizeSpaces(inputElement.value, /\s+$/u);
      if (normalized !== inputElement.value) {
        inputElement.value = normalized;
      }
      checkInputValidity(formElement, inputElement, settings);
    });
    toggleButtonState(inputList, buttonElement, settings);
  });

  toggleButtonState(inputList, buttonElement, settings);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      if (inputElement._isTrimming) return;

      const oldValue = inputElement.value;
      const cleanedValue = normalizeSpaces(oldValue, /^\s+/u);

      if (cleanedValue !== oldValue) {
        inputElement._isTrimming = true;
        inputElement.value = cleanedValue;
        inputElement._isTrimming = false;
      }
      
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });

  disableSubmitButton(buttonElement, settings);
};

export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
};