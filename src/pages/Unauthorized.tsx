import React from 'react';
import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Извините, у вас нет доступа к этой странице"
      extra={
        <Button type="primary">
          <Link to="/">Вернуться на главную</Link>
        </Button>
      }
    />
  );
};

export default Unauthorized; 