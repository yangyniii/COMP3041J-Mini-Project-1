// 用户提交表单的逻辑 [cite: 10]
const handleSubmit = async (formData) => {
  const response = await fetch('http://localhost:5001/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return response.json();
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const result = document.getElementById('result');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form));
    const data = await handleSubmit(formData);
    result.textContent = JSON.stringify(data, null, 2);
  });
});