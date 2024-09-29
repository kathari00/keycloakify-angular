import { DefaultPage } from 'keycloakify-angular/account';
import { ClassKey } from 'keycloakify/account';
import { KcContext } from './KcContext';

const classes = {} satisfies { [key in ClassKey]?: string };

const KcPage = async (pageId: KcContext['pageId']) => {
  const doUseDefaultCss = true;
  const doMakeUserConfirmPassword = true;
  switch (pageId) {
    default:
      return DefaultPage(pageId, doMakeUserConfirmPassword, doUseDefaultCss, classes);
  }
};

export default KcPage;
