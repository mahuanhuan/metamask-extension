import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
import * as Sentry from '@sentry/browser';
import { I18nProvider, LegacyI18nProvider } from '../contexts/i18n';
import {
  MetaMetricsProvider,
  LegacyMetaMetricsProvider,
} from '../contexts/metametrics';
import { MetamaskNotificationsProvider } from '../contexts/metamask-notifications';
import { CurrencyRateProvider } from '../contexts/currencyRate';
import ErrorPage from './error';
import Routes from './routes';

class Index extends PureComponent {
  // state初始化组件的状态对象,这个状态主要用于保存应用中遇到的错误信息。
  state = {};

  // 子组件抛出错误时调用，将错误信息存储到 state 中的 error 属性
  static getDerivedStateFromError(error) {
    return { error };
  }

  // componentDidCatch(error) 方法会捕获错误并调用 Sentry.captureException(error) 来将错误信息发送到 Sentry 平台，以便进行错误跟踪和监控
  componentDidCatch(error) {
    // Sentry 捕获应用中的错误
    Sentry.captureException(error);
  }

  render() {
    const { error, errorId } = this.state;
    const { store } = this.props;

    if (error) {
      return (
        <Provider store={store}>
          <I18nProvider>
            <LegacyI18nProvider>
              <ErrorPage error={error} errorId={errorId} />
            </LegacyI18nProvider>
          </I18nProvider>
        </Provider>
      );
    }

    return (
      <Provider store={store}>
        <HashRouter hashType="noslash">
          <CompatRouter>
            <MetaMetricsProvider>
              <LegacyMetaMetricsProvider>
                <I18nProvider>
                  <LegacyI18nProvider>
                    <CurrencyRateProvider>
                      <MetamaskNotificationsProvider>
                        <Routes />
                      </MetamaskNotificationsProvider>
                    </CurrencyRateProvider>
                  </LegacyI18nProvider>
                </I18nProvider>
              </LegacyMetaMetricsProvider>
            </MetaMetricsProvider>
          </CompatRouter>
        </HashRouter>
      </Provider>
    );
  }
}

Index.propTypes = {
  store: PropTypes.object,
};

export default Index;
