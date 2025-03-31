import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Извините, страница не найдена"
      extra={
        <Button type="primary">
          <Link to="/">Вернуться на главную</Link>
        </Button>
      }
    />
  );
};

export default NotFound; 