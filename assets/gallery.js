const dialog = document.querySelector('#screenshot-viewer');

if (dialog?.showModal) {
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  let opener;

  document.querySelectorAll('[data-screenshot]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      caption.textContent = link.nextElementSibling.textContent;
      dialog.showModal();
    });
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    opener?.focus();
  });
}
