import React, { useState } from 'react';
import { Collapse, Input, Card } from 'antd';

const { Panel } = Collapse;
const { Search } = Input;

const faqData = [
  {
    category: 'Общие вопросы',
    questions: [
      { key: '1', question: 'Как добавить новый кошелёк?', answer: 'Перейдите в раздел "Кошельки" и нажмите кнопку "Добавить кошелёк".' },
      { key: '2', question: 'Как изменить баланс кошелька?', answer: 'Баланс обновляется автоматически при переводах. Вручную изменить баланс нельзя.' },
    ],
  },
  {
    category: 'Операции',
    questions: [
      { key: '3', question: 'Как пополнить баланс?', answer: 'Используйте кнопку "Пополнить" в разделе "Кошельки".' },
      { key: '4', question: 'Как вывести средства?', answer: 'Перейдите в "Кошельки" и выберите нужный кошелёк, затем нажмите "Вывести".' },
    ],
  },
  {
    category: 'Безопасность',
    questions: [
      { key: '5', question: 'Как защитить аккаунт?', answer: 'Рекомендуем включить 2FA и использовать сложные пароли.' },
      { key: '6', question: 'Что делать, если я забыл пароль?', answer: 'Используйте функцию восстановления пароля на странице входа.' },
    ],
  },
];

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация вопросов по поисковому запросу
  const filteredFaqData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase())),
  })).filter(category => category.questions.length > 0); // Убираем пустые категории

  return (
    <div style={{ padding: '10px 20px', marginTop: '60px' }}>
      <Card title="Часто задаваемые вопросы (FAQ)">
        <Search
          placeholder="Поиск по вопросам..."
          allowClear
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '15px', width: '100%' }}
        />

        {filteredFaqData.length > 0 ? (
          filteredFaqData.map(category => (
            <Card key={category.category} title={category.category} style={{ marginBottom: '10px' }}>
              <Collapse accordion>
                {category.questions.map(({ key, question, answer }) => (
                  <Panel header={question} key={key}>
                    <p>{answer}</p>
                  </Panel>
                ))}
              </Collapse>
            </Card>
          ))
        ) : (
          <p style={{ textAlign: 'center', fontSize: '16px', color: 'gray' }}>Ничего не найдено...</p>
        )}
      </Card>
    </div>
  );
};

export default FAQ;
