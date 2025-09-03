import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, HStack } from '@chakra-ui/react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <HStack spacing={2}>
      <Button size="sm" onClick={() => handleChangeLanguage('en')}>EN</Button>
      <Button size="sm" onClick={() => handleChangeLanguage('hi')}>HI</Button>
      <Button size="sm" onClick={() => handleChangeLanguage('ta')}>TA</Button>
      <Button size="sm" onClick={() => handleChangeLanguage('te')}>TE</Button>
    </HStack>
  );
};

export default LanguageSwitcher;