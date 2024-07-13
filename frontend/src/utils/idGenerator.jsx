import { v4 as uuidv4 } from 'uuid';

export const generateUniqueId = (layout) => {
  if (!layout) {
    return uuidv4();
  }
  
  let element_id;
  do {
    element_id = uuidv4();
  } while (layout.some((item) => item.element_id === element_id));
  
  return element_id;
};