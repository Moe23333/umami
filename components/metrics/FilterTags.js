import classNames from 'classnames';
import { safeDecodeURI } from 'next-basics';
import { Button, Icon } from 'react-basics';
import Times from 'assets/times.svg';
import styles from './FilterTags.module.css';

export default function FilterTags({ className, params, onClick }) {
  if (Object.keys(params).filter(key => params[key]).length === 0) {
    return null;
  }
  return (
    <div className={classNames(styles.filters, 'col-12', className)}>
      {Object.keys(params).map(key => {
        if (!params[key]) {
          return null;
        }
        return (
          <div key={key} className={styles.tag}>
            <Button onClick={() => onClick(key)} variant="action" iconRight>
              {`${key}: ${safeDecodeURI(params[key])}`}
              <Icon>
                <Times />
              </Icon>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
