import { useState } from "react";

const useNavbarLogic = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return { isOpen, toggleMenu };
};

export default useNavbarLogic;
