// Create Helpers object
const Helpers = {
  // DOM Manipulation
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });

    // Add children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });

    return element;
  },

  // Event Handling
  delegate(element, eventType, selector, handler) {
    element.addEventListener(eventType, event => {
      const target = event.target.closest(selector);
      if (target && element.contains(target)) {
        handler.call(target, event);
      }
    });
  },

  // Safe text for HTML and quoted attributes in template strings.
  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Data Handling
  async fetchData(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },

  // Storage
  storage: {
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },

    get(key) {
      const value = localStorage.getItem(key);
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },

    remove(key) {
      localStorage.removeItem(key);
    }
  },

  // Validation
  validate: {
    email(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    required(value) {
      return value !== null && value !== undefined && value !== '';
    }
  },

  // Formatting
  format: {
    date(date, format = 'DD/MM/YYYY') {
      const d = new Date(date);
      return format
        .replace('DD', String(d.getDate()).padStart(2, '0'))
        .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
        .replace('YYYY', d.getFullYear());
    },

    currency(value, locale = 'pt-BR', currency = 'BRL') {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
      }).format(value);
    }
  },

  slugify(text) {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }
};

// Register helpers with core
if (window.core) {
  window.core.helpers = Helpers;
} else {
  // If core is not available yet, wait for it
  document.addEventListener('DOMContentLoaded', () => {
    if (window.core) {
      window.core.helpers = Helpers;
    }
  });
} 