// Нажатие на кнопку или поле внутри объекта не должно начинать его перетаскивание
export const stopDrag = (event) => event.stopPropagation();
