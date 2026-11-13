
export default class NotificationsUI {
  constructor({
    containerSelector = '#notifications-container',
    maxNotifications = 50,
    onChange = null
  } = {}) {
    this.container = document.querySelector(containerSelector);
    this.maxNotifications = Math.max(1, maxNotifications);
    this.onChange = onChange;

    this.notifications = [];
    this.nextId = 1;
    this.filter = 'all';

    this.handleClick = this.handleClick.bind(this);

    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('Notifications container not found.');
      return;
    }

    this.container.addEventListener('click', this.handleClick);
    this.render();
  }

  add({
    title = 'اعلان جدید',
    message = '',
    type = 'info',
    read = false,
    createdAt = Date.now()
  } = {}) {
    const allowedTypes = ['info', 'success', 'warning', 'error'];

    if (!allowedTypes.includes(type)) {
      type = 'info';
    }

    const notification = {
      id: this.nextId++,
      title: String(title),
      message: String(message),
      type,
      read: Boolean(read),
      createdAt: Number(createdAt) || Date.now()
    };

    this.notifications.unshift(notification);

    if (this.notifications.length > this.maxNotifications) {
      this.notifications.length = this.maxNotifications;
    }

    this.notifyChange();
    this.render();

    return notification.id;
  }

  success(title, message = '') {
    return this.add({ title, message, type: 'success' });
  }

  error(title, message = '') {
    return this.add({ title, message, type: 'error' });
  }

  warning(title, message = '') {
    return this.add({ title, message, type: 'warning' });
  }

  info(title, message = '') {
    return this.add({ title, message, type: 'info' });
  }

  markAsRead(id) {
    const notification = this.notifications.find(
      item => item.id === Number(id)
    );

    if (!notification || notification.read) return false;

    notification.read = true;

    this.notifyChange();
    this.render();

    return true;
  }

  markAllAsRead() {
    let changed = false;

    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        changed = true;
      }
    });

    if (changed) {
      this.notifyChange();
      this.render();
    }

    return changed;
  }

  remove(id) {
    const previousLength = this.notifications.length;

    this.notifications = this.notifications.filter(
      item => item.id !== Number(id)
    );

    const changed = previousLength !== this.notifications.length;

    if (changed) {
      this.notifyChange();
      this.render();
    }

    return changed;
  }

  clear() {
    this.notifications = [];

    this.notifyChange();
    this.render();
  }

  setFilter(filter) {
    const allowed = ['all', 'unread', 'read'];

    if (!allowed.includes(filter)) return false;

    this.filter = filter;
    this.render();

    return true;
  }

  getFilteredNotifications() {
    if (this.filter === 'unread') {
      return this.notifications.filter(item => !item.read);
    }

    if (this.filter === 'read') {
      return this.notifications.filter(item => item.read);
    }

    return [...this.notifications];
  }

  getUnreadCount() {
    return this.notifications.filter(item => !item.read).length;
  }

  getAll() {
    return this.notifications.map(item => ({ ...item }));
  }

  escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  formatDate(timestamp) {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(timestamp));
  }

  getIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    return icons[type] || icons.info;
  }

  render() {
    if (!this.container) return;

    const notifications = this.getFilteredNotifications();

    this.container.innerHTML = `
      <section class="notifications-panel">
        <header class="notifications-panel__header">
          <div>
            <h2>اعلان‌ها</h2>
            <p>
              ${this.getUnreadCount()} اعلان خوانده‌نشده
            </p>
          </div>

          <button
            type="button"
            data-notification-action="read-all"
          >
            خواندن همه
          </button>
        </header>

        <nav class="notifications-filters">
          <button
            type="button"
            data-notification-filter="all"
            class="${this.filter === 'all' ? 'is-active' : ''}"
          >
            همه
          </button>

          <button
            type="button"
            data-notification-filter="unread"
            class="${this.filter === 'unread' ? 'is-active' : ''}"
          >
            خوانده‌نشده
          </button>

          <button
            type="button"
            data-notification-filter="read"
            class="${this.filter === 'read' ? 'is-active' : ''}"
          >
            خوانده‌شده
          </button>
        </nav>

        <div class="notifications-list">
          ${
            notifications.length
              ? notifications.map(item => `
                <article
                  class="
                    notification-item
                    notification-item--${item.type}
                    ${item.read ? 'is-read' : 'is-unread'}
                  "
                >
                  <span class="notification-item__icon">
                    ${this.getIcon(item.type)}
                  </span>

                  <div class="notification-item__content">
                    <h3>${this.escapeHTML(item.title)}</h3>
                    <p>${this.escapeHTML(item.message)}</p>
                    <time>
                      ${this.escapeHTML(this.formatDate(item.createdAt))}
                    </time>
                  </div>

                  <div class="notification-item__actions">
                    ${
                      !item.read
                        ? `
                          <button
                            type="button"
                            data-notification-read="${item.id}"
                            aria-label="علامت‌گذاری به‌عنوان خوانده‌شده"
                          >
                            ✓
                          </button>
                        `
                        : ''
                    }

                    <button
                      type="button"
                      data-notification-remove="${item.id}"
                      aria-label="حذف اعلان"
                    >
                      ×
                    </button>
                  </div>
                </article>
              `).join('')
              : `
                <div class="notifications-empty">
                  <span>🔔</span>
                  <p>اعلانی برای نمایش وجود ندارد.</p>
                </div>
              `
          }
        </div>

        ${
          this.notifications.length
            ? `
              <footer class="notifications-panel__footer">
                <button
                  type="button"
                  data-notification-action="clear"
                >
                  پاک کردن همه اعلان‌ها
                </button>
              </footer>
            `
            : ''
        }
      </section>
    `;
  }

  handleClick(event) {
    const target = event.target.closest('button');

    if (!target || !this.container.contains(target)) return;

    const filter = target.dataset.notificationFilter;
    const readId = target.dataset.notificationRead;
    const removeId = target.dataset.notificationRemove;
    const action = target.dataset.notificationAction;

    if (filter) {
      this.setFilter(filter);
      return;
    }

    if (readId) {
      this.markAsRead(readId);
      return;
    }

    if (removeId) {
      this.remove(removeId);
      return;
    }

    if (action === 'read-all') {
      this.markAllAsRead();
      return;
    }

    if (action === 'clear') {
      this.clear();
    }
  }

  notifyChange() {
    if (typeof this.onChange === 'function') {
      this.onChange({
        notifications: this.getAll(),
        unreadCount: this.getUnreadCount()
      });
    }
  }

  refresh() {
    this.render();
  }

  destroy() {
    if (this.container) {
      this.container.removeEventListener('click', this.handleClick);
      this.container.innerHTML = '';
    }

    this.container = null;
    this.onChange = null;
  }
}
