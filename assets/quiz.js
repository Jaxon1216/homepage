document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-feedback]')
  if (!button) return
  const output = button.closest('.quiz').querySelector('.feedback')
  output.textContent = button.dataset.feedback
})
