import { useIntl, defineMessages } from 'react-intl';
import { Button, Dropdown, Item, Flexbox } from 'react-basics';
import useLocale from 'hooks/useLocale';
import { DEFAULT_LOCALE } from 'lib/constants';
import { languages } from 'lib/lang';

const messages = defineMessages({
  reset: { id: 'label.reset', defaultMessage: 'Reset' },
});

export default function LanguageSetting() {
  const { formatMessage } = useIntl();
  const { locale, saveLocale } = useLocale();
  const options = Object.keys(languages);

  const handleReset = () => saveLocale(DEFAULT_LOCALE);

  const renderValue = value => languages[value].label;

  return (
    <Flexbox width={400} gap={10}>
      <Dropdown items={options} value={locale} renderValue={renderValue} onChange={saveLocale}>
        {item => <Item key={item}>{languages[item].label}</Item>}
      </Dropdown>
      <Button onClick={handleReset}>{formatMessage(messages.reset)}</Button>
    </Flexbox>
  );
}
