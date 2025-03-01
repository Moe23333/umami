import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Menu from './Menu';
import useDocumentClick from 'hooks/useDocumentClick';
import Chevron from 'assets/chevron-down.svg';
import styles from './Dropdown.module.css';
import { Icon } from 'react-basics';

function DropDown({ value, className, menuClassName, options = [], onChange = () => {} }) {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef();
  const selectedOption = options.find(e => e.value === value);

  function handleShowMenu() {
    setShowMenu(state => !state);
  }

  function handleSelect(selected, e) {
    e.stopPropagation();
    setShowMenu(false);

    onChange(selected);
  }

  useDocumentClick(e => {
    if (!ref.current?.contains(e.target)) {
      setShowMenu(false);
    }
  });

  return (
    <div ref={ref} className={classNames(styles.dropdown, className)} onClick={handleShowMenu}>
      <div className={styles.value}>
        <div className={styles.text}>{options.find(e => e.value === value)?.label || value}</div>
        <Icon className={styles.icon} size="small">
          <Chevron />
        </Icon>
      </div>
      {showMenu && (
        <Menu
          className={menuClassName}
          options={options}
          selectedOption={selectedOption}
          onSelect={handleSelect}
          float="bottom"
        />
      )}
    </div>
  );
}

DropDown.propTypes = {
  value: PropTypes.any,
  className: PropTypes.string,
  menuClassName: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.node,
    }),
  ),
  onChange: PropTypes.func,
};

export default DropDown;
