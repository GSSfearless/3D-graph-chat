import en from '../locales/en';
import zh from '../locales/zh';

class I18nManager {
  constructor() {
    this.translations = { en, zh };
    this.currentLocale = this.detectLanguage();
  }

  // 检测用户语言
  detectLanguage() {
    // 优先使用用户设置的语言
    const savedLocale = localStorage.getItem('preferred-locale');
    if (savedLocale && this.translations[savedLocale]) {
      return savedLocale;
    }

    // 其次使用浏览器语言
    const browserLang = navigator.language.toLowerCase().split('-')[0];
    if (this.translations[browserLang]) {
      return browserLang;
    }

    // 默认使用英语
    return 'en';
  }

  // 切换语言
  setLocale(locale) {
    if (this.translations[locale]) {
      this.currentLocale = locale;
      localStorage.setItem('preferred-locale', locale);
      // 触发语言变更事件
      window.dispatchEvent(new CustomEvent('localeChange', { detail: { locale } }));
    }
  }

  // 获取翻译
  t(key, params = {}) {
    try {
      const keys = key.split('.');
      let value = this.translations[this.currentLocale];
      
      for (const k of keys) {
        value = value[k];
        if (value === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }

      // 替换参数
      if (typeof value === 'string') {
        return value.replace(/\{\{(\w+)\}\}/g, (_, param) => {
          return params[param] !== undefined ? params[param] : `{{${param}}}`;
        });
      }

      return value;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  }

  // 获取当前语言
  getCurrentLocale() {
    return this.currentLocale;
  }

  // 获取支持的语言列表
  getSupportedLocales() {
    return Object.keys(this.translations);
  }

  // 检查是否支持某种语言
  isLocaleSupported(locale) {
    return !!this.translations[locale];
  }

  // 获取语言的本地化名称
  getLocaleName(locale) {
    const names = {
      en: 'English',
      zh: '中文'
    };
    return names[locale] || locale;
  }

  // 格式化日期
  formatDate(date, options = {}) {
    try {
      return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return date.toString();
    }
  }

  // 格式化数字
  formatNumber(number, options = {}) {
    try {
      return new Intl.NumberFormat(this.currentLocale, options).format(number);
    } catch (error) {
      console.error('Number formatting error:', error);
      return number.toString();
    }
  }
}

// 创建单例实例
const i18n = new I18nManager();

// 导出实例和类
export { i18n, I18nManager };

// 导出便捷函数
export const t = (key, params) => i18n.t(key, params);
export const setLocale = (locale) => i18n.setLocale(locale);
export const getCurrentLocale = () => i18n.getCurrentLocale();
export const getSupportedLocales = () => i18n.getSupportedLocales();
export const formatDate = (date, options) => i18n.formatDate(date, options);
export const formatNumber = (number, options) => i18n.formatNumber(number, options); 