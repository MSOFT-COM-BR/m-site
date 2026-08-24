(() => {
  function createDialog({ content, className, onClose, initialFocus }) {
    const dialog = document.createElement('dialog');
    if (className) dialog.className = className;
    dialog.append(content);

    const close = () => {
      if (dialog.open) dialog.close();
    };
    content.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', close));
    dialog.addEventListener('close', () => {
      dialog.remove();
      onClose?.();
    }, { once: true });
    document.body.append(dialog);

    return {
      element: dialog,
      open: () => {
        dialog.showModal();
        const target = initialFocus || content.querySelector('[data-initial-focus], input:not([type="hidden"]), select, textarea, button');
        requestAnimationFrame(() => target?.focus());
      },
      close,
    };
  }

  function createCrudForm({ entity, title, fields, item = {}, classNames = {} }) {
    const form = document.createElement('form');
    form.className = classNames.form || '';
    form.dataset.entity = entity;

    const header = document.createElement('header');
    header.className = classNames.header || '';
    const heading = document.createElement('h2');
    heading.textContent = `${item.uuid || item.id ? 'Editar' : 'Cadastrar'} ${title}`;
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.dataset.close = '';
    closeButton.setAttribute('aria-label', 'Fechar formulário');
    closeButton.textContent = '×';
    header.append(heading, closeButton);
    form.append(header);

    const grid = document.createElement('div');
    grid.className = classNames.grid || '';
    fields.forEach(([name, labelText, type = 'text', required]) => {
      const label = document.createElement('label');
      label.textContent = labelText;
      const control = document.createElement(type === 'textarea' ? 'textarea' : 'input');
      control.name = name;
      if (type !== 'textarea') control.type = type;
      control.required = Boolean(required);
      if (item[name] !== undefined) control.value = item[name];
      label.append(control);
      grid.append(label);
    });
    form.append(grid);

    const footer = document.createElement('footer');
    footer.className = classNames.footer || '';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.dataset.close = '';
    cancel.textContent = 'Cancelar';
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = classNames.submit || '';
    submit.textContent = 'Salvar';
    footer.append(cancel, submit);
    form.append(footer);
    return form;
  }

  window.MSoftComponents = Object.freeze({ createCrudForm, createDialog });
})();
