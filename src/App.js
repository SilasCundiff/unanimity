import React, { useState } from 'react';
import './App.scss';
import DOMPurify from 'dompurify';
import { ThemeProvider } from '@material-ui/core/styles';
import { AnimatePresence } from 'framer-motion';
import {
  BrowserRouter, Switch, Route, Redirect,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { setNotification } from './redux/actions';
import CheckIfAuthenticatedSwitch from './containers/CheckIfAuthenticatedSwitch/CheckIfAuthenticatedSwitch';
import './fonts/Jost-VariableFont_ital,wght.ttf';
import './fonts/Montserrat-Regular.ttf';
import LandingPage from './components/landingPage/LandingPage';
import ContactForm from './components/ContactForm/ContactForm';
import FAQPage from './components/FAQPage/FAQPage';
import CustomAlert from './components/CustomAlert/CustomAlert';
import { LightTheme, DarkTheme } from './Theme';

const mapStateToProps = state => ({ notification: state.messenger.notification });

const mapDispatchToProps = { setNotification: notification => setNotification(notification) };

const App = (props) => {
  const [isAppLightTheme, setIsAppLightTheme] = useState(true);

  const toggleIsAppLightTheme = () => {
    setIsAppLightTheme(!isAppLightTheme);
  };

  const showHideCustomAlert = (message, success) => {
    const closeNotification = () => props.setNotification(null);
    let sanitizedAlertMessage = DOMPurify.sanitize(message);
    // only allows words, spaces, !, ?, $
    sanitizedAlertMessage = sanitizedAlertMessage.replace(/[^\w\s!?$]/g, '');
    const alertComponent = <CustomAlert alertMessage={sanitizedAlertMessage} alertClose={closeNotification} isSuccess={success} />;
    props.setNotification(alertComponent);
  };

  /* Animation styles for Framer Motion */
  const pageAnimationVariants = {
    initial: {
      opacity: 0,
      x: '-20vw',
      scale: 0.8,
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      x: '100vw',
      scale: 1.2,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <ThemeProvider theme={isAppLightTheme ? LightTheme : DarkTheme}>
      <main className="App">
        {props.notification}
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <AnimatePresence>
                <LandingPage
                  pageAnimationVariants={pageAnimationVariants}
                  pageTransition={pageTransition}
                />
              </AnimatePresence>
            </Route>
            <Route path="/contact">
              <AnimatePresence>
                <ContactForm
                  pageAnimationVariants={pageAnimationVariants}
                  pageTransition={pageTransition}
                  showHideCustomAlert={showHideCustomAlert}
                />
              </AnimatePresence>
            </Route>
            <Route path="/login">
              <AnimatePresence>
                <CheckIfAuthenticatedSwitch
                  pageAnimationVariants={pageAnimationVariants}
                  pageTransition={pageTransition}
                  showHideCustomAlert={showHideCustomAlert}
                  isAppLightTheme={isAppLightTheme}
                  setIsAppLightTheme={toggleIsAppLightTheme}
                />
              </AnimatePresence>
            </Route>
            <Route path="/FAQ">
              <AnimatePresence>
                <FAQPage
                  pageAnimationVariants={pageAnimationVariants}
                  pageTransition={pageTransition}
                />
              </AnimatePresence>
            </Route>
            <Redirect to="/" />
          </Switch>
        </BrowserRouter>
      </main>
    </ThemeProvider>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
